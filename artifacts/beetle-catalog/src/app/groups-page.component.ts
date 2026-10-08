import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeetleCatalogService, type BeetleRecord } from './beetle-catalog.service';

type GroupField = 'family' | 'genus';
type BeetleGroup = { label: string; records: BeetleRecord[] };

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-wrap">
      <header class="page-heading">
        <div class="eyebrow">Reference · Classification</div>
        <h1>Find your branch</h1>
        <p>Explore the records by shared family or genus, then open any beetle card for its complete details.</p>
      </header>

      @if (catalog.state() === 'loading') {
        <div class="skeletons" aria-label="Loading beetle groups"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>
      } @else if (catalog.state() === 'error') {
        <section class="state-panel" role="alert">
          <div><div class="eyebrow">Groups unavailable</div><h2>The records could not be opened</h2>
            <p>{{ catalog.errorMessage() }} Check the JSON URL in <code>src/app/data-config.ts</code>, then try again.</p>
            <button type="button" (click)="catalog.load()">Try loading again</button></div>
        </section>
      } @else if (catalog.records().length === 0) {
        <section class="state-panel">
          <div><div class="eyebrow">No records filed</div><h2>No beetles to group yet</h2>
            <p>Add beetle records to the JSON file to organize the collection by family or genus.</p></div>
        </section>
      } @else {
        <div class="group-controls">
          <span class="group-controls-label" id="group-control-label">Group records by</span>
          <div class="group-switch" role="group" aria-labelledby="group-control-label">
            <button type="button" [class.is-selected]="groupBy() === 'family'" [attr.aria-pressed]="groupBy() === 'family'" (click)="setGroupBy('family')">Family</button>
            <button type="button" [class.is-selected]="groupBy() === 'genus'" [attr.aria-pressed]="groupBy() === 'genus'" (click)="setGroupBy('genus')">Genus</button>
          </div>
          <span class="group-summary">{{ groups().length }} {{ groupBy() }} groups · {{ catalog.records().length }} records</span>
        </div>

        <div class="taxon-groups">
          @for (group of groups(); track group.label) {
            <section class="taxon-group" [attr.aria-label]="groupBy() + ': ' + group.label">
              <header class="taxon-heading">
                <h2>{{ group.label }}</h2>
                <span>{{ group.records.length }} {{ group.records.length === 1 ? 'record' : 'records' }}</span>
              </header>
              <ul class="taxon-records">
                @for (record of group.records; track record.id) {
                  <li>
                    <a [routerLink]="['/beetles']" [fragment]="record.id">
                      <span class="taxon-record-name">{{ catalog.displayName(record) }}</span>
                      @if (record.scientificName) { <em class="taxon-record-scientific">{{ record.scientificName }}</em> }
                    </a>
                  </li>
                }
              </ul>
            </section>
          }
        </div>
      }
    </section>
  `,
})
export class GroupsPageComponent {
  readonly catalog = inject(BeetleCatalogService);
  readonly groupBy = signal<GroupField>('family');
  readonly groups = computed<BeetleGroup[]>(() => {
    const byLabel = new Map<string, BeetleGroup>();
    for (const record of this.catalog.records()) {
      const rawValue = record[this.groupBy()];
      const label = typeof rawValue === 'string' && rawValue.trim()
        ? rawValue.trim()
        : typeof rawValue === 'number' ? String(rawValue) : 'Not recorded';
      const key = label.toLocaleLowerCase();
      const group = byLabel.get(key) ?? { label, records: [] };
      group.records.push(record);
      byLabel.set(key, group);
    }

    return [...byLabel.values()]
      .map((group) => ({
        ...group,
        records: [...group.records].sort((a, b) =>
          this.catalog.displayName(a).localeCompare(this.catalog.displayName(b), undefined, { sensitivity: 'base' }),
        ),
      }))
      .sort((a, b) => {
        if (a.label === 'Not recorded') return 1;
        if (b.label === 'Not recorded') return -1;
        return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
      });
  });

  setGroupBy(field: GroupField): void {
    this.groupBy.set(field);
  }
}
