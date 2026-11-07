import { CdkDropList } from '@angular/cdk/drag-drop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Translator } from '@core/i18n/translator';
import { Benefit } from '@shared/models/benefit';
import { BenefitsDialog } from './benefits-dialog';

const FIRST: Benefit = { en: 'First', ru: 'Первый', uz: 'Birinchi' };
const SECOND: Benefit = { en: 'Second', ru: 'Второй', uz: 'Ikkinchi' };
const THIRD: Benefit = { en: 'Third', ru: 'Третий', uz: 'Uchinchi' };

interface Opened {
  readonly fixture: ComponentFixture<BenefitsDialog>;
  readonly saved: ReturnType<typeof vi.fn>;
}

async function settle(fixture: ComponentFixture<BenefitsDialog>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
}

async function open(benefits: readonly Benefit[] = [FIRST, SECOND, THIRD]): Promise<Opened> {
  const fixture = TestBed.createComponent(BenefitsDialog);
  fixture.componentRef.setInput('header', 'Imtiyozlar');
  fixture.componentRef.setInput('benefits', benefits);
  fixture.componentRef.setInput('visible', true);
  const saved = vi.fn();
  fixture.componentInstance.save.subscribe(saved);
  await settle(fixture);
  return { fixture, saved };
}

function rows(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('ol li'));
}

function inputsOf(row: HTMLElement): HTMLInputElement[] {
  return Array.from(row.querySelectorAll('input'));
}

function texts(language: 0 | 1 | 2): string[] {
  return rows().map((row) => inputsOf(row)[language].value);
}

function english(): string[] {
  return texts(0);
}

function type(input: HTMLInputElement, text: string): void {
  input.value = text;
  input.dispatchEvent(new Event('input'));
}

function translate(...args: Parameters<Translator['translate']>): string {
  return TestBed.inject(Translator).translate(...args);
}

function buttonLabelled(label: string): HTMLButtonElement {
  const button = document.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
  if (button === null) {
    throw new Error(`No button labelled "${label}"`);
  }
  return button;
}

function moveUpButton(number: number): HTMLButtonElement {
  return buttonLabelled(translate('common.benefits.moveUp', { number }));
}

function moveDownButton(number: number): HTMLButtonElement {
  return buttonLabelled(translate('common.benefits.moveDown', { number }));
}

function removeButton(number: number): HTMLButtonElement {
  return buttonLabelled(translate('common.benefits.remove', { number }));
}

