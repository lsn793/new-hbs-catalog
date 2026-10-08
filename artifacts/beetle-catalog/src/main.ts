import '@angular/compiler';
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import './index.css';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(APP_ROUTES, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
  ],
}).catch((error: unknown) => console.error('Beetle Cabinet could not start:', error));
