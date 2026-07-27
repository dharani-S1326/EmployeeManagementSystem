import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent {

  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() control!: FormControl;
  @Input() errorMessage: string = '';
  @Input() options: string[] = [];
  @Input() readonly: boolean = false;
  @Input() maxlength: number | null = null;
  @Input() numbersOnly: boolean = false;

  showPassword = false;

  get inputType(): string {
    if (this.type === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onInput(event: Event): void {

    if (!this.numbersOnly) {
      return;
    }

    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '');

    if (this.maxlength) {
      value = value.slice(0, this.maxlength);
    }

    input.value = value;

    this.control.setValue(value, {
      emitEvent: false
    });

  }

}