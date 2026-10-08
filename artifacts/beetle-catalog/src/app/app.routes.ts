import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page.component';
import { BeetlesPageComponent } from './beetles-page.component';
import { IndexPageComponent } from './index-page.component';

export const APP_ROUTES: Routes = [
  { path: '', component: HomePageComponent, title: 'Beetle Cabinet' },
  { path: 'beetles', component: BeetlesPageComponent, title: 'Species cabinet — Beetle Cabinet' },
  { path: 'index', component: IndexPageComponent, title: 'Name index — Beetle Cabinet' },
  { path: '**', redirectTo: '' },
];
