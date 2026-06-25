// ── Usuario ──────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// ── Ánimo ─────────────────────────────────────────────────
export type MoodLevel =
  | 'ATOPE'
  | 'BIEN'
  | 'REGULAR'
  | 'MAL'
  | 'BURNOUT';

export type MoodTag =
  | 'EXAMENES'
  | 'FALTA_DE_SUENO'
  | 'PROBLEMAS_PERSONALES'
  | 'CARGA_DE_TAREAS';

export interface MoodEntry {
  id: string;
  level: MoodLevel;
  tags: MoodTag[];
  note?: string;
  userId: string;
  createdAt: string;
}

export interface MoodConfig {
  level: MoodLevel;
  emoji: string;
  label: string;
  color: string;
  numericValue: number;
}

export const MOOD_CONFIG: MoodConfig[] = [
  { level: 'ATOPE', emoji: '🚀', label: 'A tope', color: '#34d399', numericValue: 5 },
  { level: 'BIEN', emoji: '😊', label: 'Bien', color: '#a78bfa', numericValue: 4 },
  { level: 'REGULAR', emoji: '😐', label: 'Regular', color: '#fbbf24', numericValue: 3 },
  { level: 'MAL', emoji: '😞', label: 'Mal', color: '#fb923c', numericValue: 2 },
  { level: 'BURNOUT', emoji: '🔥', label: 'Burnout total', color: '#fb7185', numericValue: 1 },
];

export const TAG_LABELS: Record<MoodTag, string> = {
  EXAMENES: 'Exámenes',
  FALTA_DE_SUENO: 'Falta de sueño',
  PROBLEMAS_PERSONALES: 'Problemas personales',
  CARGA_DE_TAREAS: 'Carga de tareas',
};

// ── Diario ────────────────────────────────────────────────
export interface DiaryEntry {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// ── Recomendaciones ───────────────────────────────────────
export type RecommendationType = 'respiracion' | 'descanso' | 'tecnica' | 'contenido' | 'general';

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  duration?: string;
  link?: string;
}

export interface RecommendationResponse {
  moodLevel: MoodLevel;
  moodLabel: string;
  message: string;
  recommendations: Recommendation[];
}

export const REC_ICONS: Record<RecommendationType, string> = {
  respiracion: '🌬️',
  descanso: '💤',
  tecnica: '⏱️',
  contenido: '🎬',
  general: '💜',
};

// ── Comunidad ─────────────────────────────────────────────
export interface CommunityRoom {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count?: { posts: number };
}

export interface CommunityPost {
  id: string;
  content: string;
  isAnonymous: boolean;
  userId: string;
  user: { id: string; name: string } | null;
  roomId: string;
  createdAt: string;
  _count?: { hearts: number };
}

// ── Frase del día ─────────────────────────────────────────
export interface DailyPhrase {
  id: string;
  text: string;
  author?: string;
}
