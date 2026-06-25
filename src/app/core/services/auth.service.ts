import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;

  // Signal reactivo con el usuario actual
  currentUser = signal<User | null>(this.loadFromStorage());

  constructor(private http: HttpClient, private router: Router) {}

  register(name: string, email: string, password: string) {
    return this.http
      .post<{ message: string; user: User }>(`${this.API}/auth/register`, { name, email, password })
      .pipe(tap(res => this.saveUser(res.user)));
  }

  login(email: string, password: string) {
    return this.http
      .post<{ message: string; user: User }>(`${this.API}/auth/login`, { email, password })
      .pipe(tap(res => this.saveUser(res.user)));
  }

  logout() {
    localStorage.removeItem('astress_user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  get userId(): string {
    return this.currentUser()?.id ?? '';
  }

  private saveUser(user: User) {
    localStorage.setItem('astress_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('astress_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
