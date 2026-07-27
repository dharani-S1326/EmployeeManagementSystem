import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

import { FormFieldComponent } from '../../shared/form-field/form-field';

import { Header } from '../../layout/header/header';

import { Sidebar } from '../../layout/sidebar/sidebar';

import { Footer } from '../../layout/footer/footer';

import { ButtonComponent } from '../../shared/button/button';

import { Toast } from '../../shared/toast/toast';

import { PayrollService } from '../../services/payroll.service';

import { GeneratePayrollComponent } from '../generate-payroll/generate-payroll';

@Component({
  selector: 'app-payroll-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    Header,
    Sidebar,
    Footer,
    GeneratePayrollComponent,
    ButtonComponent,
    FormFieldComponent,
    Toast,
  ],

  templateUrl: './payroll-list.html',

  styleUrls: ['./payroll-list.css'],
})
export class PayrollComponent implements OnInit {
  editPayrollForm!: FormGroup;

  paymentStatusOptions = ['Paid', 'Pending'];

  payrolls: any[] = [];

  filteredPayrolls: any[] = [];

  paginatedPayrolls: any[] = [];

  selectedPayroll: any = null;

  searchText = '';

  department = '';

  month = '';

  pageNumber = 1;

  pageSize = 10;

  totalCount = 0;

  totalPages = 0;

  showGenerateModal = false;

  showViewModal = false;

  showEditModal = false;

  showDeleteModal = false;

  message = '';

  type: 'success' | 'error' = 'success';

  visible = false;

  constructor(
    private payrollService: PayrollService,

    private cdr: ChangeDetectorRef,

    private fb: FormBuilder,
  ) {
    this.editPayrollForm = this.fb.group({
      allowance: [0, Validators.required],

      bonus: [0, Validators.required],

      deduction: [0, Validators.required],

      tax: [0, Validators.required],

      paymentStatus: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPayroll();
  }

  loadPayroll(): void {
    this.payrollService.getPayroll().subscribe({
      next: (data: any) => {
        this.payrolls = data || [];

        // Apply filters and pagination
        this.applyFilters();

        this.cdr.detectChanges();
      },

      error: (err: any) => {
        console.error('Error loading payroll:', err);
      },
    });
  }

  applyFilters(): void {
    let result = [...this.payrolls];

    const search = this.searchText.trim().toLowerCase();

    if (search) {
      result = result.filter(
        (item) =>
          item.employeeName?.toLowerCase().includes(search) ||
          item.department?.toLowerCase().includes(search) ||
          item.designation?.toLowerCase().includes(search) ||
          item.employeeId?.toString().includes(search),
      );
    }

    if (this.department) {
      result = result.filter((item) => item.department === this.department);
    }

    if (this.month) {
      result = result.filter((item) => {
        if (!item.paymentDate) {
          return false;
        }

        const paymentMonth = new Date(item.paymentDate).toLocaleString('en-US', {
          month: 'long',
        });

        return paymentMonth === this.month;
      });
    }

    // Store complete filtered result
    this.filteredPayrolls = result;

    // Update pagination
    this.totalCount = this.filteredPayrolls.length;

    this.totalPages = Math.ceil(this.totalCount / this.pageSize);

    // If no records
    if (this.totalPages === 0) {
      this.pageNumber = 1;
    }

    // Prevent invalid current page
    else if (this.pageNumber > this.totalPages) {
      this.pageNumber = this.totalPages;
    }

    // Apply pagination
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = (this.pageNumber - 1) * this.pageSize;

    const endIndex = startIndex + this.pageSize;

    this.paginatedPayrolls = this.filteredPayrolls.slice(startIndex, endIndex);
  }

  get pages(): number[] {
    return Array.from(
      {
        length: this.totalPages,
      },

      (_, index) => index + 1,
    );
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.pageNumber = page;

    this.updatePaginatedData();
  }

  searchEmployee(): void {
    // Go back to first page
    // when searching
    this.pageNumber = 1;

    this.applyFilters();
  }

  filterDepartment(): void {
    this.pageNumber = 1;

    this.applyFilters();
  }

  filterMonth(): void {
    this.pageNumber = 1;

    this.applyFilters();
  }

  onGeneratePayroll(success: boolean): void {
    this.showGenerateModal = false;

    if (success) {
      this.pageNumber = 1;

      this.loadPayroll();

      this.showToast(
        'Payroll Generated Successfully',

        'success',
      );
      this.cdr.detectChanges();
    }
  }

  openView(item: any): void {
    this.selectedPayroll = {
      ...item,
    };

    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;

    this.selectedPayroll = null;
  }

  openEdit(item: any): void {
    this.selectedPayroll = {
      ...item,
    };

    this.editPayrollForm.patchValue({
      allowance: item.allowance,

      bonus: item.bonus,

      deduction: item.deduction,

      tax: item.tax,

      paymentStatus: item.paymentStatus,
    });

    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;

    this.selectedPayroll = null;

    this.editPayrollForm.reset();
  }

  updatePayroll(): void {
    if (this.editPayrollForm.invalid) {
      this.editPayrollForm.markAllAsTouched();

      return;
    }

    if (!this.selectedPayroll) {
      return;
    }

    const updatedPayroll = {
      ...this.selectedPayroll,

      ...this.editPayrollForm.getRawValue(),
    };

    this.payrollService
      .updatePayroll(
        this.selectedPayroll.payrollId,

        updatedPayroll,
      )
      .subscribe({
        next: () => {
          this.showEditModal = false;

          this.selectedPayroll = null;

          this.editPayrollForm.reset();

          this.showToast(
            'Payroll updated successfully',

            'success',
          );
          this.cdr.detectChanges();

          // Keep current page
          this.loadPayroll();
        },

        error: (err: any) => {
          console.error('Payroll update error:', err);

          this.showToast(
            'Payroll update failed',

            'error',
          );
          this.cdr.detectChanges();
        },
      });
  }

  openDelete(payroll: any): void {
    this.selectedPayroll = payroll;

    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;

    this.selectedPayroll = null;
  }

  confirmDelete(): void {
    if (!this.selectedPayroll) {
      return;
    }

    this.payrollService.deletePayroll(this.selectedPayroll.payrollId).subscribe({
      next: () => {
        this.showDeleteModal = false;

        this.selectedPayroll = null;

        this.showToast(
          'Payroll deleted successfully',

          'success',
        );
        this.cdr.detectChanges();

        this.loadPayroll();
      },

      error: (err: any) => {
        console.error('Payroll delete error:', err);

        this.showToast(
          'Payroll delete failed',

          'error',
        );
        this.cdr.detectChanges();
      },
    });
  }

  generatePayroll(): void {
    this.payrollService.generatePayroll(this.selectedPayroll).subscribe({
      next: () => {
        this.showGenerateModal = false;

        this.pageNumber = 1;

        this.showToast(
          'Payroll generated successfully',

          'success',
        );
        this.cdr.detectChanges();

        this.loadPayroll();
      },

      error: (err: any) => {
        console.error('Generate payroll error:', err);

        this.showToast(
          'Unable to generate payroll',

          'error',
        );
        this.cdr.detectChanges();
      },
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.message = message;

    this.type = type;

    this.visible = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.visible = false;
    }, 3000);
  }

  trackByPayrollId(index: number, item: any): number {
    return item.payrollId;
  }
}
