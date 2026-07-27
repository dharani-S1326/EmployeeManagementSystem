import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { EmployeeService } from '../../../services/employee.service';

import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Footer } from '../../../layout/footer/footer';
import { Header } from '../../../layout/header/header';

import { AddEmployeeComponent } from '../add-employee/add-employee';

import { ButtonComponent } from '../../../shared/button/button';
import { Toast } from '../../../shared/toast/toast';
import { FormFieldComponent } from '../../../shared/form-field/form-field';

@Component({
  selector: 'app-employee-list',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    Sidebar,
    AddEmployeeComponent,
    Header,
    Footer,
    ButtonComponent,
    Toast,
    FormFieldComponent,
  ],

  templateUrl: './employee-list.html',

  styleUrls: ['./employee-list.css'],
})
export class EmployeeListComponent implements OnInit {
  private searchTimeout: any;

  pageNumber = 1;

  pageSize = 10;

  totalCount = 0;

  totalPages = 0;

  isLoading = false;

  searchText = '';

  selectedDepartment = '';

  selectedRole = '';

  departmentOptions: string[] = ['HR', 'IT', 'Finance', 'Admin', 'Sales', 'Marketing'];

  designationMap: Record<string, string[]> = {
    HR: ['HR Executive', 'HR Manager', 'Recruiter'],

    IT: ['Software Engineer', 'Senior Software Engineer', 'Team Lead', 'Project Manager'],

    Finance: ['Accountant', 'Senior Accountant', 'Finance Manager'],

    Admin: ['Admin Executive', 'Admin Manager'],

    Sales: ['Sales Executive', 'Sales Manager'],

    Marketing: ['Marketing Executive', 'Marketing Manager'],
  };

  // Current designation dropdown options

  designationOptions: string[] = [];

  roleOptions: string[] = ['Admin', 'HR', 'Employee'];

  showAddModal = false;

  showViewModal = false;

  showEditModal = false;

  showDeleteModal = false;

  selectedEmployee: any = null;

  employees: any[] = [];

  filteredEmployees: any[] = [];

  message = '';

  type: 'success' | 'error' = 'success';

  visible = false;

  editEmployeeForm: FormGroup;

  constructor(
    private employeeService: EmployeeService,

    private router: Router,

    private cdr: ChangeDetectorRef,

    private fb: FormBuilder,
  ) {
    this.editEmployeeForm = this.fb.group({
      name: ['', [Validators.required]],

      email: ['', [Validators.required, Validators.email]],

      phone: ['', [Validators.required, Validators.pattern(/^[6-9][0-9]{9}$/)]],

      department: ['', [Validators.required]],

      designation: ['', [Validators.required]],

      salary: [null, [Validators.required, Validators.min(0)]],
    });

    this.editEmployeeForm.get('department')?.valueChanges.subscribe((department: string | null) => {
      // Load designations based on
      // selected department

      this.designationOptions = department ? this.designationMap[department] || [] : [];

      // Get currently selected
      // designation

      const currentDesignation = this.editEmployeeForm.get('designation')?.value;

      // If current designation does
      // not belong to newly selected
      // department, clear it

      if (currentDesignation && !this.designationOptions.includes(currentDesignation)) {
        this.editEmployeeForm.get('designation')?.setValue('');
      }
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.isLoading = true;

    const loadingStartTime = Date.now();

    this.employeeService
      .getPagedEmployees(
        this.pageNumber,

        this.pageSize,

        this.searchText,

        this.selectedDepartment,

        this.selectedRole,
      )
      .subscribe({
        next: (response: any) => {
          const elapsedTime = Date.now() - loadingStartTime;

          const remainingTime = Math.max(1000 - elapsedTime, 0);

          setTimeout(() => {
            this.employees = response.data || [];

            this.filteredEmployees = [...this.employees];

            this.totalCount = response.totalCount || 0;

            this.totalPages = response.totalPages || 0;

            this.isLoading = false;

            this.cdr.detectChanges();
          }, remainingTime);
        },

        error: (err: any) => {
          console.error(
            'Employee pagination error:',

            err,
          );

          this.isLoading = false;

          this.showToast(
            'Failed to load employees',

            'error',
          );
          this.cdr.detectChanges();
        },
      });
  }

  searchEmployee(): void {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      this.pageNumber = 1;

      this.loadEmployees();
    }, 1000);
  }

