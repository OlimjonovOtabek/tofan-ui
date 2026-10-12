import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachClientProfile } from '../../models/coach-client';
import { CoachWeightPoint } from '../../services/coach-client-detail.dto';
import { CoachClientDetailService } from '../../services/coach-client-detail.service';
import { CLIENT_DETAIL_STORES } from '../../coach-client-detail.providers';
import { CoachClientDetailStore } from '../../coach-client-detail.store';
import { CoachClientsService } from '../../services/coach-clients.service';
import { CoachWeightReport } from './coach-weight-report';

const profile: CoachClientProfile = {
  profileId: 'p1',
  userId: 'u1',
  firstName: 'Aziz',
  lastName: 'Demo',
  userName: 'aziz',
  profilePhotoUrl: null,
  timeZone: 'UTC',
  heightCm: 178,
  currentWeightKg: 82.4,
  targetWeightKg: 76,
  goal: 'loseWeight',
  goalTargetDate: '2026-12-01',
};

function weight(id: string, day: string, weightKg: number): CoachWeightPoint {
  return { id, weightKg, loggedDate: day, loggedOnUtc: `${day}T06:00:00Z`, note: null };
}

async function render(getWeightHistory: () => Promise<readonly CoachWeightPoint[]>) {
  const service = {
    getProfile: vi.fn().mockResolvedValue(profile),
    getWeightHistory: vi.fn(getWeightHistory),
    getSessions: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
    getAdherence: vi.fn().mockResolvedValue(null),
    getNutrition: vi.fn().mockResolvedValue([]),
    getFoodLogs: vi.fn().mockResolvedValue([]),
  };
  TestBed.configureTestingModule({
    providers: [
      ...CLIENT_DETAIL_STORES,
      { provide: CoachClientDetailService, useValue: service },
      { provide: CoachClientsService, useValue: { list: vi.fn().mockResolvedValue([]) } },
    ],
  });
  await TestBed.inject(CoachClientDetailStore).load('u1');
  const fixture = TestBed.createComponent(CoachWeightReport);
  fixture.detectChanges();
  await fixture.whenStable();
  return { host: fixture.nativeElement as HTMLElement, service, fixture };
}

describe('CoachWeightReport', () => {
  it('should show the period change and the newest entries first', async () => {
    const { host } = await render(() =>
      Promise.resolve([weight('a', '2026-10-01', 84.2), weight('b', '2026-10-02', 84), weight('c', '2026-10-03', 83.5)]),
    );
    const stats = [...host.querySelectorAll('.stat-row dd')].map((item) => item.textContent.trim());
    const rows = host.querySelectorAll('.table-row');

    expect(stats.slice(0, 3)).toEqual(['84.2 kg', '83.5 kg', '−0.7 kg']);
    expect(rows).toHaveLength(3);
    expect(rows[0].textContent).toContain('83.5 kg');
  });

  it('should colour a change toward the target weight as good', async () => {
    const { host } = await render(() => Promise.resolve([weight('a', '2026-10-01', 84.2), weight('b', '2026-10-02', 83.5)]));

    expect(host.querySelectorAll('.stat-row dd')[2].classList.contains('good')).toBe(true);
  });

  it('should show how much is left to the target weight', async () => {
    const { host } = await render(() => Promise.resolve([]));

    expect(host.querySelector('.goal-box b')?.textContent).toBe('6.4 kg');
  });

  it('should show the empty state and keep the profile summary when there is no history', async () => {
    const { host } = await render(() => Promise.resolve([]));

    expect(host.querySelector('coach-report-state')).not.toBeNull();
    expect(host.querySelector('.weight-chart')).toBeNull();
    expect(host.querySelector('.weight-value')?.textContent).toContain('82.4');
  });

  it('should reload only the weight history when retry is pressed after a failure', async () => {
    const { host, service, fixture } = await render(() => Promise.reject(new ServiceUnavailableError()));
    service.getWeightHistory.mockResolvedValueOnce([weight('a', '2026-10-01', 84.2)]);

    host.querySelector<HTMLButtonElement>('coach-report-state button')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(service.getWeightHistory).toHaveBeenCalledTimes(2);
    expect(service.getNutrition).toHaveBeenCalledTimes(1);
    expect(host.querySelector('.weight-chart')).not.toBeNull();
  });
});
