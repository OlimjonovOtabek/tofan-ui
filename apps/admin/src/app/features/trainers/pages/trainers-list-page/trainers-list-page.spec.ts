import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { NotificationService } from '@core/feedback/notification.service';
import { API_BASE_URL } from '@core/http/api-base-url';
import { toTrainer } from '../../services/trainer.mapper';
import { SoldierLookupService } from '../../services/soldier-lookup.service';
import { TrainerAccountsService } from '../../services/trainer-accounts.service';
import { TrainerSubscriptionsService } from '../../services/trainer-subscriptions.service';
import { TrainersService } from '../../services/trainers.service';
import { TrainersListPage } from './trainers-list-page';

const COMMISSION_HEADER = /komissiya|commission|комиссия/i;

const trainer = toTrainer(
  {
    id: 't1',
    userId: '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b',
    displayName: 'Jasur Karimov',
    slug: 'jasur-karimov',
    bio: null,
    photoFileId: null,
    monthlyPrice: 450000,
    isPublished: false,
    createdOnUtc: '2026-10-02T09:00:00Z',
  },
  (fileId) => fileId,
);

async function render(): Promise<HTMLElement> {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: API_BASE_URL, useValue: '/api' },
      {
        provide: TrainersService,
        useValue: { list: vi.fn().mockResolvedValue({ items: [trainer], totalCount: 1 }) },
      },
      { provide: TrainerAccountsService, useValue: {} },
      { provide: TrainerSubscriptionsService, useValue: {} },
      { provide: SoldierLookupService, useValue: {} },
      { provide: ConfirmDialogService, useValue: {} },
      { provide: NotificationService, useValue: { success: vi.fn(), error: vi.fn() } },
    ],
  });
  const fixture = TestBed.createComponent(TrainersListPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

function headerTexts(element: HTMLElement): string[] {
  return [...element.querySelectorAll('th')].map((header) => header.textContent?.trim() ?? '');
}

describe('TrainersListPage', () => {
  it('should show no commission column when the trainers are listed', async () => {
    const element = await render();

    expect(headerTexts(element).filter((text) => COMMISSION_HEADER.test(text))).toEqual([]);
  });

  it('should show a cell under every header when a trainer is listed', async () => {
    const element = await render();

    expect(element.querySelectorAll('tbody tr:first-child td').length).toBe(
      headerTexts(element).length,
    );
  });
});
