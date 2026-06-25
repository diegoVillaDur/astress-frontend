import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- ── Sidebar desktop ─────────────────────── -->
    <nav class="sidebar">
      <div class="brand">
        <span class="brand-icon"></span>
        <span class="brand-name">AStress</span>
      </div>

      <div class="user-chip">
        <div class="avatar">{{ initial }}</div>
        <div>
          <div class="user-name">{{ user?.name }}</div>
          <div class="user-sub">Estudiante</div>
        </div>
      </div>

      <ul class="nav-links">
        <li *ngFor="let item of navItems">
          <a [routerLink]="item.path"
             routerLinkActive="active"
             class="nav-link">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </li>
      </ul>

      <button class="logout-btn" (click)="logout()">
        Cerrar sesión
      </button>
    </nav>

    <!-- ── Bottom bar móvil ─────────────────────── -->
    <nav class="bottom-bar">
      <a *ngFor="let item of navItems"
         [routerLink]="item.path"
         routerLinkActive="active"
         class="bottom-item">
        <span class="bottom-icon">{{ item.icon }}</span>
        <span class="bottom-label">{{ item.label }}</span>
      </a>
    </nav>
  `,
  styles: [`
    /* ── Sidebar ───────────────────────────── */
    .sidebar {
      position: fixed;
      top: 0; left: 0; bottom: 0;
      width: 240px;
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 24px 16px;
      z-index: 100;
      gap: 8px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 8px;
      margin-bottom: 20px;
    }
    .brand-icon { font-size: 1.6rem; }
    .brand-name {
      font-family: var(--font-head);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--primary);
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--bg-2);
      border-radius: var(--radius-sm);
      margin-bottom: 16px;
    }
    .avatar {
      width: 36px; height: 36px;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #0d0b1a;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .user-name { font-size: 0.875rem; font-weight: 600; color: var(--text); }
    .user-sub  { font-size: 0.75rem; color: var(--text-3); }

    .nav-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      color: var(--text-2);
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
      text-decoration: none;

      &:hover { background: var(--bg-2); color: var(--text); }
      &.active {
        background: var(--primary-dim);
        color: var(--primary);
      }
    }
    .nav-icon  { font-size: 1.1rem; width: 20px; text-align: center; }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: none;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      color: var(--text-3);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;

      &:hover { color: var(--coral); border-color: var(--coral-dim); background: var(--coral-dim); }
    }

    /* ── Bottom bar ────────────────────────── */
    .bottom-bar {
      display: none;
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: var(--surface);
      border-top: 1px solid var(--border);
      z-index: 100;
      padding: 8px 0 env(safe-area-inset-bottom);
    }
    .bottom-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      flex: 1;
      color: var(--text-3);
      text-decoration: none;
      padding: 6px 0;
      transition: color 0.2s;
      font-size: 0;

      &.active { color: var(--primary); }
    }
    .bottom-icon  { font-size: 1.3rem; }
    .bottom-label { font-size: 0.65rem; font-family: var(--font-body); }

    /* ── Responsive ────────────────────────── */
    @media (max-width: 767px) {
      .sidebar    { display: none; }
      .bottom-bar { display: flex; }
    }
  `]
})
export class NavbarComponent {
  navItems: NavItem[] = [
    { path: '/dashboard',       icon: '', label: 'Inicio' },
    { path: '/mood',            icon: '', label: 'Mi Ánimo' },
    { path: '/diary',           icon: '', label: 'Bitácora' },
    { path: '/recommendations', icon: '', label: 'Para ti' },
    { path: '/community',       icon: '', label: 'Comunidad' },
  ];

  constructor(public authService: AuthService) {}

  get user()    { return this.authService.currentUser(); }
  get initial() { return this.user?.name?.charAt(0).toUpperCase() ?? '?'; }

  logout() { this.authService.logout(); }
}
