import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'overview' },
    {
        path: 'overview',
        loadComponent: () => import('../features/overview/overview').then(m => m.Overview)
    },
    {
        path: 'sessions',
        loadComponent: () => import('../features/sessions/sessions').then(m => m.Sessions)
    },
    {
        path: 'events',
        loadComponent: () => import('../features/events/events').then(m => m.Events)
    },
    {
        path: 'devices',
        loadComponent: () => import('../features/devices/devices').then(m => m.Devices)
    },
    { path: '**', redirectTo: 'overview' }
];
