import { TestBed } from '@angular/core/testing';
import { SheetHost } from './sheet-host';
import { TextPair } from './sheet-request';
import { Sheets } from './sheets.service';

describe('SheetHost pair sheet', () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
      this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
      this.open = false;
    };
  });

  function open(titleRequired: boolean) {
    const fixture = TestBed.createComponent(SheetHost);
    const sheets = TestBed.inject(Sheets);
    const result = sheets.pair({
      title: 'Collection',
      initial: { title: ' Grija ', text: '' },
      titleHint: 'Name',
      textHint: 'Description',
      actionLabel: 'Save',
      titleRequired,
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, sheets, result, element };
  }

  function type(element: HTMLElement, selector: string, value: string): void {
    const field = element.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
    if (field === null) {
      throw new Error(`No ${selector}`);
    }
    field.value = value;
    field.dispatchEvent(new Event('input'));
  }

  function saveButton(element: HTMLElement): HTMLButtonElement {
    const button = element.querySelector<HTMLButtonElement>('.prompt > button');
    if (button === null) {
      throw new Error('No save button');
    }
    return button;
  }

  it('should start from the initial texts and return both trimmed', async () => {
    const { fixture, result, element } = open(true);
    expect(element.querySelector('input')?.value).toBe(' Grija ');

    type(element, 'textarea', ' Har kuni ');
    fixture.detectChanges();
    saveButton(element).click();

    await expect(result).resolves.toEqual<TextPair>({ title: 'Grija', text: 'Har kuni' });
  });

  it('should not save a required title left blank', () => {
    const { fixture, element } = open(true);

    type(element, 'input', '   ');
    fixture.detectChanges();

    expect(saveButton(element).disabled).toBe(true);
  });

  it('should return nothing when the sheet is dismissed', async () => {
    const { sheets, result } = open(false);

    sheets.dismiss();

    await expect(result).resolves.toBeNull();
  });
});

describe('SheetHost prompt sheet', () => {
  it('should return the typed text', async () => {
    HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
      this.open = true;
    };
    const fixture = TestBed.createComponent(SheetHost);
    const result = TestBed.inject(Sheets).prompt({
      title: 'Name',
      initial: 'Old',
      hint: 'Name',
      actionLabel: 'Save',
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector('input');
    if (input === null) {
      throw new Error('No input');
    }
    input.value = ' New ';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('.prompt > button')?.click();

    await expect(result).resolves.toBe('New');
  });
});
