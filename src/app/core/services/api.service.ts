import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  MoodLevel, RecommendationResponse,
  CommunityRoom, CommunityPost, DailyPhrase
} from '../models/models';

// ── Recommendations ──────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class RecommendationsService {
  private readonly API = `${environment.apiUrl}/recommendations`;

  constructor(private http: HttpClient) { }

  getByMoodLevel(level: MoodLevel) {
    return this.http.get<RecommendationResponse>(`${this.API}/${level}`);
  }
}

// ── Phrases ──────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class PhrasesService {
  private readonly API = `${environment.apiUrl}/phrases`;

  constructor(private http: HttpClient) { }

  getToday() {
    return this.http.get<{ phrase: DailyPhrase }>(`${this.API}/today`);
  }

  getRandom() {
    return this.http.get<{ phrase: DailyPhrase }>(`${this.API}/random`);
  }
}

// ── Community ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CommunityService {
  private readonly API = `${environment.apiUrl}/community`;

  constructor(private http: HttpClient) { }

  getRooms() {
    return this.http.get<{ rooms: CommunityRoom[] }>(`${this.API}/rooms`);
  }

  getPostsByRoom(roomId: string) {
    return this.http.get<{ roomId: string; room: string; totalPosts: number; posts: CommunityPost[] }>(
      `${this.API}/rooms/${roomId}/posts`
    );
  }

  createPost(content: string, isAnonymous: boolean, userId: string, roomId: string) {
    return this.http.post<{ message: string; post: CommunityPost }>(
      `${this.API}/posts`,
      { content, isAnonymous, userId, roomId }
    );
  }

  toggleHeart(postId: string, userId: string) {
    return this.http.post<{ message: string; hearts: number; liked: boolean }>(
      `${this.API}/posts/${postId}/heart`,
      { userId }
    );
  }

  deletePost(id: string) {
    return this.http.delete<{ message: string }>(`${this.API}/posts/${id}`);
  }
}
