import { Injectable, signal } from '@angular/core';
import { BEETLE_JSON_URL } from './data-config';

export type BeetleRecord = {
  id: string;
  name?: string;
  commonName?: string;
  scientificName?: string;
  description?: string;
  image?: string | string[];
  genus?: string;
  family?: string;
  [key: string]: unknown;
};

export type CatalogState = 'loading' | 'ready' | 'error';

const coreFields = new Set(['id', 'slug', 'name', 'commonName', 'scientificName', 'description', 'image', 'genus', 'family']);
const LOCAL_PLACEHOLDER_IMAGE = `${import.meta.env.BASE_URL}images/beetle-specimen.png`;
const FIELD_LABELS: Record<string, string> = {
  order: 'Отряд',
  suborder: 'Подотряд',
  superfamily: 'Надсемейство',
  family: 'Семейство',
  tribe: 'Триба',
  genus: 'Род',
  body_lenght: 'Длина тела',
  body_length: 'Длина тела',
};

function slugify(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'beetle';
}

@Injectable({ providedIn: 'root' })
export class BeetleCatalogService {
  readonly records = signal<BeetleRecord[]>([]);
  readonly state = signal<CatalogState>('loading');
  readonly errorMessage = signal('');
  readonly sourceUrl = BEETLE_JSON_URL;
  readonly placeholderImageUrl = LOCAL_PLACEHOLDER_IMAGE;
  private requestVersion = 0;

  async load(): Promise<void> {
    const version = ++this.requestVersion;
    this.state.set('loading');
    this.errorMessage.set('');
    try {
      const response = await fetch(this.sourceUrl, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Файл данных вернул ошибку HTTP ${response.status}.`);
      const text = await response.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Не удалось прочитать файл как JSON. Проверьте синтаксис и повторите попытку.');
      }
      const rawRecords = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === 'object' && Array.isArray((parsed as { beetles?: unknown }).beetles)
          ? (parsed as { beetles: unknown[] }).beetles
          : null;
      if (!rawRecords) {
        throw new Error('Ожидался JSON-массив или объект со свойством "beetles", содержащим массив.');
      }
      const records = rawRecords.map((item, index) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          throw new Error(`Запись ${index + 1} не является JSON-объектом.`);
        }
        const record = item as Record<string, unknown>;
        const name = typeof record.commonName === 'string' ? record.commonName
          : typeof record.name === 'string' ? record.name
            : typeof record.scientificName === 'string' ? record.scientificName : '';
        const stableId = typeof record.id === 'string' || typeof record.id === 'number'
          ? String(record.id)
          : typeof record.slug === 'string' ? record.slug : slugify(name || `record-${index + 1}`);
        return { ...record, id: stableId } as BeetleRecord;
      });
      if (version !== this.requestVersion) return;
      this.records.set(records);
      this.state.set('ready');
    } catch (error) {
      if (version !== this.requestVersion) return;
      this.errorMessage.set(error instanceof Error ? error.message : 'Не удалось загрузить коллекцию.');
      this.state.set('error');
    }
  }

  displayName(record: BeetleRecord): string {
    if (typeof record.commonName === 'string' && record.commonName.trim()) return record.commonName;
    if (typeof record.name === 'string' && record.name.trim()) return record.name;
    if (typeof record.scientificName === 'string' && record.scientificName.trim()) return record.scientificName;
    return record.id;
  }

  imagePaths(record: BeetleRecord): string[] {
    const values = Array.isArray(record.image) ? record.image : [record.image];
    return values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => value.trim());
  }

  imageUrls(record: BeetleRecord): string[] {
    const paths = this.imagePaths(record);
    return (paths.length ? paths : [this.placeholderImageUrl]).map((image) => this.resolveImageUrl(image));
  }

  imageUrl(record: BeetleRecord): string {
    return this.imageUrls(record)[0] ?? this.placeholderImageUrl;
  }

  hasPlaceholderImage(record: BeetleRecord, index = 0): boolean {
    const paths = this.imagePaths(record);
    return paths.length === 0 || this.isPlaceholderPath(paths[index] ?? '');
  }

  imageAlt(record: BeetleRecord, index = 0): string {
    return this.hasPlaceholderImage(record, index)
      ? `Иллюстрация-заглушка: ${this.displayName(record)}`
      : `${this.displayName(record)} — изображение ${index + 1}`;
  }

  taxonomyValue(value: unknown): string {
    if (value === 0 || (typeof value === 'string' && (!value.trim() || value.trim() === '0'))) {
      return 'Не указано';
    }
    return typeof value === 'string' ? value.trim() : this.stringify(value);
  }

  private isPlaceholderPath(image: string): boolean {
    return image.trim().replace(/^\.?\//, '') === 'images/beetle-specimen.png';
  }

  private resolveImageUrl(image: string): string {
    if (this.isPlaceholderPath(image)) return this.placeholderImageUrl;
    if (/^(?:https?:)?\/\//i.test(image) || image.startsWith('data:image/')) return image;
    return `${import.meta.env.BASE_URL}${image.replace(/^\.?\//, '').replace(/^\/+/, '')}`;
  }

  extraAttributes(record: BeetleRecord): Array<{ label: string; value: string }> {
    return Object.entries(record)
      .filter(([key, value]) => !coreFields.has(key) && value !== null && value !== undefined && value !== '')
      .map(([key, value]) => ({
        label: FIELD_LABELS[key] ?? key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' '),
        value: ['order', 'suborder', 'superfamily', 'tribe'].includes(key)
          ? this.taxonomyValue(value)
          : Array.isArray(value) ? value.map((part) => this.stringify(part)).join(', ') : this.stringify(value),
      }));
  }

  private stringify(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try { return JSON.stringify(value); } catch { return String(value); }
  }
}
