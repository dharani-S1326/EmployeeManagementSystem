import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  @Input() text: string = 'Button';

  @Input() type: 'button' | 'submit' = 'button';

  @Input() variant: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' = 'primary';

  @Input() disabled: boolean = false;

  @Input() icon: string = '';

  @Output() buttonClick = new EventEmitter<void>();

  onClick() {
    this.buttonClick.emit();
  }
}
