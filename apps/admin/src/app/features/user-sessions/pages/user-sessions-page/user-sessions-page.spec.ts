import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { UserSession } from '../../models/user-session';
import { UserSessionsService } from '../../services/user-sessions.service';
import { UserSessionsPage } from './user-sessions-page';

const FAR_FUTURE = new Date('2999-01-01T00:00:00Z');

const newSession = new UserSession(
  's1',
  '92042477-885e-4df9-a90e-247f7ccf1049',
  new Date('2026-11-10T10:39:00Z'),
  FAR_FUTURE,
  null,
  'stage-admin',
  '195.158.8.218',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
);

const olderSession = new UserSession(
  's2',
  '73f8e8f0-90a3-49e2-b42a-3111072bceb4',
  new Date('2026-10-01T10:00:00Z'),
  new Date('2026-10-01T10:30:00Z'),
  null,
  null,
  null,
  null,
);

describe('UserSessionsPage', () => {
  let service: { list: ReturnType<typeof vi.fn> };

  async function render(): Promise<ComponentFixture<UserSessionsPage>> {
    const fixture = TestBed.createComponent(UserSessionsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function cell(fixture: ComponentFixture<UserSessionsPage>, row: number, column: number): Element {
    const rows = (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr');
    const found = rows[row]?.querySelectorAll('td')[column];
    if (found === undefined) {
      throw new Error(`Cell ${row}:${column} is missing.`);
    }
    return found;
  }

  beforeEach(() => {
    service = {
      list: vi.fn().mockResolvedValue({ items: [newSession, olderSession], totalCount: 2 }),
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: UserSessionsService, useValue: service },
        { provide: ClipboardService, useValue: { copy: vi.fn() } },
      ],
    });
  });

  it('should show the username, the device and the address when the session is new', async () => {
    const fixture = await render();

    expect(cell(fixture, 0, 0).querySelector('a')?.textContent?.trim()).toBe('stage-admin');
    const device = cell(fixture, 0, 1).querySelectorAll('div');
    expect(device[0]?.textContent?.trim()).toBe('Chrome · macOS');
    expect(device[1]?.textContent?.trim()).toBe('195.158.8.218');
  });

  it('should show the short user id and say there is no device data when the session is older', async () => {
    const fixture = await render();

    expect(cell(fixture, 1, 0).querySelector('a')?.textContent?.trim()).toBe('73f8e8f0');
    expect(cell(fixture, 1, 1).textContent?.trim()).toBe("Ma'lumot yo'q");
  });

  it('should link the user to the account card when the table is shown', async () => {
    const fixture = await render();

    expect(cell(fixture, 0, 0).querySelector('a')?.getAttribute('href')).toBe(
      '/accounts/92042477-885e-4df9-a90e-247f7ccf1049',
    );
  });
});
