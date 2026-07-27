import { CommonModule } from '@angular/common';

import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Router } from '@angular/router';

import { FileUploadComponent } from '../../shared/file-upload/file-upload';

import { Header } from '../../layout/header/header';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Footer } from '../../layout/footer/footer';

import { LeaveService } from '../../services/leave.service';
import { ChangeDetectorRef } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button';
import { FormFieldComponent } from '../../shared/form-field/form-field';
import { Toast } from '../../shared/toast/toast';

@Component({
  selector: 'app-leave-apply',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    Header,
    Sidebar,
    Footer,
    ButtonComponent,
    FormFieldComponent,
    Toast,
    FileUploadComponent,
  ],

  templateUrl: './leave-apply.html',

  styleUrl: './leave-apply.css',
})
export class ApplyLeaveComponent implements OnInit {
  employeeId: number | null = null;

  isSubmitting = false;

  medicalCertificate: File | null = null;

  toastVisible = false;

  toastMessage = '';

  toastType: 'success' | 'error' = 'success';

  leaveTypes: string[] = [
    'Casual Leave',

    'Sick Leave',

    'Paid Leave',

    'Emergency Leave',

    'Work From Home',
  ];

  applyLeaveForm: FormGroup;

  constructor(
    private fb: FormBuilder,

    private leaveService: LeaveService,

    private router: Router,

    private cdr: ChangeDetectorRef
  ) {
    this.applyLeaveForm = this.fb.group({
      leaveType: ['', Validators.required],

      fromDate: ['', Validators.required],

      toDate: ['', Validators.required],

      reason: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    const storedEmployeeId = localStorage.getItem('employeeId');

    if (storedEmployeeId) {
      this.employeeId = Number(storedEmployeeId);
    }
    this.leaveTypeControl.valueChanges.subscribe((leaveType) => {
      if (leaveType !== 'Sick Leave') {
        this.medicalCertificate = null;
      }
    });
  }

  onMedicalCertificateSelected(file: File | null): void {
    this.medicalCertificate = file;

    console.log('Selected Medical Certificate:', file);
  }
  get isSickLeave(): boolean {
    return this.leaveTypeControl.value?.toString().trim().toLowerCase() === 'sick leave';
  }

  get leaveTypeControl(): FormControl {
    return this.applyLeaveForm.get('leaveType') as FormControl;
  }

  get fromDateControl(): FormControl {
    return this.applyLeaveForm.get('fromDate') as FormControl;
  }

  get toDateControl(): FormControl {
    return this.applyLeaveForm.get('toDate') as FormControl;
  }

  get reasonControl(): FormControl {
    return this.applyLeaveForm.get('reason') as FormControl;
  }

  showToast(
    message: string,

    type: 'success' | 'error',
  ): void {
    this.toastMessage = message;

    this.toastType = type;

    this.toastVisible = true;
     this.cdr.detectChanges();

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  applyLeave(): void {
    // Check form validation

    if (this.applyLeaveForm.invalid) {
      this.applyLeaveForm.markAllAsTouched();

      return;
    }

    // Check employee ID

    if (!this.employeeId) {
      this.showToast(
        'Employee ID not found. Please login again.',

        'error',
      );

      return;
    }

    // Get form values

    const formValue = this.applyLeaveForm.getRawValue();

    // Convert dates

    const fromDate = new Date(formValue.fromDate);

    const toDate = new Date(formValue.toDate);

    // Validate dates

    if (toDate < fromDate) {
      this.showToast(
        'To Date cannot be before From Date.',

        'error',
      );

      return;
    }

    if (formValue.leaveType === 'Sick Leave' && !this.medicalCertificate) {
      this.showToast(
        'Please upload a medical certificate for Sick Leave.',

        'error',
      );

      return;
    }

    const formData = new FormData();

    formData.append(
      'LeaveType',

      formValue.leaveType,
    );

    formData.append(
      'FromDate',

      formValue.fromDate,
    );

    formData.append(
      'ToDate',

      formValue.toDate,
    );

    formData.append(
      'Reason',

      formValue.reason.trim(),
    );

    // Add medical certificate
    // only when file exists

    if (this.medicalCertificate) {
      formData.append(
        'medicalCertificate',

        this.medicalCertificate,

        this.medicalCertificate.name,
      );
    }

    this.isSubmitting = true;

    this.leaveService.applyLeave(formData).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.showToast(
          'Leave applied successfully.',

          'success',
        );

        // Reset form

        this.applyLeaveForm.reset({
          leaveType: '',

          fromDate: '',

          toDate: '',

          reason: '',
        });

        // Reset selected file

        this.medicalCertificate = null;

        // Navigate to My Leaves

        setTimeout(() => {
          this.router.navigate(['/my-leaves']);
        }, 1500);
      },

      error: (error: any) => {
        console.error(
          'Apply Leave Error:',

          error,
        );

        this.isSubmitting = false;

        this.showToast(
          error?.error?.message || 'Unable to apply leave.',

          'error',
        );
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/leave-apply']);
  }
}
