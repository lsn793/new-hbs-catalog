import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeetleCatalogService } from './beetle-catalog.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-wrap home-hero">
      <div class="hero-copy fade-in">
        <div class="eyebrow">A digital cabinet of coleoptera</div>
        <h1>A world in<br>the <em>smallest</em><br>details.</h1>
        <p>Meet the remarkable beetles behind the names. Browse collected species records, or find a familiar name in the reference index.</p>
        <div class="hero-actions">
          <a class="button-link" routerLink="/beetles">Explore the collection <span aria-hidden="true">↗</span></a>
          <a class="button-link secondary" routerLink="/index">Open name index</a>
        </div>
      </div>
      <div class="hero-art fade-in">
        <img class="hero-logo" [src]="logoSrc" alt="Гидробиологическое общество СОШ №16" width="640" height="640" />
      </div>
    </section>
    <section class="home-band">
      <div class="band-inner">
        <div><div class="band-label">The cabinet today</div><div class="band-title">An ever-growing field guide</div></div>
        <div class="band-count">{{ countLabel }}</div>
      </div>
    </section>
    <section class="page-wrap home-lower">
      <div>
        <div class="eyebrow">Three ways to wander</div>
        <h2>Curiosity has<br>its own order.</h2>
      </div>
      <div>
        <p>Browse specimens one at a time, find a name in the alphabetical index, or explore the collection grouped by family and genus.</p>
        <a class="button-link" routerLink="/beetles">Step inside the cabinet <span aria-hidden="true">↗</span></a>
        <a class="button-link secondary" routerLink="/groups">Browse by family or genus <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  `,
})
export class HomePageComponent {
  readonly catalog = inject(BeetleCatalogService);
  readonly logoSrc = `${import.meta.env.BASE_URL}images/biological-society-logo.jpg`;
  get countLabel(): string {
    if (this.catalog.state() === 'loading') return 'Opening the records…';
    if (this.catalog.state() === 'error') return 'Collection temporarily unavailable';
    return `${this.catalog.records().length} ${this.catalog.records().length === 1 ? 'record' : 'records'} in the cabinet`;
  }
}
