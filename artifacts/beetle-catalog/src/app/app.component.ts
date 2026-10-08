import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BeetleCatalogService } from './beetle-catalog.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="site-shell">
      <header class="site-header">
        <div class="header-inner">
          <a class="brand" routerLink="/" aria-label="Beetle Cabinet home">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none">
                <path d="M20 11v19M14 13 9 8M26 13l5-5M13 19 7 17M27 19l6-2M13 25l-6 2M27 25l6 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <ellipse cx="20" cy="22" rx="8" ry="11" fill="#718361" stroke="currentColor" stroke-width="1.5"/>
                <path d="M20 12v20" stroke="#d6dbc9" stroke-width="1.2"/>
                <circle cx="20" cy="9" r="3.2" fill="#536b4d" stroke="currentColor" stroke-width="1.4"/>
              </svg>
            </span>
            <span class="brand-word">Beetle Cabinet<small>Natural history, collected</small></span>
          </a>
          <nav class="main-nav" aria-label="Main navigation">
            <a routerLink="/beetles" routerLinkActive="active">The collection</a>
            <a class="nav-index" routerLink="/index" routerLinkActive="active">Name index</a>
            <a class="nav-groups" routerLink="/groups" routerLinkActive="active">Groups</a>
          </nav>
        </div>
      </header>
      <main><router-outlet /></main>
      <footer class="site-footer">
        <div class="footer-inner">
          <span>BEETLE CABINET · A FIELD GUIDE IN PROGRESS</span>
          <span>Records, not rankings.</span>
        </div>
      </footer>
    </div>
  `,
})
export class AppComponent implements OnInit {
  private readonly catalog = inject(BeetleCatalogService);
  ngOnInit(): void { void this.catalog.load(); }
}
