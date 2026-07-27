import { CommonModule } from '@angular/common';

import { Component, EventEmitter, Output } from '@angular/core';

import { FormGroup } from '@angular/forms';

import { Router } from '@angular/router';

import { EmployeeService } from '../../../services/employee.service';

import { ButtonComponent } from '../../../shared/button/button';

import { DynamicFormComponent, DynamicFormField } from '../../../shared/dynamic-form/dynamic-form';

@Component({
  selector: 'app-add-employee',

  standalone: true,

  imports: [CommonModule, ButtonComponent, DynamicFormComponent],

  templateUrl: './add-employee.html',

  styleUrls: ['./add-employee.css'],
})
export class AddEmployeeComponent {
  @Output()
  close = new EventEmitter<void>();

  successMessage = '';

  errorMessage = '';

  isSubmitting = false;

  employeeForm!: FormGroup;

  departments: string[] = ['HR', 'IT', 'Finance', 'Admin', 'Sales', 'Marketing'];

  designationMap: Record<string, string[]> = {
    IT: ['Software Engineer', 'Senior Software Engineer', 'Team Lead', 'Project Manager'],

    HR: ['HR Executive', 'HR Manager', 'Recruiter'],

    Finance: ['Accountant', 'Senior Accountant', 'Finance Manager'],

    Admin: ['Admin Executive', 'Admin Manager'],

    Sales: ['Sales Executive', 'Sales Manager'],

    Marketing: ['Marketing Executive', 'Marketing Manager'],
  };

  employeeFormFields: DynamicFormField[] = [
    {
      name: 'name',

      label: 'Name',

      type: 'text',

      placeholder: 'Enter Employee Name',

      required: true,

      errorMessage: 'Name is required.',
    },

    {
      name: 'email',

      label: 'Email',

      type: 'email',

      placeholder: 'example@gmail.com',

      required: true,

      errorMessage: 'Please enter a valid email.',
    },

    {
      name: 'phone',

      label: 'Phone',

      type: 'text',

      placeholder: 'Enter 10 digit phone number',

      required: true,

      minLength: 10,

      maxLength: 10,

      pattern: '^[6-9][0-9]{9}$',

      errorMessage: 'Enter a valid 10 digit mobile number starting with 6, 7, 8 or 9.',
    },

    {
      name: 'department',

      label: 'Department',

      type: 'select',

      placeholder: 'Select Department',

      options: this.departments,

      required: true,

      errorMessage: 'Please select Department.',
    },

    {
      name: 'designation',

      label: 'Designation',

      type: 'select',

      placeholder: 'Select Designation',

      options: [],

      required: true,

      disabled: true,

      errorMessage: 'Please select Designation.',
    },

    {
      name: 'salary',

      label: 'Salary',

      type: 'number',

      placeholder: 'Enter Salary',

      required: true,

      min: 1,

      errorMessage: 'Salary must be greater than 0.',
    },

    {
      name: 'role',

      label: 'Role',

      type: 'select',

      placeholder: 'Select Role',

      value: 'Employee',

      options: ['Admin', 'HR', 'Employee'],

      required: true,

      errorMessage: 'Please select Role.',
    },

    {
      name: 'password',

      label: 'Password',

      type: 'password',

      placeholder: 'Enter Password',

      required: true,

      minLength: 6,

      errorMessage: 'Password must contain at least 6 characters.',
    },

    {
      name: 'confirmPassword',

      label: 'Confirm Password',

      type: 'password',

      placeholder: 'Confirm Password',

      required: true,

      errorMessage: 'Confirm Password is required.',
    },
  ];

  constructor(
    private employeeService: EmployeeService,

    private router: Router,
  ) {}

  onFormReady(form: FormGroup): void {
    this.employeeForm = form;
  }

  onFieldChanged(event: { name: string; value: any }): void {
    if (event.name === 'phone') {
      const cleanedValue = String(event.value || '')
        .replace(/\D/g, '')

        .slice(0, 10);

      this.employeeForm.get('phone')?.setValue(cleanedValue, {
        emitEvent: false,
      });
    }

    if (event.name === 'department') {
      this.updateDesignationOptions(event.value);
    }
  }

  updateDesignationOptions(department: string): void {
    const designations = this.designationMap[department] || [];

    // Find designation JSON config

    const designationField = this.employeeFormFields.find((field) => field.name === 'designation');

    if (designationField) {
      designationField.options = designations;
    }

    const designationControl = this.employeeForm.get('designation');

    if (!designationControl) {
      return;
    }

    // Clear previous value

    designationControl.setValue('');

    // Enable / Disable

    if (designations.length > 0) {
      designationControl.enable();
    } else {
      designationControl.disable();
    }
  }

  saveEmployee(): void {
    this.successMessage = '';

    this.errorMessage = '';

    if (!this.employeeForm) {
      return;
    }

    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();

      return;
    }

    const formValue = this.employeeForm.getRawValue();

    if (!/^[6-9][0-9]{9}$/.test(formValue.phone)) {
      this.errorMessage = 'Enter a valid 10 digit mobile number starting with 6, 7, 8 or 9.';

      return;
    }

    if (formValue.password !== formValue.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';

      return;
    }

    const request = {
      name: formValue.name.trim(),

      email: formValue.email.trim().toLowerCase(),

      phone: formValue.phone,

      department: formValue.department,

      designation: formValue.designation,

      salary: Number(formValue.salary),

      role: formValue.role,

      password: formValue.password,

      confirmPassword: formValue.confirmPassword,
    };

    this.isSubmitting = true;

    this.employeeService.addEmployee(request).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.successMessage = 'Employee Added Successfully';

        this.resetForm();

        setTimeout(() => {
          this.close.emit();
        }, 1000);
      },

      error: (err: any) => {
        this.isSubmitting = false;

        console.error(
          'Add Employee Error:',

          err,
        );

        if (err.status === 401) {
          this.errorMessage = 'Please login again.';

          return;
        }

        if (err.status === 403) {
          this.errorMessage = 'Only Admin can add employees.';

          return;
        }

        this.errorMessage = err?.error?.message || err?.error || 'Failed to add employee.';
      },
    });
  }

  resetForm(): void {
    if (!this.employeeForm) {
      return;
    }

    this.employeeForm.reset({
      name: '',

      email: '',

      phone: '',

      department: '',

      designation: '',

      salary: '',

      role: 'Employee',

      password: '',

      confirmPassword: '',
    });

    const designationField = this.employeeFormFields.find((field) => field.name === 'designation');

    if (designationField) {
      designationField.options = [];
    }

    this.employeeForm.get('designation')?.disable();
  }

  cancel(): void {
    this.resetForm();

    this.router.navigate(['/employees']);

    this.close.emit();
  }
}
