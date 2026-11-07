import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Client } from '@coach/core/clients/client';
import { Translator } from '@core/i18n/translator';
import { ClientProfile } from '../../models/client-detail';
import { ClientDetailService } from '../../services/client-detail.service';
import { ClientDetailPage } from './client-detail-page';

const profile: ClientProfile = {
  firstName: 'Aziz',
  lastName: 'Karimov',
  photoUrl: null,
  dateOfBirth: null,
  heightCm: null,
  startingWeightKg: null,
  currentWeightKg: null,
  targetWeightKg: null,
  goal: null,
  experienceLevel: null,
  isHomeWorkout: null,
  workoutDaysPerWeek: null,
};

const client = (status: Client['status'], tier: Client['tier']): Client => ({
  userId: 'u',
  firstName: 'Aziz',
  lastName: 'Karimov',
  goal: null,
  currentWeightKg: null,
  targetWeightKg: null,
  subscribedOn: null,
  subscriptionEndsOn: null,
  status,
  tier,
  lastWorkoutOn: null,
  adherencePercent: null,
});

describe('ClientDetailPage', () => {
  const service = {
    findClient: vi.fn(),
    profile: vi.fn(),
    payments: vi.fn(),
    adherence: vi.fn(),
    recentSessions: vi.fn(),
    todayNutrition: vi.fn(),
  };

  async function render(status: Client['status'], tier: Client['tier']): Promise<HTMLElement> {
    service.findClient.mockResolvedValue(client(status, tier));
    service.profile.mockResolvedValue(profile);
    service.payments.mockResolvedValue([]);
    service.adherence.mockResolvedValue({
      scheduledDays: 4,
      completedDays: 3,
      missedDays: 1,
      percent: 75,
    });
    service.recentSessions.mockResolvedValue([]);
    service.todayNutrition.mockResolvedValue(null);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: ClientDetailService, useValue: service }],
    });
    const fixture = TestBed.createComponent(ClientDetailPage);
    fixture.componentRef.setInput('userId', 'u');
    const page = fixture.nativeElement as HTMLElement;
    await vi.waitFor(() => {
      fixture.detectChanges();
      expect(page.querySelector('.hero')).not.toBeNull();
    });
    return page;
  }

  const vipTag = () => TestBed.inject(Translator).translate('coachApp.clients.tierVip');
  const writeLabel = () => TestBed.inject(Translator).translate('coachApp.clientDetail.write');

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should show the VIP tag and the write button when the client is VIP and active', async () => {
    const page = await render('active', 'vip');

    expect(page.querySelector('.tags')?.textContent).toContain(vipTag());
    expect(page.querySelector('.coach-footer')?.textContent).toContain(writeLabel());
  });

  it('should keep the write button when the client is VIP and the subscription is expiring', async () => {
    const page = await render('expiring', 'vip');

    expect(page.querySelector('.coach-footer')?.textContent).toContain(writeLabel());
  });

  it('should hide the VIP tag and the write button when the client is on the standard tier', async () => {
    const page = await render('active', 'standard');

    expect(page.querySelector('.tags')?.textContent).not.toContain(vipTag());
    expect(page.querySelector('.coach-footer')).toBeNull();
  });

  it('should hide the write button when the VIP subscription ended', async () => {
    const page = await render('ended', 'vip');

    expect(page.querySelector('.coach-footer')).toBeNull();
  });
});
