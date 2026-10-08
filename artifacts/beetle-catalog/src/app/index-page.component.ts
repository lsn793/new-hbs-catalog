import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeetleCatalogService, type BeetleRecord } from './beetle-catalog.service';

type NameGroup = { letter: string; records: BeetleRecord[] };

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-wrap">
      <header class="page-heading index-heading">
        <div class="eyebrow">Reference · Alphabetical</div>
        <h1>The name index</h1>
        <p>A quick route into the cabinet. Choose a name to open its full record.</p>
      </header>
      @if (catalog.state() === 'loading') {
        <div class="skeletons" aria-label="Loading the name index"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>
      } @else if (catalog.state() === 'error') {
        <section class="state-panel" role="alert"><div><div class="eyebrow">Reference unavailable</div><h2>The index could not be opened</h2><p>{{ catalog.errorMessage() }} Check <code>src/app/data-config.ts</code> and try again.</p><button type="button" (click)="catalog.load()">Try loading again</button></div></section>
      } @else if (groups().length === 0) {
        <section class="state-panel"><div><div class="eyebrow">No names filed</div><h2>The index is empty</h2><p>There are no beetle records in the current data file to list.</p></div></section>
      } @else {
        <nav class="alphabet-bar" aria-label="Jump to a letter">
          @for (group of groups(); track group.letter) { <a [href]="'#letter-' + group.letter" [attr.aria-label]="'Jump to ' + group.letter">{{ group.letter }}</a> }
        </nav>
        <div class="index-groups">
          @for (group of groups(); track group.letter) {
            <section class="index-group" [id]="'letter-' + group.letter" [attr.aria-labelledby]="'heading-' + group.letter">
              <h2 class="index-letter" [id]="'heading-' + group.letter">{{ group.letter }}</h2>
              <ul class="index-list">
                @for (record of group.records; track record.id) {
                  <li><a [routerLink]="['/beetles', record.id]"><span>{{ catalog.displayName(record) }}</span>@if (record.scientificName) { <em>{{ record.scientificName }}</em> }</a></li>
                }
              </ul>
            </section>
          }
        </div>
      }
    </section>
  `,
})
export class IndexPageComponent {
  readonly catalog = inject(BeetleCatalogService);
  readonly groups = computed<NameGroup[]>(() => {
    const sorted = [...this.catalog.records()].sort((a, b) =>
      this.catalog.displayName(a).localeCompare(this.catalog.displayName(b), undefined, { sensitivity: 'base' }),
    );
    const byLetter = new Map<string, typeof sorted>();
    for (const record of sorted) {
      const first = this.catalog.displayName(record).trim().charAt(0).toLocaleUpperCase();
      const letter = /^[A-Z]$/.test(first) ? first : '#';
      byLetter.set(letter, [...(byLetter.get(letter) ?? []), record]);
    }
    return [...byLetter.entries()].map(([letter, records]) => ({ letter, records }));
  });
}
