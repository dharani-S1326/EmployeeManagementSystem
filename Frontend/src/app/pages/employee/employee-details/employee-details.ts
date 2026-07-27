import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-details.html',
  styleUrls: ['./employee-details.css'],
})
export class EmployeeDetailsComponent {
  employee = {
    id: 1,
    name: 'John',
    email: 'john@gmail.com',
    phone: '9876543210',
    department: 'IT',
    designation: 'Software Engineer',
    salary: 50000,
  };
}
