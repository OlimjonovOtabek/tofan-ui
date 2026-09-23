import { TestBed } from '@angular/core/testing';
import { ChoiceField } from './choice-field';

type Size = 'M' | 'L';

async function render(): Promise<{ host: HTMLElement; field: ChoiceField<Size> }> {
  const fixture = TestBed.createComponent<ChoiceField<Size>>(ChoiceField);
  fixture.componentRef.setInput('options', [
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
  ]);
  fixture.detectChanges();
  await fixture.whenStable();
  return { host: fixture.nativeElement as HTMLElement, field: fixture.componentInstance };
}

describe('ChoiceField', () => {
  it('should render every option when options are given', async () => {
    const { host } = await render();

    expect(host.querySelectorAll('p-togglebutton')).toHaveLength(2);
  });

  it('should set the value and report a touch when an option is clicked', async () => {
    const { host, field } = await render();
    const touched = vi.fn();
    field.touch.subscribe(touched);

    host.querySelectorAll<HTMLElement>('p-togglebutton')[1]?.click();

    expect(field.value()).toBe('L');
    expect(touched).toHaveBeenCalled();
  });
});
