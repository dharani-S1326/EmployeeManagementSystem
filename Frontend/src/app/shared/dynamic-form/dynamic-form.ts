import { CommonModule } from '@angular/common';

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

export interface DynamicFormField {
  name: string;

  label: string;

  type: 'text' | 'email' | 'number' | 'password' | 'select';

  placeholder?: string;

  value?: any;

  options?: string[];

  required?: boolean;

  minLength?: number;

  maxLength?: number;

  min?: number;

  pattern?: string;

  disabled?: boolean;

  errorMessage?: string;
}

@Component({
  selector: 'app-dynamic-form',

  standalone: true,

  imports: [CommonModule, ReactiveFormsModule],

  templateUrl: './dynamic-form.html',

  styleUrl: './dynamic-form.css',
})
export class DynamicFormComponent implements OnChanges {
  @Input()
  fields: DynamicFormField[] = [];

  @Output()
  formReady = new EventEmitter<FormGroup>();

  @Output()
  fieldChanged = new EventEmitter<{
    name: string;
    value: any;
  }>();

  form = new FormGroup({});

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields']) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const controls: Record<string, FormControl> = {};

    for (const field of this.fields) {
      const validators: ValidatorFn[] = [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.minLength !== undefined) {
        validators.push(Validators.minLength(field.minLength));
      }

      if (field.maxLength !== undefined) {
        validators.push(Validators.maxLength(field.maxLength));
      }

      if (field.min !== undefined) {
        validators.push(Validators.min(field.min));
      }

      if (field.pattern) {
        validators.push(Validators.pattern(field.pattern));
      }

      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      controls[field.name] = new FormControl(
        {
          value: field.value ?? '',

          disabled: field.disabled ?? false,
        },

        validators,
      );
    }

    this.form = new FormGroup(controls);

    this.formReady.emit(this.form);
  }

  onFieldChange(field: DynamicFormField): void {
    const value = this.form.get(field.name)?.value;

    this.fieldChanged.emit({
      name: field.name,

      value: value,
    });
  }
  passwordVisibility: Record<string, boolean> = {};

  togglePasswordVisibility(fieldName: string): void {
    this.passwordVisibility[fieldName] = !this.passwordVisibility[fieldName];
  }

  getInputType(field: DynamicFormField): string {
    if (field.type !== 'password') {
      return field.type;
    }

    return this.passwordVisibility[field.name] ? 'text' : 'password';
  }

  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }
}
