import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AppPaths } from '@core/config/app-paths';
import { Translator } from '@core/i18n/translator';
import { TrainersPage } from './trainers-page';

@Component({ template: '' })
class EmptyPage {}

class ResizeObserverStub {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
}

describe('TrainersPage', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function openAt(url: string): Promise<ComponentFixture<TrainersPage>> {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'trainers', component: EmptyPage },
          { path: 'trainers/subscriptions', component: EmptyPage },
          { path: 'trainers/tiers', component: EmptyPage },
        ]),
      ],
    });
    await TestBed.inject(Router).navigateByUrl(url);
    const fixture = TestBed.createComponent(TrainersPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function tabLabels(fixture: ComponentFixture<TrainersPage>): string[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('p-tab')).map(
      (tab) => tab.textContent?.trim() ?? '',
    );
  }

  function activeTabLabels(fixture: ComponentFixture<TrainersPage>): string[] {
    return Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('p-tab[data-p-active="true"]'),
    ).map((tab) => tab.textContent?.trim() ?? '');
  }

  function translate(...args: Parameters<Translator['translate']>): string {
    return TestBed.inject(Translator).translate(...args);
  }

  it('should offer Trainers, Subscriptions and Tiers tabs in that order', async () => {
    const fixture = await openAt(AppPaths.trainers);

    expect(tabLabels(fixture)).toEqual([
      translate('trainers.page.tabs.trainers'),
      translate('trainers.page.tabs.subscriptions'),
      translate('trainers.page.tabs.tiers'),
    ]);
  });

  it('should mark the Tiers tab active when the tiers address is open', async () => {
    const fixture = await openAt(AppPaths.trainerTiers);

    expect(activeTabLabels(fixture)).toEqual([translate('trainers.page.tabs.tiers')]);
  });

  it('should mark the Subscriptions tab active when the subscriptions address is open', async () => {
    const fixture = await openAt(AppPaths.trainerSubscriptions);

    expect(activeTabLabels(fixture)).toEqual([translate('trainers.page.tabs.subscriptions')]);
  });

  it('should mark the Trainers tab active when the list address is open', async () => {
    const fixture = await openAt(AppPaths.trainers);

    expect(activeTabLabels(fixture)).toEqual([translate('trainers.page.tabs.trainers')]);
  });
});
