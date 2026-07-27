import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RegisterComponent } from '../../pages/register/register';
import { AuthService } from '../../services/auth.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,

  imports: [CommonModule, RouterModule, RegisterComponent],

  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {
  showRegisterPopup = false;

  constructor(
    public authService: AuthService,
    public sidebarService: SidebarService,
  ) {}

  get role(): string {
    return this.authService.getRole() ?? '';
  }

  get isAdmin(): boolean {
    return this.role.toLowerCase() === 'admin';
  }

  get isHR(): boolean {
    return this.role.toLowerCase() === 'hr';
  }

  get isEmployee(): boolean {
    return this.role.toLowerCase() === 'employee';
  }

  get canManageLeaves(): boolean {
    return this.isAdmin || this.isHR;
  }

  closeSidebar(): void {
    this.sidebarService.closeSidebar();
  }

  openRegisterPopup(): void {
    // Close mobile sidebar first
    this.closeSidebar();

    this.showRegisterPopup = true;
  }

  closeRegisterPopup(): void {
    this.showRegisterPopup = false;
  }
  get dashboardRoute(): string {
    if (this.isEmployee) {
      return '/employee-dashboard';
    }

    return '/dashboard';
  }
}
