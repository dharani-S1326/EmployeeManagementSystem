import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { PayrollService } from '../../services/payroll.service';
import { ChangeDetectorRef } from '@angular/core';
import { ButtonComponent } from '../../shared/button/button';
import { FormFieldComponent } from '../../shared/form-field/form-field';
import { Toast } from '../../shared/toast/toast';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-generate-payroll',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FormFieldComponent,Toast],
  templateUrl: './generate-payroll.html',
  styleUrls: ['./generate-payroll.css'],
})
export class GeneratePayrollComponent {
  toastVisible = false;
toastMessage = '';
toastType: 'success' | 'error' = 'success';
  @Output()
  closeModal = new EventEmitter<boolean>();

  employees: any[] = [];

  payrollForm: FormGroup;

  departmentOptions = ['HR', 'IT', 'Finance', 'Admin', 'Sales', 'Marketing'];

  designationOptions = [
    'Software Engineer',
    'Senior Software Engineer',
    'Team Lead',
    'Project Manager',
    'HR Executive',
    'Accountant',
    'Sales Executive',
  ];

  paymentStatusOptions = ['Paid', 'Pending'];

  constructor(
    private payrollService: PayrollService,
    private cdr: ChangeDetectorRef,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
  ) {
    this.payrollForm = this.fb.group({
      employeeName: ['', Validators.required],
      employeeId: [null, Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      basicSalary: [null, Validators.required],
      allowance: [null, Validators.required],
      bonus: [null, Validators.required],
      deduction: [null, Validators.required],
      tax: [null, Validators.required],
      netSalary: [null, Validators.required],
      paymentStatus: ['', Validators.required],
      paymentDate: ['', Validators.required],
    });
  }

  ngOnInit() {}

  calculateNetSalary() {
    const values = this.payrollForm.getRawValue();

    const netSalary =
      Number(values.basicSalary) +
      Number(values.allowance) +
      Number(values.bonus) -
      Number(values.deduction) -
      Number(values.tax);

    this.payrollForm.patchValue({
      netSalary: netSalary,
    });
  }

  generatePayroll() {
    const payroll = this.payrollForm.getRawValue();

    this.payrollService.generatePayroll(payroll).subscribe({
      next: () => {
        this.closeModal.emit(true);
      },

      error: (err) => {
        console.log(err);
      },
    });
  }
showToast(message: string, type: 'success' | 'error'): void {
  this.toastMessage = message;
  this.toastType = type;
  this.toastVisible = true;

  console.log('OPEN', this.toastVisible);

  setTimeout(() => {
    this.toastVisible = false;

    console.log('CLOSE', this.toastVisible);
  }, 1200);
}

  searchEmployee() {
  const employeeId = Number(this.payrollForm.get('employeeId')?.value);

  console.log('Employee ID:', employeeId);

  if (!employeeId || employeeId <= 0) {
    this.showToast('Enter Employee ID', 'error');
    return;
  }

  this.employeeService.getEmployeeById(employeeId).subscribe({
    next: (emp: any) => {
      console.log('API Response:', emp);

      this.payrollForm.patchValue({
        employeeName: emp.name,
        department: emp.department,
        designation: emp.designation,
        basicSalary: emp.salary,
      });

      this.calculateNetSalary();
      this.cdr.detectChanges();
    },

    error: (err: any) => {
      console.log('API Error:', err);

      this.showToast(
        err?.error?.message || 'Employee ID not found',
        'error'
      );
      this.cdr.detectChanges();

      this.payrollForm.patchValue({
        employeeName: '',
        department: '',
        designation: '',
        basicSalary: '',
      });
    },
  });
}

  close() {
    this.closeModal.emit(false);
  }
}
