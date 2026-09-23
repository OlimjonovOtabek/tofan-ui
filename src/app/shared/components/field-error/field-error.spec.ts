import { TestBed } from '@angular/core/testing';
import { FieldError, FieldErrorSource } from './field-error';

function render(field: FieldErrorSource): HTMLElement {
  const fixture = TestBed.createComponent(FieldError);
  fixture.componentRef.setInput('field', field);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('FieldError', () => {
  it('should show the first message when the field was touched', () => {
    const element = render({
      touched: () => true,
      errors: () => [{}, { message: 'Seriya raqami kiritilishi shart.' }, { message: 'other' }],
    });

    expect(element.textContent?.trim()).toBe('Seriya raqami kiritilishi shart.');
  });

  it('should translate a key and fill in the limit when the validator carries one', () => {
    const tooLong = { kind: 'maxLength', message: 'garments.form.errors.tooLong', maxLength: 200 };
    const element = render({ touched: () => true, errors: () => [tooLong] });

    expect(element.textContent?.trim()).toBe('200 belgidan oshmasligi kerak.');
  });

  it('should stay empty when the field was not touched', () => {
    const element = render({ touched: () => false, errors: () => [{ message: 'error' }] });

    expect(element.querySelector('small')).toBeNull();
  });
});
