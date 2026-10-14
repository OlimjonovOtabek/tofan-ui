import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CoachClientSummary } from '../../models/coach-client';
import { CoachClientsPage } from './coach-clients-page';
import { CoachClientsService } from '../../services/coach-clients.service';

const clients: CoachClientSummary[] = [
  {
    userId: 'u1',
    firstName: 'Ali',
    lastName: 'Valiyev',
    goal: 'loseWeight',
    currentWeightKg: 82.4,
    targetWeightKg: 76,
    subscribedOnUtc: '2026-10-01T00:00:00Z',
    subscriptionEndsOnUtc: '2026-11-01T00:00:00Z',
  },
  {
    userId: 'u2',
    firstName: 'Vali',
    lastName: 'Aliyev',
    goal: null,
    currentWeightKg: null,
    targetWeightKg: null,
    subscribedOnUtc: '2026-10-02T00:00:00Z',
    subscriptionEndsOnUtc: '2026-11-02T00:00:00Z',
  },
];

async function render(list: CoachClientSummary[]) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: CoachClientsService, useValue: { list: vi.fn().mockResolvedValue(list) } }],
  });
  const fixture = TestBed.createComponent(CoachClientsPage);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('CoachClientsPage', () => {
  it('should render one row per client linking to the client report', async () => {
    const host = await render(clients);
    const rows = host.querySelectorAll<HTMLAnchorElement>('.client-row');

    expect(rows).toHaveLength(2);
    expect(rows[0].getAttribute('href')).toBe('/clients/u1');
  });

  it('should show a dash instead of a weight when the backend has none', async () => {
    const host = await render(clients);
    const cells = host.querySelectorAll('.client-row')[1].querySelectorAll('.client-cell');

    expect(cells[0].textContent).toContain('—');
    expect(cells[1].textContent).toContain('—');
  });

  it('should show the empty state when there are no active subscribers', async () => {
    const host = await render([]);

    expect(host.querySelector('.clients-empty')).not.toBeNull();
    expect(host.querySelector('.client-row')).toBeNull();
  });
});
