import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarNav } from './sidebar-nav';

describe('SidebarNav', () => {
    it('creates the component with all nav items including Journey', async () => {
        await TestBed.configureTestingModule({
            imports: [SidebarNav],
            providers: [provideRouter([])],
        }).compileComponents();

        const fixture = TestBed.createComponent(SidebarNav);
        const instance = fixture.componentInstance;
        expect(instance).toBeTruthy();

        const labels = instance.items.map((i) => i.label);
        expect(labels).toEqual(['Overview', 'Sessions', 'Events', 'Devices', 'Users', 'Journey']);
        const journey = instance.items.find((i) => i.path === 'journey')!;
        expect(journey.icon).toBe('assets/clock_icon.svg');
    });

    it('renders one anchor per nav item', async () => {
        await TestBed.configureTestingModule({
            imports: [SidebarNav],
            providers: [provideRouter([])],
        }).compileComponents();

        const fixture = TestBed.createComponent(SidebarNav);
        fixture.detectChanges();
        await fixture.whenStable();
        const anchors = (fixture.nativeElement as HTMLElement).querySelectorAll('a.sidebar__link');
        expect(anchors.length).toBe(6);
        expect(Array.from(anchors).some((a) => a.textContent?.includes('Journey'))).toBe(true);
    });
});
