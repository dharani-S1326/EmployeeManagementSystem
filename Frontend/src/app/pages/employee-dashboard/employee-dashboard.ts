import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Header } from '../../layout/header/header';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Footer } from '../../layout/footer/footer';
import { ChangeDetectorRef } from '@angular/core';
import { LeaveService } from '../../services/leave.service';
import { Leave } from '../../models/leave.model';
import { EmployeeService } from '../../services/employee.service';
import { PayrollService } from '../../services/payroll.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, Header, Sidebar, Footer],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboardComponent implements OnInit {
  leaves: Leave[] = [];
  pendingCount = 0;
  approvedCount = 0;
  rejectedCount = 0;

  user: any = {};
  employee: any = null;

  latestPayroll: any = null;

  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private payrollService: PayrollService,
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const employeeId = this.user.employeeId || this.user.id;

    if (employeeId) {
      this.loadEmployee(employeeId);
      this.loadLatestPayroll(employeeId);
    }

    this.loadMyLeaves();
  }

  loadEmployee(employeeId: number): void {
    this.employeeService.getEmployeeById(employeeId).subscribe({
      next: (data) => {
        this.employee = data;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Employee details error:', error);
      },
    });
  }
  loadMyLeaves(): void {
    this.leaveService.getMyLeaves().subscribe({
      next: (data: Leave[]) => {
        this.leaves = data || [];

        this.pendingCount = this.leaves.filter(
          (leave) => leave.status?.toLowerCase() === 'pending',
        ).length;

        this.approvedCount = this.leaves.filter(
          (leave) => leave.status?.toLowerCase() === 'approved',
        ).length;

        this.rejectedCount = this.leaves.filter(
          (leave) => leave.status?.toLowerCase() === 'rejected',
        ).length;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Leave summary error:', error);
      },
    });
  }

  loadLatestPayroll(employeeId: number): void {
    this.payrollService.getEmployeePayroll(employeeId).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.latestPayroll = [...data].sort(
            (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
          )[0];
        }

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Payroll error:', error);
      },
    });
  }

  goToPayroll(): void {
    this.router.navigate(['/my-payroll']);
  }

  applyLeave(): void {
    this.router.navigate(['/apply-leave']);
  }

  goToMyLeaves(): void {
    this.router.navigate(['/my-leaves']);
  }
}
