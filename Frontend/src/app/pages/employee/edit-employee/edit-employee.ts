import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule, NgForm } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { EmployeeService } from '../../../services/employee.service';

import { ButtonComponent } from '../../../shared/button/button';

import { Toast } from '../../../shared/toast/toast';

import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-edit-employee',

  standalone: true,

  imports: [CommonModule, FormsModule, ButtonComponent,  Toast],

  templateUrl: './edit-employee.html',

  styleUrls: ['./edit-employee.css'],
})
export class EditEmployeeComponent implements OnInit {
  toastVisible = false;
toastMessage = '';
toastType: 'success' | 'error' = 'success';
  employee: any = {};

  errorMessage = '';

  isSubmitting = false;

  departments: string[] = ['HR', 'IT', 'Finance', 'Admin', 'Sales', 'Marketing'];

  designationMap: Record<string, string[]> = {
    IT: ['Software Engineer', 'Senior Software Engineer', 'Team Lead', 'Project Manager'],

    HR: ['HR Executive', 'HR Manager', 'Recruiter'],

    Finance: ['Accountant', 'Senior Accountant', 'Finance Manager'],

    Admin: ['Admin Executive', 'Admin Manager'],

    Sales: ['Sales Executive', 'Sales Manager'],

    Marketing: ['Marketing Executive', 'Marketing Manager'],
  };

  designationOptions: string[] = [];

  constructor(
    private route: ActivatedRoute,

    private router: Router,

    private employeeService: EmployeeService,

    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.employeeService.getEmployeeById(id).subscribe({
      next: (response: any) => {
        console.log('EDIT EMPLOYEE API RESPONSE:', response);

        // Support both:
        // direct employee object
        // { data: employee }
        this.employee = response?.data ?? response;

        console.log('EMPLOYEE:', this.employee);

        console.log('DEPARTMENT:', this.employee.department);

        console.log('DESIGNATION:', this.employee.designation);

        this.employee.phone = String(this.employee.phone || '')
          .replace(/\D/g, '')
          .slice(0, 10);

        const departmentKey = Object.keys(this.designationMap).find(
          (key) =>
            key.trim().toLowerCase() ===
            String(this.employee.department || '')
              .trim()
              .toLowerCase(),
        );

        if (departmentKey) {
          this.employee.department = departmentKey;

          this.designationOptions = this.designationMap[departmentKey];
        } else {
          this.designationOptions = [];
        }

        console.log('DESIGNATION OPTIONS:', this.designationOptions);
      },

      error: (err: any) => {
        console.error('Get Employee Error:', err);

        this.errorMessage = 'Unable to load employee details.';
      },
    });
  }

  onDepartmentChange(): void {
    // Clear old designation
    this.employee.designation = '';

    // Load selected department
    // related designations
    this.designationOptions = this.designationMap[this.employee.department] || [];
  }

  onPhoneChange(value: string): void {
    this.employee.phone = String(value || '')
      .replace(/\D/g, '')
      .slice(0, 10);
  }
  showToast(message: string, type: 'success' | 'error'): void {
  this.toastMessage = message;
  this.toastType = type;
  this.toastVisible = true;
  this.cdr.detectChanges();


  setTimeout(() => {
    this.toastVisible = false;
  }, 3000);
}

  updateEmployee(form: NgForm): void {
    this.errorMessage = '';

    // Form validation
    if (form.invalid) {
      form.control.markAllAsTouched();

      return;
    }

    // Phone validation
    const phone = String(this.employee.phone || '').trim();

    if (!/^[0-9]{10}$/.test(phone)) {
      this.errorMessage = 'Phone number must be exactly 10 digits.';

      return;
    }

    // Department validation
    if (!this.employee.department) {
      this.errorMessage = 'Please select Department.';

      return;
    }

    // Designation validation
    if (!this.employee.designation) {
      this.errorMessage = 'Please select Designation.';

      return;
    }

    // Set cleaned phone
    this.employee.phone = phone;

    this.isSubmitting = true;

    // Update API
    this.employeeService.updateEmployee(this.employee).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.showToast('Employee Updated Successfully', 'error');

        this.router.navigate(['/employees']);
        this.cdr.detectChanges();

      },

      error: (err: any) => {
        this.isSubmitting = false;

        console.error('Update Employee Error:', err);

        this.errorMessage = err?.error?.message || 'Update Failed';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
