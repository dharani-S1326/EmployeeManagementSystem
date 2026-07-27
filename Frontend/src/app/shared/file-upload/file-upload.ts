import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.html',
  styleUrl: './file-upload.css',
})
export class FileUploadComponent {
  @Input()
  label = 'Upload File';

  @Input()
  accept = '.pdf,.jpg,.jpeg,.png';

  @Input()
  maxSizeMB = 5;

  @Output()
  fileSelected = new EventEmitter<File | null>();

  selectedFile: File | null = null;

  errorMessage = '';

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    this.errorMessage = '';

    if (!file) {
      return;
    }

    const maxSize = this.maxSizeMB * 1024 * 1024;

    if (file.size > maxSize) {
      this.selectedFile = null;

      this.errorMessage = `File size cannot exceed ${this.maxSizeMB} MB`;

      this.fileSelected.emit(null);

      input.value = '';

      return;
    }

    const allowedExtensions = this.accept
      .split(',')
      .map((extension) => extension.trim().toLowerCase());

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      this.selectedFile = null;

      this.errorMessage = 'Invalid file type';

      this.fileSelected.emit(null);

      input.value = '';

      return;
    }

    this.selectedFile = file;

    this.fileSelected.emit(file);
  }

  removeFile(input: HTMLInputElement): void {
    this.selectedFile = null;

    this.errorMessage = '';

    input.value = '';

    this.fileSelected.emit(null);
  }
}
