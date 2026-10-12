import { MealType } from '@coach/core/fitness/meal-type';
import { TestBed } from '@angular/core/testing';
import { ServiceUnavailableError } from '@shared/models/errors/service-unavailable.error';
import { CoachClientProfile, CoachFoodLog } from '../../models/coach-client';
import { CoachDailyNutrition } from '../../services/coach-client-detail.dto';
import { CoachClientDetailService } from '../../services/coach-client-detail.service';
import { CLIENT_DETAIL_STORES } from '../../coach-client-detail.providers';
import { CoachClientDetailStore } from '../../coach-client-detail.store';
import { CoachClientsService } from '../../services/coach-clients.service';
import { CoachNutritionReport } from './coach-nutrition-report';

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

function day(date: string, consumedCalories: number, targetCalories: number, mealsLogged: number): CoachDailyNutrition {
  return {
    date,
    consumedCalories,
    targetCalories,
    proteinGrams: 120,
    carbsGrams: 200,
    fatGrams: 60,
    targetProteinGrams: 140,
    targetCarbsGrams: 230,
    targetFatGrams: 65,
    mealsLogged,
  };
}

function log(id: string, mealType: MealType): CoachFoodLog {
  return {
    id,
    foodId: 'apple',
    foodName: 'Apple',
    foodNameRu: 'Яблоко',
    foodNameUz: 'Olma',
    mealType,
    quantityGrams: 150,
    calories: 78,
    proteinGrams: 0.4,
    carbsGrams: 20.7,
    fatGrams: 0.3,
    loggedOnUtc: '2026-10-08T10:00:00Z',
  };
}

const days = [day('2026-10-07', 0, 2100, 0), day('2026-10-09', 1984, 2100, 4), day('2026-10-08', 2330, 2100, 5), day('2026-10-06', 1890, 0, 4)];

async function render(nutrition: () => Promise<readonly CoachDailyNutrition[]>, logs: readonly CoachFoodLog[] = []) {
  const service = {
    getProfile: vi.fn().mockResolvedValue(profile),
    getWeightHistory: vi.fn().mockResolvedValue([]),
    getSessions: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
    getAdherence: vi.fn().mockResolvedValue(null),
    getNutrition: vi.fn(nutrition),
    getFoodLogs: vi.fn().mockResolvedValue(logs),
  };
  TestBed.configureTestingModule({
    providers: [
      ...CLIENT_DETAIL_STORES,
      { provide: CoachClientDetailService, useValue: service },
      { provide: CoachClientsService, useValue: { list: vi.fn().mockResolvedValue([]) } },
    ],
  });
  await TestBed.inject(CoachClientDetailStore).load('u1');
  const fixture = TestBed.createComponent(CoachNutritionReport);
  fixture.detectChanges();
  await fixture.whenStable();
  return { host: fixture.nativeElement as HTMLElement, service, fixture };
}

describe('CoachNutritionReport', () => {
  it('should list the days from newest to oldest', async () => {
    const { host } = await render(() => Promise.resolve(days));
    const labels = [...host.querySelectorAll('.nutri-date b')].map((item) => item.textContent.trim());

    expect(labels.map((label) => label.replace(/\D/g, ''))).toEqual(['9', '8', '7', '6']);
  });

  it('should show the excess instead of hiding intake above the target', async () => {
    const { host } = await render(() => Promise.resolve(days));
    const row = host.querySelectorAll('.nutri-day')[1];

    expect(row.querySelector('.warn-text')?.textContent).toContain('230');
    expect(row.querySelector('.meter')?.classList.contains('over')).toBe(true);
  });

  it('should say there is no target instead of a percentage when the target is zero', async () => {
    const { host } = await render(() => Promise.resolve(days));
    const row = host.querySelectorAll('.nutri-day')[3];

    expect(row.querySelector('.meter')?.classList.contains('no-target')).toBe(true);
    expect(row.querySelector('.nutri-side')?.textContent).not.toContain('%');
  });

  it('should show a day without logged meals as having no entries', async () => {
    const { host } = await render(() => Promise.resolve(days));

    expect(host.querySelectorAll('.nutri-day')[2].querySelector('.meter')).toBeNull();
  });

  it('should load the diary of exactly the day that was chosen', async () => {
    const { host, service, fixture } = await render(() => Promise.resolve(days));

    host.querySelectorAll<HTMLButtonElement>('.nutri-day')[1].click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(service.getFoodLogs).toHaveBeenLastCalledWith('u1', '2026-10-08');
    expect(host.querySelectorAll('.nutri-day')[1].classList.contains('active')).toBe(true);
  });

  it('should keep the same food logged twice as two separate diary rows', async () => {
    const { host } = await render(() => Promise.resolve(days), [log('l1', 'snack'), log('l2', 'snack'), log('l3', 'breakfast')]);

    expect(host.querySelectorAll('.diary-group')).toHaveLength(2);
    expect(host.querySelectorAll('.diary-row')).toHaveLength(3);
  });

  it('should keep the diary block usable and retry only the report when it fails', async () => {
    const { host, service, fixture } = await render(() => Promise.reject(new ServiceUnavailableError()), [log('l1', 'breakfast')]);
    service.getNutrition.mockResolvedValueOnce(days);

    expect(host.querySelectorAll('.diary-row')).toHaveLength(1);
    host.querySelector<HTMLButtonElement>('.nutri-list coach-report-state button')?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(service.getFoodLogs).toHaveBeenCalledTimes(1);
    expect(host.querySelectorAll('.nutri-day')).toHaveLength(4);
  });
});
