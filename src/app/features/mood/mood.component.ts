import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MoodService } from '../../core/services/mood.service';
import { MoodEntry, MoodLevel, MoodTag, MOOD_CONFIG, TAG_LABELS } from '../../core/models/models';

@Component({
  selector: 'app-mood',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <h1>Radar de Ánimo </h1>
        <p class="text-muted">¿Cómo estás en este momento?</p>
      </div>

      <!-- ── Selector de nivel ──────────────────── -->
      <div class="card mood-selector">
        <p class="selector-hint">Elige tu nivel de energía / humor:</p>
        <div class="mood-levels">
          <button
            *ngFor="let m of moodConfig"
            class="mood-btn"
            [class.selected]="selectedLevel === m.level"
            [style.--mood-color]="m.color"
            (click)="selectedLevel = m.level">
            <span class="mood-emoji">{{ m.emoji }}</span>
            <span class="mood-lbl">{{ m.label }}</span>
          </button>
        </div>

        <!-- ── Etiquetas rápidas ────────────────── -->
        <p class="selector-hint mt-24">¿Por qué te sientes así? (opcional)</p>
        <div class="tags-row">
          <button
            *ngFor="let tag of allTags"
            class="tag-btn"
            [class.active]="selectedTags.includes(tag)"
            (click)="toggleTag(tag)">
            {{ tagLabel(tag) }}
          </button>
        </div>

        <!-- ── Nota ────────────────────────────── -->
        <div class="form-group mt-24">
          <label>Nota rápida (opcional)</label>
          <textarea class="input" rows="2" placeholder="¿Algo que quieras recordar de este momento?"
                    [(ngModel)]="note"></textarea>
        </div>

        <div *ngIf="success" class="alert alert-success">{{ success }}</div>
        <div *ngIf="error"   class="alert alert-error">{{ error }}</div>

        <button class="btn btn-primary"
                [disabled]="!selectedLevel || loading"
                (click)="save()">
          {{ loading ? 'Guardando...' : 'Registrar ánimo' }}
        </button>

        <a routerLink="/recommendations" class="btn btn-ghost" style="margin-left:8px"
           *ngIf="selectedLevel">
          Ver recomendaciones →
        </a>
      </div>

      <!-- ── Historial ──────────────────────────── -->
      <div class="section-title">Historial reciente</div>

      <div *ngIf="loadingHistory" class="spinner"></div>

      <div *ngIf="!loadingHistory && entries.length === 0" class="card empty-state">
        <div class="empty-icon"></div>
        <p>Aún no tienes entradas registradas.</p>
      </div>

      <div class="history-list" *ngIf="!loadingHistory && entries.length">
        <div class="history-item card" *ngFor="let e of entries">
          <div class="h-left">
            <div class="h-emoji">{{ getEmoji(e.level) }}</div>
            <div>
              <div class="h-label">{{ getLabel(e.level) }}</div>
              <div class="h-date text-muted text-sm">{{ e.createdAt | date:'dd MMM yyyy, HH:mm' }}</div>
              <div class="mood-tags" *ngIf="e.tags.length">
                <span class="badge" *ngFor="let t of e.tags">{{ tagLabel(t) }}</span>
              </div>
              <p class="h-note text-sm" *ngIf="e.note">{{ e.note }}</p>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" (click)="delete(e.id)">🗑</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 760px; }

    .page-header { margin-bottom: 28px; h1 { color: var(--text); } }
    .section-title { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); margin: 28px 0 12px; }

    /* ── Selector ───────────────────────────── */
    .mood-selector { margin-bottom: 28px; }
    .selector-hint { font-size: 0.875rem; color: var(--text-2); margin-bottom: 16px; }

    .mood-levels {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .mood-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 16px 12px;
      border-radius: var(--radius);
      border: 2px solid var(--border);
      background: var(--bg-2);
      cursor: pointer;
      transition: all 0.2s;
      min-width: 90px;
      flex: 1;

      &:hover { border-color: var(--mood-color, var(--primary)); transform: translateY(-2px); }
      &.selected {
        border-color: var(--mood-color, var(--primary));
        background: color-mix(in srgb, var(--mood-color, var(--primary)) 12%, transparent);
        box-shadow: 0 4px 16px color-mix(in srgb, var(--mood-color, var(--primary)) 25%, transparent);
      }
    }
    .mood-emoji { font-size: 2rem; }
    .mood-lbl   { font-size: 0.75rem; color: var(--text-2); font-weight: 500; text-align: center; }

    /* ── Tags ───────────────────────────────── */
    .tags-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag-btn {
      padding: 6px 14px;
      border-radius: 100px;
      border: 1px solid var(--border);
      background: var(--bg-2);
      color: var(--text-2);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.15s;
      font-family: var(--font-body);

      &:hover  { border-color: var(--primary); color: var(--text); }
      &.active { background: var(--primary-dim); border-color: var(--primary); color: var(--primary); }
    }

    /* ── History ────────────────────────────── */
    .history-list { display: flex; flex-direction: column; gap: 12px; }
    .history-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .h-left  { display: flex; align-items: flex-start; gap: 14px; }
    .h-emoji { font-size: 2rem; }
    .h-label { font-weight: 600; color: var(--text); margin-bottom: 2px; }
    .mood-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .h-note  { color: var(--text-2); margin-top: 6px; font-style: italic; }

    @media (max-width: 600px) {
      .page { padding: 20px; }
      .mood-levels { gap: 8px; }
      .mood-btn { min-width: 70px; padding: 12px 8px; }
      .mood-emoji { font-size: 1.6rem; }
    }
  `]
})
export class MoodComponent implements OnInit {
  moodConfig = MOOD_CONFIG;
  allTags: MoodTag[] = ['EXAMENES', 'FALTA_DE_SUENO', 'PROBLEMAS_PERSONALES', 'CARGA_DE_TAREAS'];

  selectedLevel: MoodLevel | null = null;
  selectedTags: MoodTag[] = [];
  note = '';

  entries: MoodEntry[] = [];
  loading = false;
  loadingHistory = false;
  success = '';
  error = '';

  constructor(private authService: AuthService, private moodService: MoodService) {}

  getEmoji(level: MoodLevel) { return MOOD_CONFIG.find(m => m.level === level)?.emoji ?? ''; }
  getLabel(level: MoodLevel) { return MOOD_CONFIG.find(m => m.level === level)?.label ?? level; }
  tagLabel(tag: string)      { return (TAG_LABELS as any)[tag] ?? tag; }

  toggleTag(tag: MoodTag) {
    const idx = this.selectedTags.indexOf(tag);
    if (idx >= 0) this.selectedTags.splice(idx, 1);
    else this.selectedTags.push(tag);
  }

  save() {
    if (!this.selectedLevel) return;
    this.loading = true;
    this.error = '';
    this.success = '';

    this.moodService.create(this.selectedLevel, this.selectedTags, this.note, this.authService.userId).subscribe({
      next: (res) => {
        this.success = res.message;
        this.loading = false;
        this.entries.unshift(res.entry);
        this.selectedLevel = null;
        this.selectedTags = [];
        this.note = '';
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err?.error?.message ?? 'Error al guardar.';
        this.loading = false;
      }
    });
  }

  delete(id: string) {
    this.moodService.delete(id).subscribe({
      next: () => this.entries = this.entries.filter(e => e.id !== id),
      error: () => {}
    });
  }

  ngOnInit() {
    this.loadingHistory = true;
    this.moodService.getByUser(this.authService.userId).subscribe({
      next: (r) => { this.entries = r.entries; this.loadingHistory = false; },
      error: () => { this.loadingHistory = false; }
    });
  }
}
