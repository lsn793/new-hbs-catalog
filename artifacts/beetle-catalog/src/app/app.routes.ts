import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page.component';
import { BeetleDetailsPageComponent } from './beetle-details-page.component';
import { BeetlesPageComponent } from './beetles-page.component';
import { IndexPageComponent } from './index-page.component';
import { GroupsPageComponent } from './groups-page.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomePageComponent, title: 'Каталог жуков' },
  { path: 'beetles/:id', component: BeetleDetailsPageComponent, title: 'Карточка жука — Каталог жуков' },
  { path: 'beetles', component: BeetlesPageComponent, title: 'Коллекция — Каталог жуков' },
  { path: 'index', component: IndexPageComponent, title: 'Алфавитный указатель — Каталог жуков' },
  { path: 'groups', component: GroupsPageComponent, title: 'Группы жуков — Каталог жуков' },
  { path: '**', redirectTo: '' },
];
