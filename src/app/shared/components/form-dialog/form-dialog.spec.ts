import { TestBed } from '@angular/core/testing';
import { FormDialog } from './form-dialog';

describe('FormDialog', () => {
  it('should emit save and keep the page when the form is submitted with Enter', async () => {
    const fixture = TestBed.createComponent(FormDialog);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('header', 'Test');
    const saved = vi.fn();
    fixture.componentInstance.save.subscribe(saved);
    fixture.detectChanges();
    await fixture.whenStable();

    const form = document.querySelector('form');
    const event = new Event('submit', { cancelable: true });
    form?.dispatchEvent(event);

    expect(form).not.toBeNull();
    expect(event.defaultPrevented).toBe(true);
    expect(saved).toHaveBeenCalledTimes(1);
  });
});
