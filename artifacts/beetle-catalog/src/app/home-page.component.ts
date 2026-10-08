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
      <div class="hero-art fade-in" aria-label="Illustrated green beetle specimen">
        <span class="hero-note">Order Coleoptera · Living collection</span>
        <svg class="beetle-illustration" viewBox="0 0 340 410" fill="none" role="img" aria-labelledby="beetle-title">
          <title id="beetle-title">A botanical illustration of a beetle</title>
          <g stroke="#344a39" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M148 133 101 82 65 70M192 133l47-51 36-12M138 175l-66-20-31 14M202 175l66-20 31 14M138 226l-67 19-28 34M202 226l67 19 28 34M146 275l-45 57-31 9M194 275l45 57 31 9"/>
            <path d="m73 155-18-3M267 155l18-3M71 245l-18 12M269 245l18 12M101 332l-7 21M239 332l7 21"/>
          </g>
          <g fill="#738562" stroke="#344a39" stroke-width="3">
            <ellipse cx="170" cy="211" rx="74" ry="107"/>
            <ellipse cx="170" cy="111" rx="28" ry="26" fill="#52694d"/>
            <path d="M170 125v191" stroke="#d6dbc9" stroke-width="2"/>
            <path d="M120 151c15-16 32-23 50-24v182c-27-5-49-22-61-48-15-34-12-79 11-110Z" fill="#8b9a71" stroke-width="2"/>
            <path d="M220 151c-15-16-32-23-50-24v182c27-5 49-22 61-48 15-34 12-79-11-110Z" fill="#627955" stroke-width="2"/>
            <path d="M140 89Q128 64 111 61M200 89q12-25 29-28" fill="none"/>
          </g>
          <g fill="#d1a659" opacity=".9">
            <circle cx="135" cy="166" r="5"/><circle cx="206" cy="190" r="4"/><circle cx="133" cy="224" r="4"/><circle cx="209" cy="255" r="5"/><circle cx="156" cy="282" r="3"/>
          </g>
          <path d="M69 364c60 15 143 14 202-2" stroke="#a75c41" stroke-width="1.5" stroke-dasharray="3 7"/>
          <text x="170" y="390" text-anchor="middle" fill="#73796c" font-family="DM Mono,monospace" font-size="9" letter-spacing="2">FIG. 01 · SPECIMEN STUDY</text>
        </svg>
        <div class="art-caption"><strong>Small forms, vast variety</strong>A cabinet for curious minds</div>
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
        <div class="eyebrow">Two ways to wander</div>
        <h2>Curiosity has<br>its own order.</h2>
      </div>
      <div>
        <p>Move through the collection one specimen at a time, with records arranged as distinct natural-history notes. Or take the well-worn path from A to Z when a name is already on the tip of your tongue.</p>
        <a class="button-link" routerLink="/beetles">Step inside the cabinet <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  `,
})
export class HomePageComponent {
  readonly catalog = inject(BeetleCatalogService);
  get countLabel(): string {
    if (this.catalog.state() === 'loading') return 'Opening the records…';
    if (this.catalog.state() === 'error') return 'Collection temporarily unavailable';
    return `${this.catalog.records().length} ${this.catalog.records().length === 1 ? 'record' : 'records'} in the cabinet`;
  }
}
