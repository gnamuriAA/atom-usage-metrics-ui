import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environment/environment';

import { routes } from './app.routes';
import { provideEchartsCore } from 'ngx-echarts';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideEchartsCore({ echarts: () => import('echarts') }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideApollo(() => ({
      link: inject(HttpLink).create({ uri: environment.graphqlUri }),
      cache: new InMemoryCache(),
    })),
  ]
};
