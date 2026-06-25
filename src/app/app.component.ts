import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  template: `
    <app-navbar *ngIf="authService.currentUser()"></app-navbar>
    <main [class.with-nav]="authService.currentUser()">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      min-height: 100vh;
      position: relative;
      z-index: 1;
    }
    main.with-nav {
      padding-bottom: 80px; /* espacio para navbar móvil */
    }
    @media (min-width: 768px) {
      main.with-nav {
        padding-left: 240px;
        padding-bottom: 0;
      }
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
