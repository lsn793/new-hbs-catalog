import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeetleCatalogService, type BeetleRecord } from './beetle-catalog.service';

type GroupField = 'order' | 'suborder' | 'superfamily' | 'family' | 'tribe' | 'genus';
type BeetleGroup = { label: string; records: BeetleRecord[] };
const GROUP_FIELDS: Array<{ field: GroupField; label: string }> = [
  { field: 'order', label: 'Отряд' },
  { field: 'suborder', label: 'Подотряд' },
  { field: 'superfamily', label: 'Надсемейство' },
  { field: 'family', label: 'Семейство' },
  { field: 'tribe', label: 'Триба' },
  { field: 'genus', label: 'Род' },
];

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-wrap">
      <header class="page-heading">
        <div class="eyebrow">Справочник · Классификация</div>
        <h1>Выберите группу</h1>
        <p>Группируйте записи по отряду, подотряду, надсемейству, семейству, трибе или роду и открывайте карточки жуков.</p>
      </header>

      @if (catalog.state() === 'loading') {
        <div class="skeletons" aria-label="Загружаем группы жуков"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>
      } @else if (catalog.state() === 'error') {
        <section class="state-panel" role="alert">
          <div><div class="eyebrow">Группы недоступны</div><h2>Не удалось открыть записи</h2>
            <p>{{ catalog.errorMessage() }} Проверьте адрес JSON-файла в <code>src/app/data-config.ts</code> и повторите попытку.</p>
            <button type="button" (click)="catalog.load()">Повторить загрузку</button></div>
        </section>
      } @else if (catalog.records().length === 0) {
        <section class="state-panel">
          <div><div class="eyebrow">Пока нет записей</div><h2>Пока нечего группировать</h2>
            <p>Добавьте записи о жуках в JSON-файл, чтобы распределить коллекцию по таксономическим группам.</p></div>
        </section>
      } @else {
        <div class="group-controls">
          <span class="group-controls-label" id="group-control-label">Группировать по</span>
          <div class="group-switch" role="group" aria-labelledby="group-control-label">
            @for (option of groupFields; track option.field) {
              <button type="button" [class.is-selected]="groupBy() === option.field" [attr.aria-pressed]="groupBy() === option.field" (click)="setGroupBy(option.field)">{{ option.label }}</button>
            }
          </div>
          <span class="group-summary">Групп: {{ groups().length }} · Записей: {{ catalog.records().length }}</span>
        </div>

        <div class="taxon-groups">
          @for (group of groups(); track group.label) {
            <section class="taxon-group" [attr.aria-label]="groupFieldLabel(groupBy()) + ': ' + group.label">
              <header class="taxon-heading">
                <h2>{{ group.label }}</h2>
                <span>{{ group.records.length }} {{ recordWord(group.records.length) }}</span>
              </header>
              <ul class="taxon-records">
                @for (record of group.records; track record.id) {
                  <li>
                    <a [routerLink]="['/beetles', record.id]">
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
  readonly groupFields = GROUP_FIELDS;
  readonly groupBy = signal<GroupField>('family');
  readonly groups = computed<BeetleGroup[]>(() => {
    const byLabel = new Map<string, BeetleGroup>();
    for (const record of this.catalog.records()) {
      const rawValue = record[this.groupBy()];
      const label = typeof rawValue === 'string' && rawValue.trim()
        ? rawValue.trim() === '0' ? 'Не указано' : rawValue.trim()
        : typeof rawValue === 'number' ? String(rawValue) : 'Не указано';
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
        if (a.label === 'Не указано') return 1;
        if (b.label === 'Не указано') return -1;
        return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
      });
  });

  setGroupBy(field: GroupField): void {
    this.groupBy.set(field);
  }

  groupFieldLabel(field: GroupField): string {
    return this.groupFields.find((option) => option.field === field)?.label ?? 'Группа';
  }

  recordWord(count: number): string {
    const lastTwo = count % 100;
    const last = count % 10;
    if (last === 1 && lastTwo !== 11) return 'запись';
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'записи';
    return 'записей';
  }
}
