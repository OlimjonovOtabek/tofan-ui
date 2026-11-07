import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Client } from '@coach/core/clients/client';
import { ClientsService } from '@coach/core/clients/clients.service';
import { NotificationService } from '@core/feedback/notification.service';
import { Translator } from '@core/i18n/translator';
import { ClientsPage } from './clients-page';

const client = (userId: string, firstName: string, tier: Client['tier']): Client => ({
  userId,
  firstName,
  lastName: '',
  goal: null,
  currentWeightKg: null,
  targetWeightKg: null,
  subscribedOn: null,
  subscriptionEndsOn: null,
  status: 'active',
  tier,
  lastWorkoutOn: new Date(),
  adherencePercent: null,
});

describe('ClientsPage', () => {
  const list = vi.fn();

  async function render(clients: readonly Client[]): Promise<HTMLElement> {
    list.mockResolvedValue(clients);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ClientsService, useValue: { list } },
        { provide: NotificationService, useValue: { error: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(ClientsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function rowOf(page: HTMLElement, name: string): HTMLElement | undefined {
    return Array.from(page.querySelectorAll<HTMLElement>('.row')).find((row) =>
      row.textContent?.includes(name),
    );
  }

  it('should show the VIP tag on a client row when the client has the VIP tier', async () => {
    const page = await render([client('1', 'Aziz', 'vip'), client('2', 'Bobur', 'standard')]);
    const vip = TestBed.inject(Translator).translate('coachApp.clients.tierVip');

    expect(rowOf(page, 'Aziz')?.textContent).toContain(vip);
  });

  it('should not show the VIP tag on a client row when the client has the standard tier', async () => {
    const page = await render([client('1', 'Aziz', 'vip'), client('2', 'Bobur', 'standard')]);
    const vip = TestBed.inject(Translator).translate('coachApp.clients.tierVip');

    expect(rowOf(page, 'Bobur')?.textContent).not.toContain(vip);
  });
});
