import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MoodService } from '../../core/services/mood.service';
import { RecommendationsService } from '../../core/services/api.service';
import {
  MoodLevel, MoodEntry, RecommendationResponse,
  REC_ICONS, MOOD_CONFIG
} from '../../core/models/models';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <h1>Para ti</h1>
        <p class="text-muted">Recomendaciones según cómo te sientes.</p>
      </div>

      <!-- ── Selector rápido de nivel ───────────── -->
      <div class="level-picker card">
        <p class="picker-label">Selecciona un nivel para ver sus recomendaciones:</p>
        <div class="picker-row">
          <button
            *ngFor="let m of moodConfig"
            class="pick-btn"
            [class.active]="selectedLevel === m.level"
            [style.--c]="m.color"
            (click)="selectLevel(m.level)">
            {{ m.emoji }} {{ m.label }}
          </button>
        </div>
      </div>

      <!-- ── Loading ────────────────────────────── -->
      <div *ngIf="loading" class="spinner"></div>

      <!-- ── Sin nivel ──────────────────────────── -->
      <div *ngIf="!loading && !data && !selectedLevel" class="card empty-state">
        <p>Elige un nivel de ánimo arriba o <a routerLink="/mood">registra tu ánimo</a> para ver recomendaciones.</p>
      </div>

      <!-- ── Recomendaciones ────────────────────── -->
      <div *ngIf="data && !loading" class="recs-section fade-in">
        <div class="mood-banner card">
          <div class="banner-emoji">{{ getEmoji(data.moodLevel) }}</div>
          <div>
            <h3>{{ data.moodLabel }}</h3>
            <p>{{ data.message }}</p>
          </div>
        </div>

        <div class="rec-grid">
          <div class="rec-card card" *ngFor="let r of data.recommendations">
            <div class="rec-top">
              <span class="rec-icon">{{ getRecIcon(r.type) }}</span>
              <span class="badge badge-primary">{{ typeLabel(r.type) }}</span>
              <span class="badge" *ngIf="r.duration">⏱ {{ r.duration }}</span>
            </div>
            <h3>{{ r.title }}</h3>
            <p>{{ r.description }}</p>
            <a *ngIf="r.link" [href]="r.link" target="_blank" class="btn btn-ghost btn-sm mt-16">
              Ver recurso →
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 900px; }
    .page-header { margin-bottom: 28px; h1 { color: var(--text); } }

    /* ── Picker ─────────────────────────────── */
    .level-picker { margin-bottom: 28px; }
    .picker-label { font-size: 0.875rem; color: var(--text-2); margin-bottom: 14px; }
    .picker-row   { display: flex; flex-wrap: wrap; gap: 8px; }
    .pick-btn {
      padding: 8px 16px;
      border-radius: 100px;
      border: 1px solid var(--border);
      background: var(--bg-2);
      color: var(--text-2);
      font-family: var(--font-body);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      &:hover  { border-color: var(--c); color: var(--text); }
      &.active { background: color-mix(in srgb, var(--c) 15%, transparent); border-color: var(--c); color: var(--text); }
    }

    /* ── Mood banner ────────────────────────── */
    .mood-banner {
      display: flex;
      align-items: center;
      gap: 20px;
      background: linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%);
      margin-bottom: 20px;
      h3 { color: var(--text); margin-bottom: 4px; }
    }
    .banner-emoji { font-size: 3rem; }

    /* ── Rec grid ───────────────────────────── */
    .rec-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .rec-card {
      h3 { color: var(--text); margin: 10px 0 8px; font-size: 1rem; }
      p  { font-size: 0.9rem; line-height: 1.6; }
    }
    .rec-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .rec-icon { font-size: 1.5rem; }

    @media (max-width: 600px) { .page { padding: 20px; } }
  `]
})
export class RecommendationsComponent implements OnInit {
  moodConfig = MOOD_CONFIG;
  selectedLevel: MoodLevel | null = null;
  data: RecommendationResponse | null = null;
  loading = false;
  latestMood: MoodEntry | null = null;

  constructor(
    private authService: AuthService,
    private moodService: MoodService,
    private recService: RecommendationsService,
  ) {}

  getEmoji(level: MoodLevel) { return MOOD_CONFIG.find(m => m.level === level)?.emoji ?? '😶'; }
  getRecIcon(type: string)   { return (REC_ICONS as any)[type] ?? '💡'; }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      respiracion: 'Respiración', descanso: 'Descanso',
      tecnica: 'Técnica', contenido: 'Recurso', general: 'Consejo',
    };
    return map[type] ?? type;
  }

  selectLevel(level: MoodLevel) {
    this.selectedLevel = level;
    this.loading = true;
    this.recService.getByMoodLevel(level).subscribe({
      next: (r) => { this.data = r; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  ngOnInit() {
    // Auto-cargar con el último ánimo registrado
    this.moodService.getLatest(this.authService.userId).subscribe({
      next: (r) => { if (r.entry) this.selectLevel(r.entry.level); },
      error: () => {}
    });
  }
}
