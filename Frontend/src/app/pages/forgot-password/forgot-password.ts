import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Toast } from '../../shared/toast/toast';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/button/button';
import { FormFieldComponent } from '../../shared/form-field/form-field';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    Toast,
    ButtonComponent,
    FormFieldComponent,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  @Output()
  closeModal = new EventEmitter<void>();

  forgotForm: FormGroup;

  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  ngOnInit(): void {
    document.body.classList.remove('dark-theme');
    document.documentElement.classList.remove('dark-theme');
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

  sendResetLink(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    const data = {
      email: this.forgotForm.value.email,
    };

    this.authService.forgotPassword(data).subscribe({
      next: (res: any) => {
        this.showToast(res.message || 'Reset link sent successfully', 'success');

        this.forgotForm.reset();
        this.cdr.detectChanges();

        // Toast 3 seconds show ஆன பிறகு login page செல்லும்
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },

      error: (err: any) => {
        this.showToast(err.error?.message || 'Something went wrong', 'error');
      },
    });
  }

  closePopup(): void {
    this.closeModal.emit();
  }

  backToLogin(): void {
    this.router.navigate(['/login']);
  }
  closeForgotPassword(): void {
    this.router.navigate(['/login']);
  }
}
