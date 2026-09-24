import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('app.routes', () => {
    it('includes a lazy-loaded journey route', () => {
        const journey = routes.find((r) => r.path === 'journey');
        expect(journey).toBeDefined();
        expect(typeof journey!.loadComponent).toBe('function');
    });

    it('journey route resolves to the Journey component', async () => {
        const journey = routes.find((r) => r.path === 'journey')!;
        const comp = await (journey.loadComponent as () => Promise<unknown>)();
        expect(comp).toBeDefined();
        expect((comp as { name: string }).name).toMatch(/Journey$/);
    });

    it('redirects root to overview', () => {
        const root = routes.find((r) => r.path === '');
        expect(root?.redirectTo).toBe('overview');
        expect(root?.pathMatch).toBe('full');
    });

    it('has a wildcard redirect to overview', () => {
        const wildcard = routes.find((r) => r.path === '**');
        expect(wildcard?.redirectTo).toBe('overview');
    });
});
