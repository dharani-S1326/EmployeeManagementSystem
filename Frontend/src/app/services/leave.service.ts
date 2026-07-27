import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../app/Environment/environment.development';

import { Leave } from '../models/leave.model';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly apiUrl = `${environment.apiUrl}/Leave`;

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

  private getFileUploadHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    /*
      Do NOT manually add:

      Content-Type: multipart/form-data

      Browser automatically adds the correct
      multipart boundary.
    */

    return headers;
  }

  getAllLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(
      this.apiUrl,

      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  getMyLeaves(): Observable<Leave[]> {
    return this.http.get<Leave[]>(
      `${this.apiUrl}/my-leaves`,

      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  getLeaveById(id: number): Observable<Leave> {
    return this.http.get<Leave>(
      `${this.apiUrl}/${id}`,

      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  applyLeave(formData: FormData): Observable<any> {
    return this.http.post(
      this.apiUrl,

      formData,

      {
        headers: this.getFileUploadHeaders(),
      },
    );
  }

  approveLeave(id: number, remarks: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/approve/${id}`,

      {
        remarks: remarks,
      },

      {
        headers: this.getAuthHeaders(),
      },
    );
  }

  rejectLeave(id: number, remarks: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/reject/${id}`,

      {
        remarks: remarks,
      },

      {
        headers: this.getAuthHeaders(),
      },
    );
  }
}