function addButton(): HTMLButtonElement {
  const label = translate('common.benefits.add');
  const button = Array.from(document.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  if (button === undefined) {
    throw new Error('No add button');
  }
  return button;
}

function saveButton(): HTMLButtonElement {
  const label = translate('common.actions.save');
  const button = Array.from(document.querySelectorAll('button')).find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  if (button === undefined) {
    throw new Error('No save button');
  }
  return button;
}

describe('BenefitsDialog', () => {
  it('should show the given benefits in their order with all three texts when the dialog opens', async () => {
    await open([FIRST, SECOND]);

    expect(rows()).toHaveLength(2);
    expect(texts(0)).toEqual(['First', 'Second']);
    expect(texts(1)).toEqual(['Первый', 'Второй']);
    expect(texts(2)).toEqual(['Birinchi', 'Ikkinchi']);
  });

  it('should show the plain text warning when the dialog opens', async () => {
    await open();

    expect(document.body.textContent).toContain(translate('common.benefits.plainTextWarning'));
  });

  it('should show how many benefits exist out of the maximum when the dialog opens', async () => {
    await open();

    expect(document.body.textContent).toContain('3 / 20');
  });

  it('should emit the benefits in the shown order when nothing changed', async () => {
    const { fixture, saved } = await open();

    saveButton().click();
    await settle(fixture);

    expect(saved).toHaveBeenCalledWith([FIRST, SECOND, THIRD]);
  });

  it('should add an empty row at the end when add is pressed', async () => {
    const { fixture } = await open([FIRST]);

    addButton().click();
    await settle(fixture);

    expect(rows()).toHaveLength(2);
    expect(english()).toEqual(['First', '']);
  });

  it('should emit the new benefit last when it was added and filled', async () => {
    const { fixture, saved } = await open([FIRST]);
    addButton().click();
    await settle(fixture);
    const [en, ru, uz] = inputsOf(rows()[1]);

    type(en, 'Added');
    type(ru, 'Добавлено');
    type(uz, "Qo'shildi");
    saveButton().click();
    await settle(fixture);

    expect(saved).toHaveBeenCalledWith([FIRST, { en: 'Added', ru: 'Добавлено', uz: "Qo'shildi" }]);
  });

  it('should stop adding when 20 benefits exist', async () => {
    const twenty = Array.from({ length: 20 }, (_, index) => ({
      en: `En ${index}`,
      ru: `Ru ${index}`,
      uz: `Uz ${index}`,
    }));
    const { fixture } = await open(twenty);

    expect(addButton().disabled).toBe(true);
    addButton().click();
    await settle(fixture);

    expect(rows()).toHaveLength(20);
  });

  it('should remove a row and emit the rest when remove is pressed', async () => {
    const { fixture, saved } = await open();

    removeButton(2).click();
    await settle(fixture);
    saveButton().click();
    await settle(fixture);

    expect(english()).toEqual(['First', 'Third']);
    expect(saved).toHaveBeenCalledWith([FIRST, THIRD]);
  });

  it('should emit an empty list when every benefit was removed', async () => {
    const { fixture, saved } = await open([FIRST]);

    removeButton(1).click();
    await settle(fixture);
    saveButton().click();
    await settle(fixture);

    expect(saved).toHaveBeenCalledWith([]);
  });

  it('should show a hint instead of rows when no benefits exist', async () => {
    await open([]);

    expect(rows()).toHaveLength(0);
    expect(document.body.textContent).toContain(translate('common.benefits.empty'));
  });

  it('should emit the new order when a row is moved down with the button', async () => {
    const { fixture, saved } = await open();

    moveDownButton(1).click();
    await settle(fixture);
    saveButton().click();
    await settle(fixture);

    expect(english()).toEqual(['Second', 'First', 'Third']);
    expect(saved).toHaveBeenCalledWith([SECOND, FIRST, THIRD]);
  });

  it('should emit the new order when a row is moved up with the button', async () => {
    const { fixture, saved } = await open();

    moveUpButton(3).click();
    await settle(fixture);
    saveButton().click();
    await settle(fixture);

    expect(saved).toHaveBeenCalledWith([FIRST, THIRD, SECOND]);
  });

  it('should not offer to move the first row up or the last row down when the list is shown', async () => {
    await open();

    expect(moveUpButton(1).disabled).toBe(true);
    expect(moveDownButton(3).disabled).toBe(true);
    expect(moveDownButton(1).disabled).toBe(false);
    expect(moveUpButton(3).disabled).toBe(false);
  });

  it('should emit the dropped order when a row is dragged to another place', async () => {
    const { fixture, saved } = await open();
    const list = fixture.debugElement.query(By.directive(CdkDropList));

    list.triggerEventHandler('cdkDropListDropped', { previousIndex: 0, currentIndex: 2 });
    await settle(fixture);
    saveButton().click();
    await settle(fixture);

    expect(english()).toEqual(['Second', 'Third', 'First']);
    expect(saved).toHaveBeenCalledWith([SECOND, THIRD, FIRST]);
  });

  it('should keep what was typed in a row when the row is moved', async () => {
    const { fixture, saved } = await open();
    type(inputsOf(rows()[0])[1], 'Изменено');

    moveDownButton(1).click();
    await settle(fixture);
    saveButton().click();
    await settle(fixture);

    expect(saved).toHaveBeenCalledWith([SECOND, { ...FIRST, ru: 'Изменено' }, THIRD]);
  });

  it('should keep the same input in the page when the admin types so focus is not lost', async () => {
    const { fixture } = await open([FIRST]);
    const input = inputsOf(rows()[0])[0];

    type(input, 'Typing');
    await settle(fixture);

    expect(inputsOf(rows()[0])[0]).toBe(input);
    expect(input.value).toBe('Typing');
  });

  it('should refuse to save and show the error when a text is empty', async () => {
    const { fixture, saved } = await open();
    type(inputsOf(rows()[1])[2], '');

    saveButton().click();
    await settle(fixture);

    expect(saved).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain(translate('common.benefits.errors.required'));
  });

  it('should refuse to save when a text is only spaces', async () => {
    const { fixture, saved } = await open();
    type(inputsOf(rows()[0])[0], '   ');

    saveButton().click();
    await settle(fixture);

    expect(saved).not.toHaveBeenCalled();
  });

  it('should refuse to save and show the error when a text has more than 200 characters', async () => {
    const { fixture, saved } = await open();
    type(inputsOf(rows()[2])[1], 'a'.repeat(201));

    saveButton().click();
    await settle(fixture);

    expect(saved).not.toHaveBeenCalled();
    expect(document.body.textContent).toContain(
      translate('common.benefits.errors.tooLong', { max: 200 }),
    );
  });

  it('should accept a text when it has exactly 200 characters', async () => {
    const { fixture, saved } = await open();
    type(inputsOf(rows()[0])[0], 'a'.repeat(200));

    saveButton().click();
    await settle(fixture);

    expect(saved).toHaveBeenCalledWith([{ ...FIRST, en: 'a'.repeat(200) }, SECOND, THIRD]);
  });

  it('should emit the texts without surrounding spaces when they were typed with spaces', async () => {
    const { fixture, saved } = await open([FIRST]);
    type(inputsOf(rows()[0])[0], '  Padded  ');

    saveButton().click();
    await settle(fixture);

    expect(saved).toHaveBeenCalledWith([{ ...FIRST, en: 'Padded' }]);
  });

  it('should refuse to save when a row added later is still empty', async () => {
    const { fixture, saved } = await open([FIRST]);
    addButton().click();
    await settle(fixture);

    saveButton().click();
    await settle(fixture);

    expect(saved).not.toHaveBeenCalled();
  });

  it('should drop the unsaved edits when the dialog is opened again', async () => {
    const { fixture } = await open();
    removeButton(1).click();
    await settle(fixture);

    fixture.componentRef.setInput('visible', false);
    await settle(fixture);
    fixture.componentRef.setInput('visible', true);
    await settle(fixture);

    expect(english()).toEqual(['First', 'Second', 'Third']);
  });

  it('should show the latest benefits when the dialog is opened again', async () => {
    const { fixture } = await open([FIRST]);

    fixture.componentRef.setInput('visible', false);
    await settle(fixture);
    fixture.componentRef.setInput('benefits', [SECOND, THIRD]);
    fixture.componentRef.setInput('visible', true);
    await settle(fixture);

    expect(english()).toEqual(['Second', 'Third']);
  });
});
