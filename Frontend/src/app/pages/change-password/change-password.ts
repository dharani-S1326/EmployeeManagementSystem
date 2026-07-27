import { Component, EventEmitter, Output } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonComponent } from '../../shared/button/button';

import { FormFieldComponent } from '../../shared/form-field/form-field';

import { AuthService } from '../../services/auth.service';

import { Toast } from '../../shared/toast/toast';

@Component({
  selector: 'app-change-password',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule, Toast, ButtonComponent, FormFieldComponent],

  templateUrl: './change-password.html',

  styleUrl: './change-password.css',
})
export class ChangePassword {
  @Output()
  closeModal = new EventEmitter<void>();

  isOpen = true;

  isSubmitting = false;

  toastVisible = false;

  toastMessage = '';

  toastType: 'success' | 'error' = 'success';

  passwordForm: FormGroup;

  currentPasswordError = '';
  newPasswordError = '';
confirmPasswordError = '';

  constructor(
  private authService: AuthService,
  private fb: FormBuilder,
) {

  this.passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  this.passwordForm.get('currentPassword')?.valueChanges.subscribe(() => {

    const control = this.passwordForm.get('currentPassword');

    if (control?.hasError('incorrectPassword')) {

      control.setErrors(null);

      control.updateValueAndValidity();

    }

  });

}

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;

    this.toastType = type;

    this.toastVisible = true;

    setTimeout(() => {
     
      this.toastVisible = false;
       this.closePopup();
    }, 3000);
  }

  changePassword(): void {
    this.currentPasswordError = '';
    this.newPasswordError = '';
this.confirmPasswordError = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();

      return;
    }

    const formData = this.passwordForm.getRawValue();

    if (formData.newPassword !== formData.confirmPassword) {
  this.confirmPasswordError =
    'New Password and Confirm Password do not match.';
  return;
}

    if (formData.currentPassword === formData.newPassword) {
  this.newPasswordError =
    'New Password must be different from Current Password.';
  return;
}
    const data = {
      currentPassword: formData.currentPassword,

      newPassword: formData.newPassword,

      confirmPassword: formData.confirmPassword,
    };

    this.isSubmitting = true;

    this.authService.changePassword(data).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        this.showToast(
          res?.message || 'Password changed successfully',

          'success',
        );

        this.passwordForm.reset();

        setTimeout(() => {
          this.closePopup();
        }, 3000);
      },

      error: (err: any) => {
  this.isSubmitting = false;

  const message = err?.error?.message || '';

  if (
    message.toLowerCase().includes('incorrect') ||
    message.toLowerCase().includes('current password')
  ) {

    this.passwordForm.get('currentPassword')?.setErrors({
      incorrectPassword: true
    });

    this.passwordForm.get('currentPassword')?.markAsTouched();

    return;
  }

  this.showToast(message || 'Unable to change password', 'error');
},
    });
  }
  

  closePopup(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isOpen = false;

    this.passwordForm.reset();

    this.closeModal.emit();
  }
}
