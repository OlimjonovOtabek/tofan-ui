import { TestBed } from '@angular/core/testing';
import { ColorField } from './color-field';

async function render(value: string): Promise<{ host: HTMLElement; field: ColorField }> {
  const fixture = TestBed.createComponent(ColorField);
  fixture.componentRef.setInput('value', value);
  fixture.componentRef.setInput('inputId', 'color');
  fixture.detectChanges();
  await fixture.whenStable();
  return { host: fixture.nativeElement as HTMLElement, field: fixture.componentInstance };
}

function textInput(host: HTMLElement): HTMLInputElement {
  const input = host.querySelector<HTMLInputElement>('#color');
  if (input === null) {
    throw new Error('The colour code input is missing.');
  }
  return input;
}

describe('ColorField', () => {
  it('should show the code in the text input when a value is given', async () => {
    const { host } = await render('#1A2B3C');

    expect(textInput(host).value).toBe('#1A2B3C');
  });

  it('should set the typed code without spaces when the user types', async () => {
    const { host, field } = await render('');
    const input = textInput(host);

    input.value = ' #0F0F0F ';
    input.dispatchEvent(new Event('input'));

    expect(field.value()).toBe('#0F0F0F');
  });

  it('should report a touch when the text input loses focus', async () => {
    const { host, field } = await render('');
    const touched = vi.fn();
    field.touch.subscribe(touched);

    textInput(host).dispatchEvent(new Event('blur'));

    expect(touched).toHaveBeenCalled();
  });
});
