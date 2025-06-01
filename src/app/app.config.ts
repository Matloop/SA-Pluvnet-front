import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import {provideAnimations} from '@angular/platform-browser/animations'
import { routes } from './app.routes';
// --- provideHttpClient já está aqui ---
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes,withPreloading(PreloadAllModules),withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideToastr(
      {
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }
    ),
    provideAnimations(), provideAnimationsAsync(),
  ]
};