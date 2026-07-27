import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { Header } from '../../layout/header/header';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Footer } from '../../layout/footer/footer';

import { PayrollService } from '../../services/payroll.service';
import { Payroll } from '../../models/payroll.model';

@Component({
  selector: 'app-my-payroll',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Footer],
  templateUrl: './my-payroll.html',
  styleUrl: './my-payroll.css',
})
export class MyPayrollComponent implements OnInit {
  payrolls: Payroll[] = [];

  isLoading = false;

  constructor(
    private payrollService: PayrollService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadMyPayroll();
  }

  loadMyPayroll(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const employeeId = currentUser.employeeId || currentUser.id;

    if (!employeeId) {
      console.error('Employee ID not found in currentUser');

      return;
    }

    this.isLoading = true;

    this.payrollService.getEmployeePayroll(employeeId).subscribe({
      next: (data: Payroll[]) => {
        this.payrolls = data || [];

        this.isLoading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error loading payroll:', error);

        this.payrolls = [];

        this.isLoading = false;
      },
    });
  }
}
