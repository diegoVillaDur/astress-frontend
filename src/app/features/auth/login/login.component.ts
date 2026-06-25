import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="hero-content">
          <div class="hero-emoji">🧠</div>
          <h1>AStress</h1>
          <p>Tu espacio seguro para procesar, descansar y seguir adelante.</p>
          <div class="quote-card">
            <p>"Pedir ayuda no es debilidad,<br>es inteligencia emocional."</p>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card fade-in">
          <h2>Bienvenido/a de vuelta</h2>
          <p class="subtitle">Nos alegra que estés aquí.</p>

          <div *ngIf="error" class="alert alert-error">{{ error }}</div>

          <div class="form-group">
            <label>Correo electrónico</label>
            <input class="input" type="email" placeholder="tu@correo.com"
                   [(ngModel)]="email" (keyup.enter)="submit()">
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input class="input" type="password" placeholder="••••••••"
                   [(ngModel)]="password" (keyup.enter)="submit()">
          </div>

          <button class="btn btn-primary btn-block" (click)="submit()" [disabled]="loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>

          <div class="divider"></div>

          <p class="auth-link">
            ¿Aún no tienes cuenta?
            <a routerLink="/register">Regístrate gratis</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
    }

    /* ── Left panel ─────────────────────────── */
    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #1c1830 0%, #2d2050 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        width: 400px; height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%);
        top: -100px; right: -100px;
      }
    }

    .hero-content {
      max-width: 380px;
      position: relative;
    }

    .hero-emoji {
      font-size: 3.5rem;
      margin-bottom: 16px;
      display: block;
    }

    .hero-content h1 {
      font-size: 3rem;
      color: var(--primary);
      margin-bottom: 12px;
    }

    .hero-content > p {
      font-size: 1.1rem;
      color: var(--text-2);
      line-height: 1.7;
      margin-bottom: 32px;
    }

    .quote-card {
      background: var(--glass);
      border: 1px solid var(--glass-border);
      border-left: 3px solid var(--primary);
      border-radius: var(--radius-sm);
      padding: 20px;
      backdrop-filter: blur(8px);

      p {
        color: var(--text);
        font-style: italic;
        font-size: 0.95rem;
        line-height: 1.7;
      }
    }

    /* ── Right panel ────────────────────────── */
    .auth-right {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
      background: var(--bg);
    }

    .auth-card {
      width: 100%;

      h2 { margin-bottom: 6px; }
      .subtitle { color: var(--text-2); margin-bottom: 28px; }
    }

    .auth-link {
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-2);
      a { color: var(--primary); font-weight: 600; }
    }

    /* ── Responsive ────────────────────────── */
    @media (max-width: 768px) {
      .auth-left { display: none; }
      .auth-right { width: 100%; padding: 32px 24px; }
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  submit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = err?.error?.message ?? 'Correo o contraseña incorrectos.';
        this.loading = false;
      }
    });
  }
}
