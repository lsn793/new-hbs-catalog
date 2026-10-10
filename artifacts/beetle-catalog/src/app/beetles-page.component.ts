import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeetleCatalogService } from './beetle-catalog.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-wrap">
      <header class="page-heading">
        <div class="eyebrow">Коллекция · Карточки видов</div>
        <h1>Коллекция жуков</h1>
        <p>Каждая карточка — отдельная запись. Ищите по названиям и характеристикам, чтобы найти интересующий вид.</p>
      </header>
      @if (catalog.state() === 'loading') {
        <div class="skeletons" aria-label="Загружаем карточки жуков">
          <div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>
        </div>
      } @else if (catalog.state() === 'error') {
        <section class="state-panel" role="alert">
          <div><div class="eyebrow">Коллекция временно недоступна</div><h2>Не удалось открыть записи</h2>
            <p>{{ catalog.errorMessage() }} Проверьте адрес JSON-файла в <code>src/app/data-config.ts</code> и убедитесь, что он доступен.</p>
            <button type="button" (click)="catalog.load()">Повторить загрузку</button></div>
        </section>
      } @else if (catalog.records().length === 0) {
        <section class="state-panel">
          <div><div class="eyebrow">Пока пусто</div><h2>Записей ещё нет</h2>
            <p>Файл данных открыт, но в нём нет записей о жуках. Добавьте записи в JSON-массив, чтобы заполнить коллекцию.</p></div>
        </section>
      } @else {
        <div class="catalog-toolbar">
          <div class="catalog-count" aria-live="polite">Записей: {{ filtered().length }} / {{ catalog.records().length }}</div>
          <label class="search-wrap">
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true"><circle cx="8.7" cy="8.7" r="5.6" stroke="currentColor" stroke-width="1.4"/><path d="m13 13 4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
            <input class="search-input" type="search" [value]="query()" (input)="setQuery($event)" placeholder="Поиск по названию или характеристикам" aria-label="Поиск по каталогу жуков">
          </label>
        </div>
        @if (filtered().length) {
          <div class="cards-grid">
            @for (record of filtered(); track record.id; let i = $index) {
              <article class="beetle-card fade-in" [id]="record.id">
                <div class="card-topline">
                  <span class="card-number">ЗАПИСЬ {{ numberLabel(i) }}</span>
                  @if (record.family) { <span class="card-family">{{ record.family }}</span> }
                </div>
                <div class="card-image-wrap">
                  <img [src]="catalog.imageUrl(record)" [alt]="catalog.imageAlt(record)" loading="lazy" decoding="async">
                  @if (catalog.hasPlaceholderImage(record)) { <span class="image-note">Иллюстрация-заглушка</span> }
                </div>
                <div class="card-content">
                  <h2><a [routerLink]="['/beetles', record.id]" [attr.aria-label]="'Открыть карточку: ' + catalog.displayName(record)">{{ catalog.displayName(record) }}</a></h2>
                  @if (record.scientificName) { <p class="card-scientific">{{ record.scientificName }}</p> }
                  @else { <div style="height:19px"></div> }
                  <dl class="field-list">
                    @if (record.genus !== undefined) { <div class="field-row"><dt>Род</dt><dd>{{ catalog.taxonomyValue(record.genus) }}</dd></div> }
                    @if (record.family !== undefined) { <div class="field-row"><dt>Семейство</dt><dd>{{ catalog.taxonomyValue(record.family) }}</dd></div> }
                    @for (attribute of catalog.extraAttributes(record); track attribute.label) {
                      <div class="field-row"><dt>{{ attribute.label }}</dt><dd>{{ attribute.value }}</dd></div>
                    }
                  </dl>
                </div>
                <a class="card-link" [routerLink]="['/beetles', record.id]" [attr.aria-label]="'Открыть карточку: ' + catalog.displayName(record)">Подробнее <span aria-hidden="true">↗</span></a>
              </article>
            }
          </div>
        } @else {
          <section class="state-panel">
            <div><div class="eyebrow">Совпадений нет</div><h2>Ничего не найдено</h2>
              <p>Попробуйте изменить запрос: введите название, род, семейство или другую характеристику.</p>
              <button type="button" (click)="clearSearch()">Очистить поиск</button></div>
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
