import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BeetleCatalogService } from './beetle-catalog.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-wrap home-hero">
      <div class="hero-copy fade-in">
        <div class="eyebrow">Коллекция водных жесткокрылых</div>
        <h1>Мир в<br><em>мельчайших</em><br>деталях.</h1>
        <p>Коллекция собрана и хранится в Гидробиологическом обществе Заозерной школы №16 города Томска Томской области.</p>
        <div class="hero-actions">
          <a class="button-link" routerLink="/beetles">Смотреть коллекцию <span aria-hidden="true">↗</span></a>
          <a class="button-link secondary" routerLink="/index">Открыть указатель</a>
        </div>
      </div>
      <div class="hero-art fade-in">
        <img class="hero-logo" [src]="logoSrc" alt="Гидробиологическое общество СОШ №16" width="640" height="640" />
      </div>
    </section>
    <section class="home-band">
      <div class="band-inner">
        <div><div class="band-label">Коллекция сегодня</div><div class="band-title">Коллекция постоянно пополняется</div></div>
        <div class="band-count">{{ countLabel }}</div>
      </div>
    </section>
    <section class="page-wrap home-lower">
      <div>
        <div class="eyebrow">Три способа исследовать</div>
        <h2>У любопытства<br>свой порядок.</h2>
      </div>
      <div>
        <p>Изучайте экземпляры по одному, ищите названия в алфавитном указателе или просматривайте жуков по отряду, подотряду, надсемейству, семейству, трибе и роду.</p>
        <a class="button-link" routerLink="/beetles">Перейти к коллекции <span aria-hidden="true">↗</span></a>
        <a class="button-link secondary" routerLink="/groups">Группировать жуков <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  `,
})
export class HomePageComponent {
  readonly catalog = inject(BeetleCatalogService);
  readonly logoSrc = `${import.meta.env.BASE_URL}images/biological-society-logo.jpg`;
  get countLabel(): string {
    if (this.catalog.state() === 'loading') return 'Открываем каталог…';
    if (this.catalog.state() === 'error') return 'Коллекция временно недоступна';
    const count = this.catalog.records().length;
    return `${count} ${this.recordWord(count)} в коллекции`;
  }

  private recordWord(count: number): string {
    const lastTwo = count % 100;
    const last = count % 10;
    if (last === 1 && lastTwo !== 11) return 'запись';
    if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'записи';
    return 'записей';
  }
}
