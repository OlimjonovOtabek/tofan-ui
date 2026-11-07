import { TestBed } from '@angular/core/testing';
import { MultiselectField } from './multiselect-field';

type Meal = 'breakfast' | 'lunch' | 'dinner';

const OPTIONS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
] as const;

async function render(
  inputs: Record<string, unknown> = {},
): Promise<{ host: HTMLElement; field: MultiselectField<Meal> }> {
  const fixture = TestBed.createComponent<MultiselectField<Meal>>(MultiselectField);
  fixture.componentRef.setInput('options', OPTIONS);
  fixture.componentRef.setInput('placeholder', 'Pick meals');
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();
  await fixture.whenStable();
  return { host: fixture.nativeElement as HTMLElement, field: fixture.componentInstance };
}

function openPanel(host: HTMLElement): void {
  host.querySelector<HTMLElement>('p-multiselect')?.click();
}

describe('MultiselectField', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should show the placeholder when nothing is chosen', async () => {
    const { host } = await render();

    expect(host.textContent).toContain('Pick meals');
  });

  it('should show the chosen labels when a value is set', async () => {
    const fixture = TestBed.createComponent<MultiselectField<Meal>>(MultiselectField);
    fixture.componentRef.setInput('options', OPTIONS);
    fixture.componentInstance.value.set(['lunch', 'dinner']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent;

    expect(text).toContain('Lunch');
    expect(text).toContain('Dinner');
    expect(text).not.toContain('Breakfast');
  });

  it('should add the value when an option is clicked', async () => {
    const { host, field } = await render();

    openPanel(host);
    await Promise.resolve();
    document.querySelectorAll<HTMLElement>('li[role="option"]')[1]?.click();

    expect(field.value()).toEqual(['lunch']);
  });

  it('should not open the panel when the field is disabled', async () => {
    const { host } = await render({ disabled: true });

    openPanel(host);
    await Promise.resolve();

    expect(document.querySelectorAll('li[role="option"]')).toHaveLength(0);
  });
});
