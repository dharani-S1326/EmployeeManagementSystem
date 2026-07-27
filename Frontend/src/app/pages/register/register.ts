import { Component, EventEmitter, Output } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

import { ButtonComponent } from '../../shared/button/button';

import { FormFieldComponent } from '../../shared/form-field/form-field';

import { Toast } from '../../shared/toast/toast';

import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-register',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    // RouterLink,
    ButtonComponent,
    FormFieldComponent,
    Toast,
  ],

  templateUrl: './register.html',

  styleUrl: './register.css',
})
export class RegisterComponent {
  constructor(private authService: AuthService, private cdr: ChangeDetectorRef
) {}

  @Output()
  closeModal = new EventEmitter<void>();

  toastVisible = false;

  toastMessage = '';
  currentStep = 1;

  totalSteps = 3;

  toastType: 'success' | 'error' = 'success';

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),

    email: new FormControl('', [Validators.required, Validators.email]),

    password: new FormControl('', [Validators.required, Validators.minLength(6)]),

    confirmPassword: new FormControl('', [Validators.required]),

    // Role added
    role: new FormControl('Employee', [Validators.required]),
  });

  closePopup(): void {
    this.closeModal.emit();
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
  nextStep(): void {
    if (this.currentStep === 1) {
      const nameControl = this.registerForm.get('name');

      const emailControl = this.registerForm.get('email');

      nameControl?.markAsTouched();
      emailControl?.markAsTouched();

      if (nameControl?.invalid || emailControl?.invalid) {
        this.showToast('Please enter valid personal details.', 'error');

        return;
      }
    }

    if (this.currentStep === 2) {
      const passwordControl = this.registerForm.get('password');

      const confirmPasswordControl = this.registerForm.get('confirmPassword');

      const roleControl = this.registerForm.get('role');

      passwordControl?.markAsTouched();
      confirmPasswordControl?.markAsTouched();
      roleControl?.markAsTouched();

      if (passwordControl?.invalid || confirmPasswordControl?.invalid || roleControl?.invalid) {
        this.showToast('Please fill all account details.', 'error');

        return;
      }

      if (passwordControl?.value !== confirmPasswordControl?.value) {
        this.showToast('Passwords do not match', 'error');

        return;
      }
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  register(): void {
    // Check form validation

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();

      this.showToast(
        'Please fill all required fields.',

        'error',
      );

      return;
    }

    // Check password matching

    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.showToast(
        'Passwords do not match',

        'error',
      );

      return;
    }

    // Create exact request object

    const requestData = {
      name: this.registerForm.value.name!,

      email: this.registerForm.value.email!,

      password: this.registerForm.value.password!,

      confirmPassword: this.registerForm.value.confirmPassword!,

      role: this.registerForm.value.role!,
    };

    console.log('Register Request:', requestData);

    this.authService.register(requestData).subscribe({
      next: () => {
        this.showToast(
          'Registration Successful',

          'success',
        );

        // Clear all entered values
        // Keep Employee as default role

        this.registerForm.reset({
          name: '',

          email: '',

          password: '',

          confirmPassword: '',

          role: 'Employee',
        });

        // Optional:
        // Close popup automatically
        // after success toast

        /*
          setTimeout(() => {

            this.closeModal.emit();

          }, 1500);
          */
      },

      error: (err: any) => {
        console.error('Registration Error:', err);

        this.showToast(
          err?.error?.message || err?.error || 'Registration failed',

          'error',
        );
      },
    });
  }
}
