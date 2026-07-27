import { Component, OnInit, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { ButtonComponent } from '../../shared/button/button';
import { ChangePassword } from '../../pages/change-password/change-password';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/Profile.model';

@Component({
  selector: 'app-header',
  standalone: true,

  imports: [CommonModule, RouterModule, ButtonComponent, ChangePassword],

  templateUrl: './header.html',
  styleUrls: ['./header.css'],
})
export class Header implements OnInit {
  profile: Profile | null = null;

  showProfile = false;
  isDarkMode = false;
  isChangePasswordOpen = false;

  loggedInName = '';

  loggedInEmail = '';

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private elementRef: ElementRef,
    private themeService: ThemeService,
    private sidebarService: SidebarService,
     private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.themeService.initializeTheme();

    this.isDarkMode = this.themeService.getCurrentTheme() === 'dark';

    this.loadLoggedInUser();

    this.loadProfile();
  }
  toggleTheme(): void {
    const theme = this.themeService.toggleTheme();

    this.isDarkMode = theme === 'dark';
  }

  goToDashboard(): void {

  const role =
    this.authService
      .getRole()
      ?.toLowerCase();

  switch (role) {

    case 'employee':

      this.router.navigate([
        '/employee-dashboard'
      ]);

      break;

    case 'hr':

      this.router.navigate([
        '/dashboard'
      ]);

      break;

    case 'admin':

      this.router.navigate([
        '/dashboard'
      ]);

      break;

    default:

      this.router.navigate([
        '/dashboard'
      ]);

      break;

  }

}

  loadLoggedInUser(): void {
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);

        this.loggedInName = user.name || user.fullName || '';

        this.loggedInEmail = user.email || '';
      } catch (error) {
        console.error('Unable to read logged-in user:', error);
      }
    }
  }
  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (data: Profile) => {
        this.profile = data;

        // Use profile data if available
        if (data) {
          this.loggedInName = data.fullName || this.loggedInName;

          this.loggedInEmail = data.email || this.loggedInEmail;
        }

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Profile API Error:', err);
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // Don't close dropdown while
    // change password modal is open
    if (this.isChangePasswordOpen) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(target)) {
      this.showProfile = false;
    }
  }

  toggleProfile(): void {
  console.log('Profile clicked');
  this.showProfile = !this.showProfile;
}

  onHeaderImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];

    this.profileService.uploadImage(file).subscribe({
      next: (res: any) => {
        this.profileService.getProfile().subscribe({
          next: (updatedProfile: Profile) => {
            this.profile = {
              ...updatedProfile,

              profileImageUrl: updatedProfile.profileImageUrl
                ? updatedProfile.profileImageUrl + '?t=' + Date.now()
                : '',
            };

            this.cdr.detectChanges();
          },

          error: (err) => {
            console.error('Profile reload error:', err);
          },
        });
      },
    });
  }

openChangePassword(): void {
  console.log('Change Password clicked');
  this.showProfile = false;
  this.isChangePasswordOpen = true;
}
closeChangePassword(): void {

  console.log('CLOSE CALLED');

  this.isChangePasswordOpen = false;

}
  logout(): void {
    localStorage.clear();

    document.documentElement.setAttribute('data-theme', 'light');

    this.isDarkMode = false;

    this.router.navigate(['/login']);
  }

  getInitials(): string {
    const name = this.loggedInName?.trim();

    if (!name) {
      return 'U';
    }

    const words = name.split(/\s+/);

    // Single name: first 2 letters
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    // Full name: first letter of first
    // and last name
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
}
