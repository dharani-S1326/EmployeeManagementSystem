import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/button/button';
import { FormFieldComponent } from '../../shared/form-field/form-field';
import { Toast } from '../../shared/toast/toast';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonComponent,
    FormFieldComponent,
    Toast,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit {
  passwordModel = {
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),

    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    document.body.classList.remove('dark-theme');
    document.documentElement.classList.remove('dark-theme');
  }

  showToast(message: string, type: 'success' | 'error'): void {
     console.log('showToast:', message);
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;

  this.cdr.detectChanges();

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      this.showToast('Enter Email and Password', 'error');

      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        console.log('LOGIN RESPONSE:', res);

        const user = res.data ?? res;

        if (!user?.token) {
          console.error('Token missing in login response:', res);

          this.showToast('Invalid login response', 'error');

          return;
        }

        // SAVE TOKEN
        localStorage.setItem('token', user.token);

        // SAVE EMPLOYEE ID
        if (user.employeeId != null) {
          localStorage.setItem('employeeId', user.employeeId.toString());
        }

        // SAVE ROLE
        localStorage.setItem('role', user.role || '');

        // SAVE CURRENT USER
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            employeeId: user.employeeId,
            name: user.name,
            email: user.email,
            role: user.role,
          }),
        );

        this.showToast('Login Successful', 'success');
        setTimeout(() => {

        // ROLE BASED DASHBOARD
        const role = (user.role || '').trim().toLowerCase();

        if (role === 'employee') {
          this.router.navigate(['/employee-dashboard']);
        } else {
          // Admin and HR
          this.router.navigate(['/dashboard']);
        }
      }, 1000);
    },

   error: (err: HttpErrorResponse) => {
    let message = 'Invalid Email or Password';

    if (err.status === 0) {
      message = 'Unable to reach the server. Please check your connection.';
    } else if (err.error?.message) {
      message = err.error.message;
    }

    this.showToast(message, 'error');
  },

    });
  }

  forgotPassword(): void {
    if (!this.passwordModel.email.trim()) {
      this.showToast('Please enter your email address.', 'error');

      return;
    }

    this.authService
      .forgotPassword({
        email: this.passwordModel.email,
      })
      .subscribe({
        next: (res: any) => {
          this.showToast(res?.message || 'Reset password link sent successfully.', 'success');
          this.cdr.detectChanges();
        },

        error: (err: any) => {
          this.showToast(err?.error?.message || 'Failed to send reset link.', 'error');
          this.cdr.detectChanges();
        },
      });
  }
}
