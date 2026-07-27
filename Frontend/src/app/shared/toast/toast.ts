import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrls: ['./toast.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class Toast {
  @Input() visible = false;

  @Input() message = '';

  @Input() type: 'success' | 'error' = 'success';
}
