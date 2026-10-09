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
        <div class="eyebrow">Справочник · По алфавиту</div>
        <h1>Алфавитный указатель</h1>
        <p>Выберите название, чтобы открыть полную карточку вида.</p>
      </header>
      @if (catalog.state() === 'loading') {
        <div class="skeletons" aria-label="Загружаем алфавитный указатель"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>
      } @else if (catalog.state() === 'error') {
        <section class="state-panel" role="alert"><div><div class="eyebrow">Справочник недоступен</div><h2>Не удалось открыть указатель</h2><p>{{ catalog.errorMessage() }} Проверьте адрес JSON-файла в <code>src/app/data-config.ts</code> и повторите попытку.</p><button type="button" (click)="catalog.load()">Повторить загрузку</button></div></section>
      } @else if (groups().length === 0) {
        <section class="state-panel"><div><div class="eyebrow">Названий пока нет</div><h2>Указатель пуст</h2><p>В текущем файле данных нет записей о жуках.</p></div></section>
      } @else {
        <nav class="alphabet-bar" aria-label="Перейти к букве">
          @for (group of groups(); track group.letter) { <a [href]="'#letter-' + group.letter" [attr.aria-label]="'Перейти к букве ' + group.letter">{{ group.letter }}</a> }
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
