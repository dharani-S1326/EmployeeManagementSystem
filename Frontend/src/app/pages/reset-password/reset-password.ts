import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../shared/button/button';
import { AuthService } from '../../services/auth.service';
import { FormFieldComponent } from '../../shared/form-field/form-field';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, ButtonComponent],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  email = '';
  token = '';

  message = '';
  errorMessage = '';
  loading = false;

  resetPasswordForm;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],

      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    document.body.classList.remove('dark-theme');
    document.documentElement.classList.remove('dark-theme');

    this.email = this.route.snapshot.queryParamMap.get('email') || '';

    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.email || !this.token) {
      this.errorMessage = 'Invalid password reset link.';
    }
  }

  resetPassword(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();

      return;
    }

    const newPassword = this.resetPasswordForm.value.newPassword || '';

    const confirmPassword = this.resetPasswordForm.value.confirmPassword || '';

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match.';

      return;
    }

    const data = {
      email: this.email,

      token: this.token,

      newPassword: newPassword,

      confirmPassword: confirmPassword,
    };

    this.loading = true;

    this.authService.resetPassword(data).subscribe({
      next: (response: any) => {
        this.loading = false;

        this.message = response.message || 'Password reset successfully';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },

      error: (error: any) => {
        this.loading = false;

        this.errorMessage = error.error?.message || 'Unable to reset password.';
      },
    });
  }
}
