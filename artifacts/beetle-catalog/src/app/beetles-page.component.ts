import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeetleCatalogService } from './beetle-catalog.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-wrap">
      <header class="page-heading">
        <div class="eyebrow">Collection · Specimen records</div>
        <h1>The beetle cabinet</h1>
        <p>Each card is a record in its own right. Search across names and recorded details to find your next point of curiosity.</p>
      </header>
      @if (catalog.state() === 'loading') {
        <div class="skeletons" aria-label="Loading beetle records">
          <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
        </div>
      } @else if (catalog.state() === 'error') {
        <section class="state-panel" role="alert">
          <div><div class="eyebrow">The cabinet is closed for a moment</div><h2>Records could not be opened</h2>
            <p>{{ catalog.errorMessage() }} Check the JSON URL in <code>src/app/data-config.ts</code>, confirm the file is reachable, then try again.</p>
            <button type="button" (click)="catalog.load()">Try loading again</button></div>
        </section>
      } @else if (catalog.records().length === 0) {
        <section class="state-panel">
          <div><div class="eyebrow">An empty drawer</div><h2>No records yet</h2>
            <p>The data file opened successfully but contains no beetle records. Add records to the JSON array to populate the cabinet.</p></div>
        </section>
      } @else {
        <div class="catalog-toolbar">
          <div class="catalog-count" aria-live="polite">{{ filtered().length }} OF {{ catalog.records().length }} RECORDS</div>
          <label class="search-wrap">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><circle cx="8.7" cy="8.7" r="5.6" stroke="currentColor" stroke-width="1.4"/><path d="m13 13 4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input class="search-input" type="search" [value]="query()" (input)="setQuery($event)" placeholder="Search names or recorded details" aria-label="Search beetle records">
          </label>
        </div>
        @if (filtered().length) {
          <div class="cards-grid">
            @for (record of filtered(); track record.id; let i = $index) {
              <article class="beetle-card fade-in" [id]="record.id">
                <div class="card-topline">
                  <span class="card-number">RECORD {{ numberLabel(i) }}</span>
                  @if (record.family) { <span class="card-family">{{ record.family }}</span> }
                </div>
                <div class="card-content">
                  <h2>{{ catalog.displayName(record) }}</h2>
                  @if (record.scientificName) { <p class="card-scientific">{{ record.scientificName }}</p> }
                  @else { <div style="height:19px"></div> }
                  <dl class="field-list">
                    @if (record.genus) { <div class="field-row"><dt>Genus</dt><dd>{{ record.genus }}</dd></div> }
                    @if (record.family) { <div class="field-row"><dt>Family</dt><dd>{{ record.family }}</dd></div> }
                    @for (attribute of catalog.extraAttributes(record); track attribute.label) {
                      <div class="field-row"><dt>{{ attribute.label }}</dt><dd>{{ attribute.value }}</dd></div>
                    }
                  </dl>
                </div>
                <a class="card-link" [routerLink]="['/beetles']" [fragment]="record.id" [attr.aria-label]="'Direct link to ' + catalog.displayName(record)">Open record <span aria-hidden="true">↗</span></a>
              </article>
            }
          </div>
        } @else {
          <section class="state-panel">
            <div><div class="eyebrow">No match in this drawer</div><h2>Nothing found</h2>
              <p>Try a common name, genus, family, or another detail from the records.</p>
              <button type="button" (click)="clearSearch()">Clear search</button></div>
          </section>
        }
      }
    </section>
  `,
})
export class BeetlesPageComponent {
  readonly catalog = inject(BeetleCatalogService);
  readonly query = signal('');
  readonly filtered = computed(() => {
    const needle = this.query().trim().toLocaleLowerCase();
    if (!needle) return this.catalog.records();
    return this.catalog.records().filter((record) =>
      Object.values(record).some((value) => this.searchable(value).toLocaleLowerCase().includes(needle)),
    );
  });

  constructor() {
    effect(() => {
      const loaded = this.catalog.state() === 'ready' && this.catalog.records().length > 0;
      const hash = window.location.hash.slice(1);
      if (loaded && hash) setTimeout(() => document.getElementById(decodeURIComponent(hash))?.scrollIntoView({ block: 'start' }), 40);
    });
  }

  setQuery(event: Event): void { this.query.set((event.target as HTMLInputElement).value); }
  clearSearch(): void { this.query.set(''); }
  numberLabel(index: number): string { return String(index + 1).padStart(3, '0'); }
  private searchable(value: unknown): string {
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.map((part) => this.searchable(part)).join(' ');
    if (value && typeof value === 'object') return Object.values(value).map((part) => this.searchable(part)).join(' ');
    return '';
  }
}
