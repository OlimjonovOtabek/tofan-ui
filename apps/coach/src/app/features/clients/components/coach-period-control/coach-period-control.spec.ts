import { TestBed } from '@angular/core/testing';
import { CoachPeriodControl } from './coach-period-control';
import { ReportRange, periodRange } from '../../models/coach-report-period';

async function render(range: ReportRange) {
  const fixture = TestBed.createComponent(CoachPeriodControl);
  fixture.componentRef.setInput('from', range.from);
  fixture.componentRef.setInput('to', range.to);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function buttons(host: HTMLElement): HTMLButtonElement[] {
  return [...host.querySelectorAll<HTMLButtonElement>('.segmented button')];
}

describe('CoachPeriodControl', () => {
  it('should mark the preset that matches the current range', async () => {
    const fixture = await render(periodRange(14, new Date()));
    const pressed = buttons(fixture.nativeElement as HTMLElement).map((button) => button.getAttribute('aria-pressed'));

    expect(pressed).toEqual(['false', 'true', 'false', 'false']);
  });

  it('should emit the preset range that ends today when a preset is chosen', async () => {
    const fixture = await render(periodRange(14, new Date()));
    const emitted: ReportRange[] = [];
    fixture.componentInstance.rangeChange.subscribe((range) => emitted.push(range));

    buttons(fixture.nativeElement as HTMLElement)[0].click();

    expect(emitted).toEqual([periodRange(7, new Date())]);
  });

  it('should show the date fields only when the range is custom', async () => {
    const preset = await render(periodRange(7, new Date()));
    expect((preset.nativeElement as HTMLElement).querySelector('.period-custom')).toBeNull();

    const custom = await render({ from: '2026-01-01', to: '2026-01-20' });
    expect((custom.nativeElement as HTMLElement).querySelectorAll('.period-custom input')).toHaveLength(2);
  });

  it('should not emit a range whose start is after its end', async () => {
    const fixture = await render({ from: '2026-01-01', to: '2026-01-20' });
    const emitted: ReportRange[] = [];
    fixture.componentInstance.rangeChange.subscribe((range) => emitted.push(range));
    const from = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('.period-custom input');
    if (from === null) {
      throw new Error('Custom date field is missing.');
    }

    from.value = '2026-02-01';
    from.dispatchEvent(new Event('change'));

    expect(emitted).toEqual([]);
  });
});
