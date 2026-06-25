import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DiaryEntry } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DiaryService {
  private readonly API = `${environment.apiUrl}/diary`;

  constructor(private http: HttpClient) {}

  create(content: string, userId: string) {
    return this.http.post<{ message: string; entry: DiaryEntry }>(
      this.API,
      { content, userId }
    );
  }

  getByUser(userId: string) {
    return this.http.get<{ userId: string; totalEntries: number; entries: DiaryEntry[] }>(
      `${this.API}/user/${userId}`
    );
  }

  update(id: string, content: string) {
    return this.http.patch<{ message: string; entry: DiaryEntry }>(
      `${this.API}/${id}`,
      { content }
    );
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.API}/${id}`);
  }
}
