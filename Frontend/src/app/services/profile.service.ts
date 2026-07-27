import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../app/Environment/environment.development';
import { Profile, UpdateProfilePayload } from '../models/Profile.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  updateProfile(payload: UpdateProfilePayload): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(this.apiUrl, payload, {
      headers: this.getHeaders(),
    });
  }

  uploadImage(file: File): Observable<{ message: string; imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ message: string; imageUrl: string }>(
      `${this.apiUrl}/upload-image`,
      formData,
      {
        headers: this.getHeaders(),
      },
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
