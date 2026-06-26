import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CommunityService } from '../../core/services/api.service';
import { CommunityRoom, CommunityPost } from '../../core/models/models';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page fade-in">
      <div class="page-header">
        <h1>Comunidad 👥</h1>
        <p class="text-muted">Un espacio seguro y anónimo. Aquí no estás solo/a.</p>
      </div>

      <div class="community-layout">

        <!-- ── Salas ─────────────────────────────── -->
        <aside class="rooms-panel">
          <div class="rooms-header">
            <div class="rooms-title">Salas</div>
            <button class="btn-new-room" (click)="toggleNewRoomForm()" title="Nueva sala">＋</button>
          </div>

          <!-- Formulario nueva sala -->
          <div class="new-room-form" *ngIf="showNewRoomForm">
            <input
              class="input input-sm"
              placeholder="Nombre de la sala"
              [(ngModel)]="newRoomName"
              maxlength="60" />
            <input
              class="input input-sm"
              placeholder="Descripción (opcional)"
              [(ngModel)]="newRoomDescription"
              maxlength="200" />
            <div class="new-room-actions">
              <button
                class="btn btn-coral btn-sm"
                [disabled]="!newRoomName.trim() || creatingRoom"
                (click)="createRoom()">
                {{ creatingRoom ? 'Creando...' : 'Crear sala' }}
              </button>
              <button class="btn btn-ghost btn-sm" (click)="toggleNewRoomForm()">
                Cancelar
              </button>
            </div>
            <div *ngIf="roomError" class="alert alert-error mt-8">{{ roomError }}</div>
          </div>

          <div *ngIf="loadingRooms" class="spinner" style="margin:20px auto; width:20px; height:20px;"></div>
          <div class="rooms-list" *ngIf="!loadingRooms">
            <button
              *ngFor="let r of rooms"
              class="room-btn"
              [class.active]="selectedRoom?.id === r.id"
              (click)="selectRoom(r)">
              <div class="room-name">{{ r.name }}</div>
              <div class="room-count text-xs">{{ r._count?.posts ?? 0 }} posts</div>
            </button>
            <div *ngIf="rooms.length === 0" class="no-rooms">
              Aún no hay salas. ¡Crea la primera!
            </div>
          </div>
        </aside>

        <!-- ── Posts ─────────────────────────────── -->
        <div class="posts-panel">

          <div *ngIf="!selectedRoom" class="card empty-state">
            <p>Elige una sala para ver las publicaciones.</p>
          </div>

          <div *ngIf="selectedRoom">
            <!-- Nuevo post -->
            <div class="new-post card">
              <h3>{{ selectedRoom.name }}</h3>
              <p class="text-muted text-sm" *ngIf="selectedRoom.description">{{ selectedRoom.description }}</p>
              <div class="divider"></div>
              <textarea
                class="input"
                rows="3"
                placeholder="Escribe lo que sientes... La comunidad está aquí para escucharte."
                [(ngModel)]="newContent"
                [maxlength]="1000"></textarea>
              <div class="new-post-footer">
                <label class="anon-toggle">
                  <input type="checkbox" [(ngModel)]="isAnonymous">
                  <span>Publicar de forma anónima</span>
                </label>
                <button class="btn btn-coral btn-sm"
                        [disabled]="!newContent.trim() || posting"
                        (click)="post()">
                  {{ posting ? 'Publicando...' : 'Publicar' }}
                </button>
              </div>
              <div *ngIf="postError"   class="alert alert-error mt-8">{{ postError }}</div>
              <div *ngIf="postSuccess" class="alert alert-success mt-8">{{ postSuccess }}</div>
            </div>

            <!-- Lista de posts -->
            <div *ngIf="loadingPosts" class="spinner"></div>

            <div *ngIf="!loadingPosts && posts.length === 0" class="card empty-state">
              <div class="empty-icon">💬</div>
              <p>Aún no hay publicaciones aquí. ¡Sé el primero/a!</p>
            </div>

            <div class="posts-list" *ngIf="!loadingPosts">
              <div class="post-card card" *ngFor="let p of posts">
                <div class="post-author">
                  <div class="author-avatar">
                    {{ p.isAnonymous ? '🎭' : (p.user?.name?.charAt(0) ?? '?') }}
                  </div>
                  <div>
                    <div class="author-name">
                      {{ p.isAnonymous ? 'Anónimo/a' : (p.user?.name ?? 'Estudiante') }}
                    </div>
                    <div class="post-date text-xs text-muted">{{ p.createdAt | date:'dd MMM, HH:mm' }}</div>
                  </div>
                </div>

                <p class="post-content">{{ p.content }}</p>

                <div class="post-footer">
                  <button class="heart-btn" (click)="toggleHeart(p)">
                    ❤️ {{ p._count?.hearts ?? 0 }}
                  </button>
                  <button
                    *ngIf="p.userId === userId"
                    class="btn btn-ghost btn-sm"
                    (click)="deletePost(p.id)">
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 32px; max-width: 1000px; }
    .page-header { margin-bottom: 28px; h1 { color: var(--text); } }

    .community-layout {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 24px;
      align-items: start;
    }

    /* ── Rooms panel ────────────────────────── */
    .rooms-panel {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      position: sticky;
      top: 24px;
    }
    .rooms-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    .rooms-title {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-3);
    }
    .btn-new-room {
      background: var(--primary-dim);
      border: none;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      font-size: 1.1rem;
      line-height: 1;
      cursor: pointer;
      color: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      &:hover { background: var(--primary); color: #fff; }
    }

    /* ── New room form ──────────────────────── */
    .new-room-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
      padding: 12px;
      background: var(--bg-2);
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
    }
    .new-room-actions {
      display: flex;
      gap: 8px;
    }
    .no-rooms {
      font-size: 0.8rem;
      color: var(--text-3);
      text-align: center;
      padding: 16px 0;
    }

    .rooms-list  { display: flex; flex-direction: column; gap: 4px; }
    .room-btn {
      text-align: left;
      background: none;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      padding: 10px 12px;
      cursor: pointer;
      transition: all 0.15s;
      width: 100%;
      &:hover  { background: var(--bg-2); }
      &.active { background: var(--primary-dim); border-color: transparent; }
    }
    .room-name  { font-size: 0.875rem; font-weight: 500; color: var(--text); }
    .room-count { margin-top: 2px; color: var(--text-3); }

    /* ── Posts panel ────────────────────────── */
    .posts-panel { display: flex; flex-direction: column; gap: 16px; }

    .new-post {
      h3 { color: var(--text); margin-bottom: 4px; }
    }
    .new-post-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-top: 12px;
      flex-wrap: wrap;
    }
    .anon-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--text-2);
      cursor: pointer;
      input { accent-color: var(--primary); }
    }

    /* ── Posts ──────────────────────────────── */
    .posts-list { display: flex; flex-direction: column; gap: 12px; }
    .post-card  { }
    .post-author {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .author-avatar {
      width: 36px; height: 36px;
      background: var(--surface-2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }
    .author-name { font-size: 0.875rem; font-weight: 600; color: var(--text); }
    .post-content { color: var(--text); line-height: 1.7; white-space: pre-wrap; }
    .post-footer  { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
    .heart-btn {
      background: var(--coral-dim);
      border: 1px solid transparent;
      border-radius: 100px;
      padding: 6px 14px;
      font-size: 0.875rem;
      cursor: pointer;
      color: var(--coral);
      transition: all 0.15s;
      font-family: var(--font-body);
      &:hover { background: var(--coral); color: #fff; }
    }

    /* ── Responsive ────────────────────────── */
    @media (max-width: 700px) {
      .page { padding: 20px; }
      .community-layout { grid-template-columns: 1fr; }
      .rooms-panel { position: static; }
    }
  `]
})
export class CommunityComponent implements OnInit {
  rooms: CommunityRoom[] = [];
  posts: CommunityPost[] = [];
  selectedRoom: CommunityRoom | null = null;

  // Post
  newContent = '';
  isAnonymous = false;
  posting = false;
  postError = '';
  postSuccess = '';

  // Nueva sala
  showNewRoomForm = false;
  newRoomName = '';
  newRoomDescription = '';
  creatingRoom = false;
  roomError = '';

  loadingRooms = false;
  loadingPosts = false;

  constructor(
    private authService: AuthService,
    private communityService: CommunityService,
  ) { }

  get userId() { return this.authService.userId; }

  toggleNewRoomForm() {
    this.showNewRoomForm = !this.showNewRoomForm;
    this.newRoomName = '';
    this.newRoomDescription = '';
    this.roomError = '';
  }

  createRoom() {
    if (!this.newRoomName.trim()) return;
    this.creatingRoom = true;
    this.roomError = '';

    this.communityService.createRoom(this.newRoomName.trim(), this.newRoomDescription.trim()).subscribe({
      next: (r) => {
        this.rooms.unshift({ ...r.room, _count: { posts: 0 } });
        this.creatingRoom = false;
        this.showNewRoomForm = false;
        this.newRoomName = '';
        this.newRoomDescription = '';
        this.selectRoom(this.rooms[0]);
      },
      error: (err) => {
        this.roomError = err?.error?.message ?? 'Error al crear la sala.';
        this.creatingRoom = false;
      }
    });
  }

  selectRoom(room: CommunityRoom) {
    this.selectedRoom = room;
    this.loadingPosts = true;
    this.posts = [];

    this.communityService.getPostsByRoom(room.id).subscribe({
      next: (r) => { this.posts = r.posts; this.loadingPosts = false; },
      error: () => { this.loadingPosts = false; }
    });
  }

  post() {
    if (!this.newContent.trim() || !this.selectedRoom) return;
    this.posting = true;
    this.postError = '';

    this.communityService.createPost(this.newContent, this.isAnonymous, this.userId, this.selectedRoom.id).subscribe({
      next: (r) => {
        this.posts.unshift(r.post);
        this.newContent = '';
        this.posting = false;
        this.postSuccess = 'Publicado. La comunidad está contigo.';
        if (this.selectedRoom?._count) this.selectedRoom._count.posts++;
        setTimeout(() => this.postSuccess = '', 4000);
      },
      error: (err) => {
        this.postError = err?.error?.message ?? 'Error al publicar.';
        this.posting = false;
      }
    });
  }

  toggleHeart(post: CommunityPost) {
    this.communityService.toggleHeart(post.id, this.userId).subscribe({
      next: (r) => {
        if (post._count) post._count.hearts = r.hearts;
        else post._count = { hearts: r.hearts };
      },
      error: () => { }
    });
  }

  deletePost(id: string) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    this.communityService.deletePost(id).subscribe({
      next: () => this.posts = this.posts.filter(p => p.id !== id),
      error: () => { }
    });
  }

  ngOnInit() {
    this.loadingRooms = true;
    this.communityService.getRooms().subscribe({
      next: (r) => {
        this.rooms = r.rooms;
        this.loadingRooms = false;
        if (this.rooms.length) this.selectRoom(this.rooms[0]);
      },
      error: () => { this.loadingRooms = false; }
    });
  }
}