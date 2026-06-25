import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="hero-content">
          <div class="hero-emoji">✨</div>
          <h1>Empieza hoy</h1>
          <p>Registrar tu ánimo cada día es un pequeño acto de autocuidado con gran impacto.</p>
          <div class="features">
            <div class="feature" *ngFor="let f of features">
              <span>{{ f.icon }}</span>
              <span>{{ f.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-card fade-in">
          <h2>Crear cuenta</h2>
          <p class="subtitle">Es gratis y solo toma un minuto.</p>

          <div *ngIf="error"   class="alert alert-error">{{ error }}</div>
          <div *ngIf="success" class="alert alert-success">{{ success }}</div>

          <div class="form-group">
            <label>¿Cómo te llamas?</label>
            <input class="input" type="text" placeholder="Tu nombre"
                   [(ngModel)]="name">
          </div>

          <div class="form-group">
            <label>Correo electrónico</label>
            <input class="input" type="email" placeholder="tu@correo.com"
                   [(ngModel)]="email">
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input class="input" type="password" placeholder="Mínimo 6 caracteres"
                   [(ngModel)]="password">
          </div>

          <button class="btn btn-primary btn-block" (click)="submit()" [disabled]="loading">
            {{ loading ? 'Creando cuenta...' : 'Crear cuenta gratis' }}
          </button>

          <div class="divider"></div>

          <p class="auth-link">
            ¿Ya tienes cuenta?
            <a routerLink="/login">Inicia sesión</a>
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

    .auth-left {
      flex: 1;
      background: linear-gradient(135deg, #1a1825 0%, #221835 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        width: 300px; height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(251,113,133,0.12) 0%, transparent 70%);
        bottom: -60px; left: -60px;
      }
    }

    .hero-content { max-width: 380px; position: relative; }
    .hero-emoji   { font-size: 3.5rem; margin-bottom: 16px; display: block; }
    .hero-content h1 { font-size: 3rem; color: var(--coral); margin-bottom: 12px; }
    .hero-content > p { font-size: 1rem; color: var(--text-2); line-height: 1.7; margin-bottom: 32px; }

    .features {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.9rem;
      color: var(--text-2);
      span:first-child { font-size: 1.2rem; }
    }

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

    @media (max-width: 768px) {
      .auth-left  { display: none; }
      .auth-right { width: 100%; padding: 32px 24px; }
    }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';

  features = [
    { icon: '😊', text: 'Radar de ánimo con 5 niveles' },
    { icon: '📓', text: 'Bitácora de Calma personal' },
    { icon: '💡', text: 'Recomendaciones según cómo te sientes' },
    { icon: '👥', text: 'Comunidad anónima de apoyo' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  submit() {
    if (!this.name || !this.email || !this.password) {
      this.error = 'Por favor completa todos los campos.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.success = '¡Cuenta creada! Redirigiendo...';
        setTimeout(() => this.router.navigate(['/dashboard']), 1000);
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error al crear la cuenta.';
        this.loading = false;
      }
    });
  }
}
