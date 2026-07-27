import { CommonModule } from '@angular/common';

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { FormsModule } from '@angular/forms';

import { Header } from '../../layout/header/header';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Footer } from '../../layout/footer/footer';

import { LeaveService } from '../../services/leave.service';
import { Leave } from '../../models/leave.model';

import { ButtonComponent } from '../../shared/button/button';
import { FormFieldComponent } from '../../shared/form-field/form-field';
import { Toast } from '../../shared/toast/toast';

import { environment } from '../../Environment/environment.development';

@Component({
  selector: 'app-leave-requests',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Header,
    Sidebar,
    Footer,
    ButtonComponent,
    FormFieldComponent,
    Toast,
  ],

  templateUrl: './leave-requests.html',

  styleUrl: './leave-requests.css',
})
export class LeaveRequestsComponent implements OnInit {
  leaves: Leave[] = [];

  filteredLeaves: Leave[] = [];

  displayedLeaves: Leave[] = [];

  searchText = '';

  statusFilter = '';

  pageNumber = 1;

  pageSize = 10;

  totalPages = 0;

  pages: number[] = [];

  selectedLeave: Leave | null = null;

  showApprovalModal = false;

  isSubmitting = false;

  approvalAction: 'approve' | 'reject' = 'approve';

  totalLeaves = 0;

  pendingCount = 0;

  approvedCount = 0;

  rejectedCount = 0;

  toastVisible = false;

  toastMessage = '';

  toastType: 'success' | 'error' = 'success';

  approvalForm: FormGroup;

  constructor(
    private leaveService: LeaveService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.approvalForm = this.fb.group({
      remarks: [''],
    });
  }

  ngOnInit(): void {
    this.loadLeaves();
  }

  get remarksControl(): FormControl {
    return this.approvalForm.get('remarks') as FormControl;
  }

  loadLeaves(): void {
    this.leaveService.getAllLeaves().subscribe({
      next: (response: Leave[]) => {
        this.leaves = response || [];

        this.updateCounts();

        this.applyFilters();

        this.cdr.detectChanges();
      },

      error: (error: any) => {
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

  filterByStatus(status: string): void {
    this.statusFilter = status;

    this.pageNumber = 1;

    this.applyFilters();
  }

  onSearchChange(): void {
    this.pageNumber = 1;

    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.leaves];

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

    this.filteredLeaves = result;

    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLeaves.length / this.pageSize);

    if (this.totalPages > 0 && this.pageNumber > this.totalPages) {
      this.pageNumber = this.totalPages;
    }

    if (this.totalPages === 0) {
      this.pageNumber = 1;
    }

    this.pages = Array.from(
      {
        length: this.totalPages,
      },

      (_, index) => index + 1,
    );

    this.updateDisplayedLeaves();
  }

  updateDisplayedLeaves(): void {
    const startIndex = (this.pageNumber - 1) * this.pageSize;

    const endIndex = startIndex + this.pageSize;

    this.displayedLeaves = this.filteredLeaves.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageNumber) {
      return;
    }

    this.pageNumber = page;

    this.updateDisplayedLeaves();

    window.scrollTo({
      top: 0,

      behavior: 'smooth',
    });
  }

  viewMedicalCertificate(certificatePath: string | null | undefined): void {
    if (!certificatePath) {
      this.showToast(
        'Medical certificate not available.',

        'error',
      );

      return;
    }

    // environment.apiUrl example:
    // https://localhost:7030/api

    // Certificate path example:
    // /uploads/medical-certificates/file.pdf

    const apiBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');

    const certificateUrl = certificatePath.startsWith('http')
      ? certificatePath
      : `${apiBaseUrl}${certificatePath}`;

    window.open(
      certificateUrl,

      '_blank',

      'noopener,noreferrer',
    );
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

  closeModalOnBackdrop(): void {
    if (!this.isSubmitting) {
      this.closeApprovalModal();
    }
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
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
          this.handleSuccess('Leave approved successfully.');
        },

        error: (error: any) => {
          this.handleError(
            error,

            'Unable to approve leave.',
          );
        },
      });
    } else {
      this.leaveService.rejectLeave(leaveId, remarks).subscribe({
        next: () => {
          this.handleSuccess('Leave rejected successfully.');
        },

        error: (error: any) => {
          this.handleError(
            error,

            'Unable to reject leave.',
          );
        },
      });
    }
  }

  handleSuccess(message: string): void {
    this.isSubmitting = false;

    this.showApprovalModal = false;

    this.selectedLeave = null;

    this.approvalForm.reset();

    this.showToast(
      message,

      'success',
    );

    this.loadLeaves();
  }

  handleError(error: any, defaultMessage: string): void {
    console.error(
      'Leave Approval Error:',

      error,
    );

    this.isSubmitting = false;
    this.cdr.detectChanges();

    this.showToast(
      error?.error?.message || defaultMessage,

      'error',
    );
    this.cdr.detectChanges();
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

  trackByLeaveId(index: number, leave: Leave): number {
    return leave.leaveId;
  }
}
