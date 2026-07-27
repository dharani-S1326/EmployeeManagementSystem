import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../app/Environment/environment.development';

import { Payroll } from '../models/payroll.model';

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private readonly apiUrl = `${environment.apiUrl}/Payroll`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getPayroll(): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  getEmployeePayroll(employeeId: number): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(`${this.apiUrl}/${employeeId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  generatePayroll(data: Payroll): Observable<any> {
    return this.http.post(this.apiUrl, data, {
      headers: this.getAuthHeaders(),
    });
  }

  updatePayroll(id: number, data: Payroll): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, {
      headers: this.getAuthHeaders(),
    });
  }

  deletePayroll(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
