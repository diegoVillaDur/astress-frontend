import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MoodService } from '../../core/services/mood.service';
import { PhrasesService } from '../../core/services/api.service';
import { MoodEntry, DailyPhrase, MOOD_CONFIG } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], //<h1>Hola, {{ user?.name?.split(' ')[0] }}</h1>
  template: `
    <div class="page fade-in">

      <!-- ── Header ─────────────────────────────── -->
      <div class="page-header">
        <div>
          <p class="text-muted">{{ today }}</p>
        </div>
      </div>

      <!-- ── Frase del día ──────────────────────── -->
      <div class="phrase-card card" *ngIf="phrase">
        <div class="phrase-label">💬 Frase del día</div>
        <blockquote>"{{ phrase.text }}"</blockquote>
        <cite *ngIf="phrase.author">— {{ phrase.author }}</cite>
      </div>

      <!-- ── Estado de ánimo actual ─────────────── -->
      <div class="section-title">Tu estado de ánimo</div>
      <div class="mood-now card" *ngIf="latestMood; else noMood">
        <div class="mood-now-inner">
          <div class="big-emoji">{{ moodEmoji }}</div>
          <div>
            <div class="mood-label">{{ moodLabel }}</div>
            <div class="mood-when text-muted text-sm">{{ latestMood.createdAt | date:'dd MMM, HH:mm' }}</div>
            <div class="mood-tags" *ngIf="latestMood.tags.length">
              <span class="badge" *ngFor="let tag of latestMood.tags">{{ tagLabel(tag) }}</span>
            </div>
          </div>
        </div>
        <a routerLink="/recommendations" class="btn btn-primary btn-sm">Ver recomendaciones →</a>
      </div>
      <ng-template #noMood>
        <div class="card empty-state">
          <div class="empty-icon">😶</div>
          <p>Aún no has registrado tu ánimo hoy.</p>
          <a routerLink="/mood" class="btn btn-primary btn-sm mt-16">Registrar ahora</a>
        </div>
      </ng-template>

      <!-- ── Accesos rápidos ────────────────────── -->
      <div class="section-title">Accesos rápidos</div>
      <div class="quick-grid">
        <a *ngFor="let q of quickActions" [routerLink]="q.path" class="quick-card card">
          <div class="quick-icon">{{ q.icon }}</div>
          <div class="quick-name">{{ q.name }}</div>
          <div class="quick-desc text-muted text-sm">{{ q.desc }}</div>
        </a>
      </div>

    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 800px; }

    .page-header {
      margin-bottom: 28px;
      h1 { color: var(--text); }
    }

    /* ── Frase ─────────────────────────────── */
    .phrase-card {
      background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
      border-left: 3px solid var(--primary);
      margin-bottom: 28px;
    }
    .phrase-label { font-size: 0.8rem; color: var(--text-3); margin-bottom: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    blockquote { font-size: 1.1rem; color: var(--text); font-style: italic; line-height: 1.7; margin-bottom: 8px; font-family: var(--font-head); font-weight: 300; }
    cite { font-size: 0.85rem; color: var(--text-2); }

    /* ── Mood now ──────────────────────────── */
    .section-title { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); margin-bottom: 12px; }

    .mood-now {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    }
    .mood-now-inner { display: flex; align-items: center; gap: 16px; }
    .big-emoji { font-size: 2.8rem; line-height: 1; }
    .mood-label { font-size: 1.1rem; font-weight: 600; color: var(--text); margin-bottom: 2px; }
    .mood-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }

    /* ── Quick grid ────────────────────────── */
    .quick-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 16px;
    }
    .quick-card {
      text-decoration: none;
      transition: transform 0.2s, border-color 0.2s;
      &:hover { transform: translateY(-2px); border-color: var(--primary); }
    }
    .quick-icon { font-size: 1.8rem; margin-bottom: 10px; }
    .quick-name { font-weight: 600; color: var(--text); margin-bottom: 4px; }

    @media (max-width: 600px) {
      .page { padding: 20px; }
      .mood-now { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  phrase: DailyPhrase | null = null;
  latestMood: MoodEntry | null = null;

  quickActions = [
    { path: '/mood', icon: '😊', name: 'Radar de Ánimo', desc: 'Registra cómo te sientes' },
    { path: '/diary', icon: '📓', name: 'Bitácora', desc: 'Escribe lo que piensas' },
    { path: '/recommendations', icon: '💡', name: 'Para ti', desc: 'Tips según tu ánimo' },
    { path: '/community', icon: '👥', name: 'Comunidad', desc: 'No estás solo/a' },
  ];

  constructor(
    public authService: AuthService,
    private moodService: MoodService,
    private phrasesService: PhrasesService,
  ) { }

  get user() { return this.authService.currentUser(); }
  get today() { return new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); }
  get moodEmoji() { return MOOD_CONFIG.find(m => m.level === this.latestMood?.level)?.emoji ?? '😶'; }
  get moodLabel() { return MOOD_CONFIG.find(m => m.level === this.latestMood?.level)?.label ?? ''; }

  tagLabel(tag: string): string {
    const map: Record<string, string> = {
      EXAMENES: '📝 Exámenes', FALTA_DE_SUENO: '😴 Sueño',
      PROBLEMAS_PERSONALES: '💬 Personal', CARGA_DE_TAREAS: '📚 Tareas',
    };
    return map[tag] ?? tag;
  }

  ngOnInit() {
    this.phrasesService.getToday().subscribe({ next: r => this.phrase = r.phrase, error: () => { } });
    if (this.authService.userId) {
      this.moodService.getLatest(this.authService.userId).subscribe({ next: r => this.latestMood = r.entry, error: () => { } });
    }
  }
}
