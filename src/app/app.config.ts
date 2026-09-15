import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environment/environment';

import { routes } from './app.routes';
import { provideEchartsCore } from 'ngx-echarts';
import { provideHttpClient } from '@angular/common/http';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client';
import { inject } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideEchartsCore({ echarts: () => import('echarts') }),
    provideHttpClient(),
    provideApollo(() => ({
      link: inject(HttpLink).create({ uri: environment.graphqlUri }),
      cache: new InMemoryCache(),
    })),
  ]
};
