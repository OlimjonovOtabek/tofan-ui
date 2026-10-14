import { TestBed } from '@angular/core/testing';
import { CoachWorkoutDayList } from './coach-workout-day-list';
import { WorkoutDayDraft, WorkoutDaySaveState } from '../../models/coach-workout-draft';

function day(key: string, title: string, overrides: Partial<WorkoutDayDraft> = {}): WorkoutDayDraft {
  return {
    key,
    id: key,
    workoutPlanId: 'plan-1',
    dayOfWeek: 'monday',
    splitType: 'fullBody',
    title,
    isRestDay: false,
    displayOrder: 0,
    exercises: [],
    ...overrides,
  };
}

async function render(days: readonly WorkoutDayDraft[], selectedKey: string | null, states = new Map<string, WorkoutDaySaveState>()) {
  const fixture = TestBed.createComponent(CoachWorkoutDayList);
  fixture.componentRef.setInput('days', days);
  fixture.componentRef.setInput('selectedKey', selectedKey);
  fixture.componentRef.setInput('saveStates', states);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('CoachWorkoutDayList', () => {
  it('should mark only the selected day as active when rendering the days', async () => {
    const fixture = await render([day('a', 'Push'), day('b', 'Pull')], 'b');
    const items = (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.day-item');

    expect(items).toHaveLength(2);
    expect(items[0].classList.contains('active')).toBe(false);
    expect(items[1].classList.contains('active')).toBe(true);
  });

  it('should emit the day key when a day is chosen', async () => {
    const fixture = await render([day('a', 'Push'), day('b', 'Pull')], 'a');
    const selected: string[] = [];
    fixture.componentInstance.daySelected.subscribe((key) => selected.push(key));

    (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.day-item')[1].click();

    expect(selected).toEqual(['b']);
  });

  it('should show the save state of a day that failed to save', async () => {
    const fixture = await render([day('a', 'Push')], 'a', new Map([['a', 'failed']]));

    expect((fixture.nativeElement as HTMLElement).querySelector('.workspace-status.failed')).not.toBeNull();
  });

  it('should emit add request when the add day button is pressed', async () => {
    const fixture = await render([], null);
    let requested = 0;
    fixture.componentInstance.addRequested.subscribe(() => requested++);

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.day-add')?.click();

    expect(requested).toBe(1);
  });
});
