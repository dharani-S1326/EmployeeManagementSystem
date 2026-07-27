import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { Header } from '../../layout/header/header';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Footer } from '../../layout/footer/footer';

import { LeaveService } from '../../services/leave.service';
import { Leave } from '../../models/leave.model';

@Component({
  selector: 'app-my-leaves',

  standalone: true,

  imports: [CommonModule, FormsModule, Header, Sidebar, Footer],

  templateUrl: './my-leaves.html',

  styleUrl: './my-leaves.css',
})
export class MyLeavesComponent implements OnInit {
  leaves: Leave[] = [];

  filteredLeaves: Leave[] = [];

  // Only current page data
  displayedLeaves: Leave[] = [];

  // employeeId: number | null = null;

  searchText = '';

  statusFilter = '';

  totalLeaves = 0;

  pendingCount = 0;

  approvedCount = 0;

  rejectedCount = 0;

  pageNumber = 1;

  pageSize = 10;

  totalCount = 0;

  totalPages = 0;

  pages: number[] = [];

  constructor(
    private leaveService: LeaveService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadMyLeaves();
  }

  loadMyLeaves(): void {
    this.leaveService.getMyLeaves().subscribe({
      next: (response: Leave[]) => {
        this.leaves = response || [];

        this.updateCounts();

        this.pageNumber = 1;

        this.applyFilters();

        this.cdr.detectChanges();
      },

      error: (error: any) => {
        console.error('Error loading my leaves:', error);

        this.leaves = [];
        this.updateCounts();
        this.applyFilters();

        this.cdr.detectChanges();
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

    // Always return to first page
    // when filter changes

    this.pageNumber = 1;

    this.applyFilters();
  }

  onSearchChange(): void {
    // Search result should start
    // from first page

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
          leave.leaveType?.toLowerCase().includes(search) ||
          leave.reason?.toLowerCase().includes(search) ||
          leave.status?.toLowerCase().includes(search),
      );
    }

    // Store complete filtered data

    this.filteredLeaves = result;

    // Update pagination

    this.updatePagination();
  }

  updatePagination(): void {
    // Total filtered records

    this.totalCount = this.filteredLeaves.length;

    // Calculate total pages

    this.totalPages = Math.ceil(this.totalCount / this.pageSize);

    // If there are no records

    if (this.totalPages === 0) {
      this.pageNumber = 1;

      this.pages = [];

      this.displayedLeaves = [];

      return;
    }

    // Prevent invalid page number

    if (this.pageNumber > this.totalPages) {
      this.pageNumber = this.totalPages;
    }

    // Generate page numbers

    this.pages = Array.from(
      {
        length: this.totalPages,
      },

      (_, index) => index + 1,
    );

    // Calculate array start index

    const startIndex = (this.pageNumber - 1) * this.pageSize;

    // Calculate array end index

    const endIndex = startIndex + this.pageSize;

    // Get current page records

    this.displayedLeaves = this.filteredLeaves.slice(
      startIndex,

      endIndex,
    );
  }

  changePage(page: number): void {
    // Prevent invalid pages

    if (page < 1 || page > this.totalPages || page === this.pageNumber) {
      return;
    }

    // Change current page

    this.pageNumber = page;

    // Display selected page data

    this.updatePagination();

    // Scroll page to top

    window.scrollTo({
      top: 0,

      behavior: 'smooth',
    });
  }

  trackByLeaveId(index: number, leave: Leave): number {
    return leave.leaveId;
  }
}
