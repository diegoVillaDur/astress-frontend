import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'mood',
    loadComponent: () =>
      import('./features/mood/mood.component').then(m => m.MoodComponent),
    canActivate: [authGuard]
  },
  {
    path: 'diary',
    loadComponent: () =>
      import('./features/diary/diary.component').then(m => m.DiaryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'recommendations',
    loadComponent: () =>
      import('./features/recommendations/recommendations.component').then(m => m.RecommendationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'community',
    loadComponent: () =>
      import('./features/community/community.component').then(m => m.CommunityComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
