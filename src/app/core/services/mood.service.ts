import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MoodLevel, MoodTag, MoodEntry } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MoodService {
  private readonly API = `${environment.apiUrl}/mood`;

  constructor(private http: HttpClient) {}

  create(level: MoodLevel, tags: MoodTag[], note: string, userId: string) {
    return this.http.post<{ message: string; entry: MoodEntry }>(
      this.API,
      { level, tags, note, userId }
    );
  }

  getByUser(userId: string) {
    return this.http.get<{ userId: string; totalEntries: number; entries: MoodEntry[] }>(
      `${this.API}/user/${userId}`
    );
  }

  getLatest(userId: string) {
    return this.http.get<{ entry: MoodEntry | null }>(
      `${this.API}/user/${userId}/latest`
    );
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.API}/${id}`);
  }
}