  applyFilters(): void {
    this.pageNumber = 1;

    this.loadEmployees();
  }

  clearFilters(): void {
    this.searchText = '';

    this.selectedDepartment = '';

    this.selectedRole = '';

    this.pageNumber = 1;

    this.loadEmployees();
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageNumber) {
      return;
    }

    this.pageNumber = page;

    this.loadEmployees();
  }

  previousPage(): void {
    if (this.pageNumber <= 1) {
      return;
    }

    this.pageNumber--;

    this.loadEmployees();
  }

  nextPage(): void {
    if (this.pageNumber >= this.totalPages) {
      return;
    }

    this.pageNumber++;

    this.loadEmployees();
  }

  get pages(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },

      (_, index) => index + 1,
    );
  }

  closeAddModal(): void {
    this.showAddModal = false;

    this.reloadEmployees();
  }

  viewEmployee(id: number): void {
    this.router.navigate(['/employees/details', id]);
  }

  editEmployee(id: number): void {
    this.router.navigate(['/employees/edit', id]);
  }

  openView(emp: any): void {
    this.selectedEmployee = {
      ...emp,
    };

    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
  }

  openEdit(emp: any): void {
    // Store employee

    this.selectedEmployee = {
      ...emp,
    };

    // First load correct designation
    // options for existing department

    this.designationOptions = this.designationMap[emp.department] || [];

    // Set existing employee data

    this.editEmployeeForm.patchValue({
      name: emp.name,

      email: emp.email,

      phone: String(emp.phone || ''),

      department: emp.department,

      designation: emp.designation,

      salary: emp.salary,
    });

    // Open modal

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;

    this.selectedEmployee = null;

    this.designationOptions = [];

    this.editEmployeeForm.reset();
  }

  updateEmployee(): void {
    if (this.editEmployeeForm.invalid) {
      this.editEmployeeForm.markAllAsTouched();

      return;
    }

    if (!this.selectedEmployee) {
      return;
    }

    const updatedEmployee = {
      ...this.selectedEmployee,

      ...this.editEmployeeForm.getRawValue(),
    };

    this.employeeService.updateEmployee(updatedEmployee).subscribe({
      next: () => {
        this.showToast(
          'Employee updated successfully',

          'success',
        );

        this.showEditModal = false;

        this.selectedEmployee = null;

        this.designationOptions = [];

        this.editEmployeeForm.reset();

        this.reloadEmployees();
        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error(
          'Employee update error:',

          err,
        );

        this.showToast(
          err.error?.message || 'Employee update failed',

          'error',
        );
        this.cdr.detectChanges();
      },
    });
  }

  openDelete(emp: any): void {
    this.selectedEmployee = emp;

    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;

    this.selectedEmployee = null;
  }

  confirmDelete(): void {
    if (!this.selectedEmployee) {
      return;
    }

    this.employeeService.deleteEmployee(this.selectedEmployee.id).subscribe({
      next: () => {
        this.showDeleteModal = false;

        this.selectedEmployee = null;

        this.showToast(
          'Employee deleted successfully',

          'success',
        );
        this.cdr.detectChanges();

        if (this.employees.length === 1 && this.pageNumber > 1) {
          this.pageNumber--;
        }

        this.loadEmployees();
      },

      error: (err: any) => {
        console.error(
          'Employee delete error:',

          err,
        );

        this.showToast(
          err.error?.message || 'Delete failed',

          'error',
        );
        this.cdr.detectChanges();
      },
    });
  }

  reloadEmployees(): void {
    this.pageNumber = 1;

    this.loadEmployees();
  }

  showToast(
    message: string,

    type: 'success' | 'error',
  ): void {
    this.message = message;

    this.type = type;

    this.visible = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.visible = false;
    }, 3000);
  }

  trackByEmployeeId(
    index: number,

    employee: any,
  ): number {
    return employee.id;
  }

  onBackdropClick(
    event: MouseEvent,

    modalType: 'add' | 'view' | 'edit' | 'delete',
  ): void {
    if (event.target !== event.currentTarget) {
      return;
    }

    switch (modalType) {
      case 'add':
        this.closeAddModal();

        break;

      case 'view':
        this.closeViewModal();

        break;

      case 'edit':
        this.closeEditModal();

        break;

      case 'delete':
        this.closeDeleteModal();

        break;
    }
  }
}
