import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DiaryService } from '../../core/services/diary.service';
import { DiaryEntry } from '../../core/models/models';

@Component({
  selector: 'app-diary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <h1>Bitácora de Calma 📓</h1>
        <p class="text-muted">Un espacio solo tuyo. Escribe sin filtros.</p>
      </div>

      <!-- ── Editor ────────────────────────────── -->
      <div class="card editor-card">
        <div class="editor-header">
          <span class="entry-date">{{ today }}</span>
          <span class="char-count text-muted text-xs">{{ content.length }}/5000</span>
        </div>
        <textarea
          class="diary-textarea"
          placeholder="¿Qué tienes en la mente? Puedes escribir lo que sea aquí..."
          [(ngModel)]="content"
          [maxlength]="5000"
          rows="6"></textarea>

        <div *ngIf="success" class="alert alert-success">{{ success }}</div>
        <div *ngIf="error"   class="alert alert-error">{{ error }}</div>

        <div class="editor-actions">
          <button class="btn btn-primary"
                  [disabled]="!content.trim() || loading"
                  (click)="save()">
            {{ loading ? 'Guardando...' : 'Guardar entrada' }}
          </button>
          <button class="btn btn-ghost" *ngIf="editingId" (click)="cancelEdit()">Cancelar</button>
        </div>
      </div>

      <!-- ── Entradas ───────────────────────────── -->
      <div class="section-title">Entradas anteriores ({{ entries.length }})</div>

      <div *ngIf="loadingEntries" class="spinner"></div>

      <div *ngIf="!loadingEntries && entries.length === 0" class="card empty-state">
        <p>Tu bitácora está vacía. Escribe tu primera entrada arriba.</p>
      </div>

      <div class="entries-list" *ngIf="!loadingEntries">
        <div class="entry-card card" *ngFor="let e of entries">
          <div class="entry-meta">
            <span class="entry-date-sm text-muted text-xs">{{ e.createdAt | date:'EEEE dd MMM yyyy, HH:mm' }}</span>
            <div class="entry-actions">
              <button class="edit-btn" title="Editar" (click)="startEdit(e)">Editar</button>
              <button class="delete-btn" title="Eliminar" (click)="delete(e.id)">Borrar</button>
            </div>
          </div>

          <!-- Modo edición -->
          <div *ngIf="editingId === e.id">
            <textarea class="input" rows="4" [(ngModel)]="editContent"></textarea>
            <div class="flex gap-8 mt-8">
              <button class="btn btn-primary btn-sm" (click)="saveEdit(e.id)">Guardar</button>
              <button class="btn btn-ghost btn-sm" (click)="cancelEdit()">Cancelar</button>
            </div>
          </div>

          <!-- Modo lectura -->
          <p class="entry-content" *ngIf="editingId !== e.id">{{ e.content }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 760px; }
    .page-header { margin-bottom: 28px; h1 { color: var(--text); } }
    .section-title { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-3); margin: 28px 0 12px; }

    /* ── Editor ─────────────────────────────── */
    .editor-card { margin-bottom: 28px; }
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .entry-date { font-size: 0.85rem; color: var(--primary); font-weight: 600; }

    .diary-textarea {
      width: 100%;
      background: var(--bg-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 16px;
      color: var(--text);
      font-family: var(--font-body);
      font-size: 1rem;
      line-height: 1.7;
      resize: vertical;
      transition: border-color 0.2s;
      margin-bottom: 16px;

      &::placeholder { color: var(--text-3); }
      &:focus { outline: none; border-color: var(--primary); }
    }

    .editor-actions { display: flex; gap: 8px; }

    /* ── Entries ────────────────────────────── */
    .entries-list { display: flex; flex-direction: column; gap: 16px; }

    .entry-card { }
    .entry-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .entry-date-sm { text-transform: capitalize; }
    .entry-actions { display: flex; gap: 4px; }
    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      padding: 4px 6px;
      border-radius: 6px;
      opacity: 0.6;
      transition: opacity 0.2s, background 0.2s;
      &:hover { opacity: 1; background: var(--bg-2); }
    }
    .edit-btn {
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

     &:hover {color: #3b82f6; border-color: rgba(59, 130, 246, 0.2);background: rgba(59, 130, 246, 0.1);}
    }
    .delete-btn {
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
    .entry-content {
      color: var(--text);
      line-height: 1.75;
      white-space: pre-wrap;
    }

    @media (max-width: 600px) { .page { padding: 20px; } }
  `]
})
export class DiaryComponent implements OnInit {
  content = '';
  entries: DiaryEntry[] = [];
  loading = false;
  loadingEntries = false;
  success = '';
  error = '';
  editingId: string | null = null;
  editContent = '';

  constructor(private authService: AuthService, private diaryService: DiaryService) { }

  get today() {
    return new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  save() {
    if (!this.content.trim()) return;
    this.loading = true;
    this.error = '';

    this.diaryService.create(this.content, this.authService.userId).subscribe({
      next: (r) => {
        this.entries.unshift(r.entry);
        this.content = '';
        this.success = 'Entrada guardada.';
        this.loading = false;
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => { this.error = err?.error?.message ?? 'Error al guardar.'; this.loading = false; }
    });
  }

  startEdit(e: DiaryEntry) { this.editingId = e.id; this.editContent = e.content; }
  cancelEdit() { this.editingId = null; this.editContent = ''; }

  saveEdit(id: string) {
    this.diaryService.update(id, this.editContent).subscribe({
      next: (r) => {
        const idx = this.entries.findIndex(e => e.id === id);
        if (idx >= 0) this.entries[idx] = r.entry;
        this.cancelEdit();
      },
      error: () => { }
    });
  }

  delete(id: string) {
    if (!confirm('¿Eliminar esta entrada?')) return;
    this.diaryService.delete(id).subscribe({
      next: () => this.entries = this.entries.filter(e => e.id !== id),
      error: () => { }
    });
  }

  ngOnInit() {
    this.loadingEntries = true;
    this.diaryService.getByUser(this.authService.userId).subscribe({
      next: (r) => { this.entries = r.entries; this.loadingEntries = false; },
      error: () => { this.loadingEntries = false; }
    });
  }
}
