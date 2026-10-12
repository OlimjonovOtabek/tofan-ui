import { TestBed } from '@angular/core/testing';
import { TextField } from './text-field';

async function render(
  inputs: Record<string, unknown>,
): Promise<{ input: HTMLInputElement; field: TextField; detect: () => void }> {
  const fixture = TestBed.createComponent(TextField);
  fixture.componentRef.setInput('inputId', 'name');
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();
  await fixture.whenStable();
  const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#name');
  if (input === null) {
    throw new Error('The text input is missing.');
  }
  return { input, field: fixture.componentInstance, detect: () => fixture.detectChanges() };
}

describe('TextField', () => {
  it('should set the typed text when the user types', async () => {
    const { input, field } = await render({});

    input.value = 'Peaktofan Classic';
    input.dispatchEvent(new Event('input'));

    expect(field.value()).toBe('Peaktofan Classic');
  });

  it('should not mark the input invalid when the field was not touched yet', async () => {
    const { input } = await render({ invalid: true });

    expect(input.classList).not.toContain('p-invalid');
  });

  it('should mark the input invalid when the invalid field was touched', async () => {
    const { input } = await render({ invalid: true, touched: true });

    expect(input.classList).toContain('p-invalid');
  });

  it('should report a touch when the input loses focus', async () => {
    const { input, field } = await render({});
    const touched = vi.fn();
    field.touch.subscribe(touched);

    input.dispatchEvent(new Event('blur'));

    expect(touched).toHaveBeenCalled();
  });
});
