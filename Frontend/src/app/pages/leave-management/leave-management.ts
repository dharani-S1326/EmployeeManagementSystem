import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Header } from '../../layout/header/header';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Footer } from '../../layout/footer/footer';
import { LeaveService } from '../../services/leave.service';
import { Leave } from '../../models/leave.model';
import { ButtonComponent } from '../../shared/button/button';
import { FormFieldComponent } from '../../shared/form-field/form-field';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    FormFieldComponent,
    Header,
    Sidebar,
    Footer,
  ],
  templateUrl: './leave-management.html',
  styleUrl: './leave-management.css',
})
export class LeaveManagementComponent implements OnInit {
  leaves: Leave[] = [];
  displayedLeaves: Leave[] = [];

  activeTab: 'all' | 'my' | 'approval' = 'all';

  searchText = '';
  statusFilter = '';

  // isLoading = false;
  isSubmitting = false;

  showApplyModal = false;
  showApprovalModal = false;

  selectedLeave: Leave | null = null;

  approvalAction: 'approve' | 'reject' = 'approve';

  employeeId: number | null = null;

  approverId: number = Number(localStorage.getItem('employeeId')) || 1;

  leaveTypes: string[] = [
    'Casual Leave',
    'Sick Leave',
    'Paid Leave',
    'Emergency Leave',
    'Work From Home',
  ];

  applyLeaveForm: FormGroup;
  approvalForm: FormGroup;

  totalLeaves = 0;
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  constructor(
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.applyLeaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.approvalForm = this.fb.group({
      remarks: [''],
    });
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

  get remarksControl(): FormControl {
    return this.approvalForm.get('remarks') as FormControl;
  }

  ngOnInit(): void {
    this.loadLeaves();
    const storedEmployeeId = localStorage.getItem('employeeId');

    if (storedEmployeeId) {
      this.employeeId = Number(storedEmployeeId);
    }

    this.loadLeaves();
  }

  loadLeaves(): void {
    this.leaveService.getAllLeaves().subscribe({
      next: (response) => {
        this.leaves = response || [];

        this.updateCounts();

        this.applyFilters();
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error loading leave requests:', error);
      },
    });
  }

  updateCounts(): void {
    this.totalLeaves = this.leaves.length;

    this.pendingCount = this.leaves.filter(
      (leave) => leave.status?.toLowerCase() === 'pending',
    ).length;

    this.approvedCount = this.leaves.filter(
      (leave) => leave.status?.toLowerCase() === 'approved',
    ).length;

    this.rejectedCount = this.leaves.filter(
      (leave) => leave.status?.toLowerCase() === 'rejected',
    ).length;
  }

  applyFilters(): void {
    let result = [...this.leaves];

    if (this.activeTab === 'my') {
      result = result.filter((leave) => leave.employeeId === this.employeeId);
    }

    if (this.activeTab === 'approval') {
      result = result.filter((leave) => leave.status?.toLowerCase() === 'pending');
    }

    if (this.statusFilter) {
      result = result.filter(
        (leave) => leave.status?.toLowerCase() === this.statusFilter.toLowerCase(),
      );
    }

    const search = this.searchText.trim().toLowerCase();

    if (search) {
      result = result.filter(
        (leave) =>
          leave.employeeName?.toLowerCase().includes(search) ||
          leave.leaveType?.toLowerCase().includes(search) ||
          leave.reason?.toLowerCase().includes(search) ||
          leave.employeeId?.toString().includes(search),
      );
    }

    this.displayedLeaves = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  changeTab(tab: 'all' | 'my' | 'approval'): void {
    this.activeTab = tab;

    this.searchText = '';

    this.statusFilter = '';

    this.applyFilters();
  }

  openApplyModal(): void {
    this.applyLeaveForm.reset({
      leaveType: '',
      fromDate: '',
      toDate: '',
      reason: '',
    });

    this.showApplyModal = true;
  }

  closeApplyModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.showApplyModal = false;

    this.applyLeaveForm.reset();
  }

  applyLeave(): void {
    if (this.applyLeaveForm.invalid) {
      this.applyLeaveForm.markAllAsTouched();
      return;
    }

    if (this.employeeId === null) {
      alert('Employee ID not found for the logged-in user.');
      return;
    }

    const formValue = this.applyLeaveForm.getRawValue();

    const fromDate = new Date(formValue.fromDate);
    const toDate = new Date(formValue.toDate);

    if (toDate < fromDate) {
      alert('To Date cannot be before From Date.');
      return;
    }

    const requestData = new FormData();

    requestData.append('employeeId', this.employeeId.toString());

    requestData.append('leaveType', formValue.leaveType);

    requestData.append('fromDate', formValue.fromDate);

    requestData.append('toDate', formValue.toDate);

    requestData.append('reason', formValue.reason);

    this.isSubmitting = true;

    this.leaveService.applyLeave(requestData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showApplyModal = false;
        this.applyLeaveForm.reset();
        this.activeTab = 'my';

        this.loadLeaves();

        alert('Leave applied successfully.');
      },

      error: (error) => {
        console.error('Apply leave error:', error);

        this.isSubmitting = false;

        alert(error?.error?.message || 'Unable to apply leave.');
      },
    });
  }

  openApprovalModal(leave: Leave, action: 'approve' | 'reject'): void {
    this.selectedLeave = leave;

    this.approvalAction = action;

    this.approvalForm.reset({
      remarks: '',
    });

    this.showApprovalModal = true;
  }

  closeApprovalModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.showApprovalModal = false;

    this.selectedLeave = null;

    this.approvalForm.reset();
  }

  submitApproval(): void {
    if (!this.selectedLeave) {
      return;
    }

    const leaveId = this.selectedLeave.leaveId;

    const enteredRemarks = this.approvalForm.get('remarks')?.value;

    const remarks: string =
      enteredRemarks?.trim() || (this.approvalAction === 'approve' ? 'Approved' : 'Rejected');

    this.isSubmitting = true;

    if (this.approvalAction === 'approve') {
      this.leaveService.approveLeave(leaveId, remarks).subscribe({
        next: () => {
          this.isSubmitting = false;

          this.showApprovalModal = false;

          this.selectedLeave = null;

          this.approvalForm.reset();

          this.loadLeaves();

          alert('Leave approved successfully.');
        },

        error: (error: any) => {
          console.error('Approve Leave Error:', error);

          this.isSubmitting = false;

          alert(error?.error?.message || 'Unable to approve leave.');
        },
      });
    } else {
      this.leaveService.rejectLeave(leaveId, remarks).subscribe({
        next: () => {
          this.isSubmitting = false;

          this.showApprovalModal = false;

          this.selectedLeave = null;

          this.approvalForm.reset();

          this.loadLeaves();

          alert('Leave rejected successfully.');
        },

        error: (error: any) => {
          console.error('Reject Leave Error:', error);

          this.isSubmitting = false;

          alert(error?.error?.message || 'Unable to reject leave.');
        },
      });
    }
  }
  trackByLeaveId(index: number, leave: Leave): number {
    return leave.leaveId;
  }
}
