import { SessionStatus } from '../../models/coach-session-status';
import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { Page } from '@shared/models/page';
import { CoachAdherence, CoachClientProfile, CoachWorkoutSession } from '../../models/coach-client';
import { CoachClientDetailService } from '../../services/coach-client-detail.service';
import { CLIENT_DETAIL_STORES } from '../../coach-client-detail.providers';
import { CoachClientDetailStore } from '../../coach-client-detail.store';
import { CoachClientsService } from '../../services/coach-clients.service';
import { CoachWorkoutReport } from './coach-workout-report';

const profile: CoachClientProfile = {
  profileId: 'p1',
  userId: 'u1',
  firstName: 'Aziz',
  lastName: 'Demo',
  userName: 'aziz',
  profilePhotoUrl: null,
  timeZone: 'UTC',
  heightCm: null,
  currentWeightKg: null,
  targetWeightKg: null,
  goal: null,
  goalTargetDate: null,
};

const adherence: CoachAdherence = {
  fromDate: '2026-09-30',
  toDate: '2026-10-02',
  scheduledDays: 2,
  completedDays: 1,
  missedDays: 1,
  restDays: 1,
  adherencePercent: 50,
  days: [
    { date: '2026-09-30', isRestDay: true, isMissed: false, sessionStatus: null },
    { date: '2026-10-01', isRestDay: false, isMissed: false, sessionStatus: 'completed' },
    { date: '2026-10-02', isRestDay: false, isMissed: true, sessionStatus: null },
  ],
};

function session(id: string, status: SessionStatus): CoachWorkoutSession {
  return {
    id,
    planDayTitle: `Day ${id}`,
    status,
    startedOnUtc: '2026-10-01T07:12:00Z',
    completedOnUtc: null,
    durationMinutes: 58,
    estimatedCaloriesBurned: 412,
    exerciseCount: 6,
    completedSetCount: 18,
    totalVolumeKg: 4260,
  };
}

async function render(sessions: () => Promise<Page<CoachWorkoutSession>>, plan: CoachAdherence | null = adherence) {
  const service = {
    getProfile: vi.fn().mockResolvedValue(profile),
    getWeightHistory: vi.fn().mockResolvedValue([]),
    getSessions: vi.fn(sessions),
    getAdherence: vi.fn().mockResolvedValue(plan),
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
  const fixture = TestBed.createComponent(CoachWorkoutReport);
  fixture.detectChanges();
  await fixture.whenStable();
  return { host: fixture.nativeElement as HTMLElement, service, fixture };
}

describe('CoachWorkoutReport', () => {
  it('should show the adherence figures returned by the backend', async () => {
    const { host } = await render(() => Promise.resolve({ items: [], totalCount: 0 }));
    const values = [...host.querySelectorAll('.adherence-kpis b')].map((item) => item.firstChild?.textContent?.trim());

    expect(values).toEqual(['50', '1', '1', '1']);
  });

  it('should align the first day under its weekday and mark each day by its outcome', async () => {
    const { host } = await render(() => Promise.resolve({ items: [], totalCount: 0 }));
    const cells = [...host.querySelectorAll('.cal-day')];

    expect(host.querySelectorAll('.cal-blank')).toHaveLength(2);
    expect(cells.map((cell) => cell.classList.item(1))).toEqual(['rest', 'completed', 'missed']);
  });

  it('should list sessions and say how many of the total are shown', async () => {
    const { host } = await render(() => Promise.resolve({ items: [session('a', 'completed'), session('b', 'skipped')], totalCount: 23 }));

    expect(host.querySelectorAll('.table-row')).toHaveLength(2);
    expect(host.querySelector('.list-foot')?.textContent).toContain('23');
    expect(host.querySelector('.list-foot button')).not.toBeNull();
  });

  it('should hide load more when every session is already shown', async () => {
    const { host } = await render(() => Promise.resolve({ items: [session('a', 'completed')], totalCount: 1 }));

    expect(host.querySelector('.list-foot button')).toBeNull();
  });

  it('should keep adherence visible and offer retry when only sessions fail', async () => {
    const { host, service, fixture } = await render(() => Promise.reject(new ServiceUnavailableError()));
    service.getSessions.mockResolvedValueOnce({ items: [session('a', 'completed')], totalCount: 1 });

    expect(host.querySelector('.adherence-kpis')).not.toBeNull();
    host.querySelector<HTMLButtonElement>('coach-report-state button')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(service.getAdherence).toHaveBeenCalledTimes(1);
    expect(host.querySelectorAll('.table-row')).toHaveLength(1);
  });

  it('should show the empty state when the client has no plan days', async () => {
    const { host } = await render(() => Promise.resolve({ items: [], totalCount: 0 }), { ...adherence, days: [] });

    expect(host.querySelector('.adherence-kpis')).toBeNull();
    expect(host.querySelectorAll('coach-report-state')).toHaveLength(2);
  });
});
