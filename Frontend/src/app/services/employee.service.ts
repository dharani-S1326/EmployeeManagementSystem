import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../app/Environment/environment.development';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/Employee`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/get-all`, {
      headers: this.getHeaders(),
    });
  }

  getEmployeeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get-by-id/${id}`, {
      headers: this.getHeaders(),
    });
  }

  addEmployee(employee: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, employee, {
      headers: this.getHeaders(),
    });
  }

  updateEmployee(employee: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${employee.id}`, employee, {
      headers: this.getHeaders(),
    });
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: this.getHeaders(),
    });
  }
  getPagedEmployees(
    pageNumber: number,
    pageSize: number,
    search: string = '',
    department: string = '',
    role: string = '',
  ): Observable<any> {
    const params: any = {
      pageNumber,
      pageSize,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (department) {
      params.department = department;
    }

    if (role) {
      params.role = role;
    }

    return this.http.get<any>(`${this.apiUrl}/paged`, {
      params,
      headers: this.getHeaders(),
    });
  }
}
