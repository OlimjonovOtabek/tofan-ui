import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormField, form } from '@angular/forms/signals';
import { SelectField } from '@shared/components/select-field/select-field';
import { ToggleField } from '@shared/components/toggle-field/toggle-field';
import { TextareaField } from '@shared/components/textarea-field/textarea-field';

@Component({
  imports: [FormField, ToggleField, SelectField, TextareaField],
  template: `
    <app-toggle-field inputId="homeWorkout" [formField]="workoutForm.home" />
    <app-select-field ariaLabel="Workout goal" [formField]="workoutForm.goal" [options]="options" />
    <app-textarea-field inputId="instructions" [formField]="workoutForm.bio" />
  `,
})
class TestHost {
  readonly value = signal<{ home: boolean; goal: string | null; bio: string }>({
    home: false,
    goal: null,
    bio: 'Training plans',
  });
  readonly options = [{ value: 'strength', label: 'Strength' }];
  readonly workoutForm = form(this.value);
}

async function render() {
  const fixture = TestBed.createComponent(TestHost);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

describe('Coach controls with Signal Forms', () => {
  it('should update the form value and touched state when toggled', async () => {
    const fixture = await render();
    const host = fixture.nativeElement as HTMLElement;
    host.querySelector<HTMLInputElement>('input')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.value().home).toBe(true);
    expect(fixture.componentInstance.workoutForm.home().touched()).toBe(true);
  });

  it('should expose an accessible name for the goal selector', async () => {
    const fixture = await render();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('[role="combobox"]')?.getAttribute('aria-label')).toBe(
      'Workout goal',
    );
  });

  it('should display changes made to the form model', async () => {
    const fixture = await render();
    fixture.componentInstance.value.set({ home: true, goal: null, bio: 'Training plans' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector<HTMLInputElement>('input')?.checked).toBe(true);
  });

  it('should update text and touched state through the textarea adapter', async () => {
    const fixture = await render();
    const host = fixture.nativeElement as HTMLElement;
    const textarea = host.querySelector<HTMLTextAreaElement>('#instructions');
    if (textarea === null) {
      throw new Error('Instructions control was not rendered');
    }
    expect(textarea.value).toBe('Training plans');
    textarea.value = 'New instructions';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.value().bio).toBe('New instructions');
    expect(fixture.componentInstance.workoutForm.bio().touched()).toBe(true);
  });
});
