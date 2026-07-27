import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Profile, UpdateProfilePayload } from '../../models/Profile.model';
import { FormFieldComponent } from '../../shared/form-field/form-field';
import { ButtonComponent } from '../../shared/button/button';
import { Toast } from '../../shared/toast/toast';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldComponent, ButtonComponent, Toast],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  constructor(private profileService: ProfileService, private cdr: ChangeDetectorRef) {}

  profile: Profile | null = null;

  loadingProfile = true;
  saving = false;
  editMode = false;

  toastVisible = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  profileForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]),
  });

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loadingProfile = true;

    this.profileService.getProfile().subscribe({
      next: (data: any) => {
        this.profile = data;
        this.patchForm(data);
        this.loadingProfile = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingProfile = false;
        this.showToast('Unable to load profile', 'error');
      },
    });
  }

  patchForm(data: Profile) {
    this.profileForm.patchValue({
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
    });
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastVisible = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
  }

  enterEditMode() {
    this.editMode = true;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (!allowedTypes.includes(file.type)) {
      this.showToast('Only JPG, JPEG or PNG images are allowed', 'error');
      input.value = '';
      return;
    }

    if (file.size > maxSize) {
      this.showToast('Image size must not exceed 2 MB', 'error');
      input.value = '';
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  save() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showToast('Please fix the highlighted fields', 'error');
      return;
    }

    this.saving = true;

    const payload: UpdateProfilePayload = {
      fullName: this.profileForm.value.fullName || '',
      email: this.profileForm.value.email || '',
      phoneNumber: this.profileForm.value.phoneNumber || '',
    };

    this.profileService.updateProfile(payload).subscribe({
      next: () => {
        if (this.selectedFile) {
          this.uploadSelectedImage();
        } else {
          this.finishSave('Profile updated successfully');
        }
      },
      error: (err) => {
        this.saving = false;
        this.showToast(err?.error?.message || 'Failed to update profile', 'error');
      },
    });
  }

  private uploadSelectedImage() {
    this.profileService.uploadImage(this.selectedFile as File).subscribe({
      next: () => {
        this.finishSave('Profile updated successfully');
      },
      error: (err) => {
        this.saving = false;
        this.showToast(err?.error?.message || 'Profile saved, but image upload failed', 'error');
      },
    });
  }

  private finishSave(message: string) {
    this.saving = false;
    this.editMode = false;
    this.selectedFile = null;
    this.previewUrl = null;
    this.showToast(message, 'success');
    this.loadProfile();
  }

  cancel() {
    if (this.profile) {
      this.patchForm(this.profile);
    }
    this.selectedFile = null;
    this.previewUrl = null;
    this.editMode = false;
  }
}
