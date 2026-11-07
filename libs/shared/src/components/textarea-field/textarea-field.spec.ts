import { TestBed } from '@angular/core/testing';
import { TextareaField } from './textarea-field';

async function render(inputs: Record<string, unknown> = {}): Promise<HTMLTextAreaElement> {
  const fixture = TestBed.createComponent(TextareaField);
  fixture.componentRef.setInput('inputId', 'bio');
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();
  await fixture.whenStable();
  const textarea = (fixture.nativeElement as HTMLElement).querySelector<HTMLTextAreaElement>(
    '#bio',
  );
  if (textarea === null) {
    throw new Error('The textarea is missing.');
  }
  return textarea;
}

describe('TextareaField', () => {
  it('should fill the width of its container when it is rendered', async () => {
    const textarea = await render();

    expect(textarea.classList).toContain('p-textarea-fluid');
  });

  it('should show the given number of rows when rows are set', async () => {
    const textarea = await render({ rows: 3 });

    expect(textarea.rows).toBe(3);
  });
});
