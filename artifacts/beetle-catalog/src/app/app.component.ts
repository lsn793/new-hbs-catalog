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
          <a class="brand" routerLink="/">
            <img class="brand-logo" [src]="logoSrc" alt="Эмблема Гидробиологического общества СОШ №16" width="64" height="64" />
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
  readonly logoSrc = `${import.meta.env.BASE_URL}images/biological-society-logo.jpg`;
  ngOnInit(): void { void this.catalog.load(); }
}
