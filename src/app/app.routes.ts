import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'overview' },
    {
        path: 'overview',
        loadComponent: () => import('../features/overview/overview').then(m => m.Overview)
    },
    { path: '**', redirectTo: 'overview' }
];
