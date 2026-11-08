import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoldierOption } from '@shared/models/soldier-option';
import { SoldierField } from './soldier-field';

const otabek: SoldierOption = {
  userId: '73f8e8f0-90a3-49e2-b42a-3111072bceb4',
  label: 'Otabek Olimjonov',
  userName: 'otabek',
};

async function render(): Promise<ComponentFixture<SoldierField>> {
  const fixture = TestBed.createComponent(SoldierField);
  fixture.componentRef.setInput('options', [otabek]);
  fixture.componentRef.setInput('inputId', 'soldier');
  await settle(fixture);
  return fixture;
}

async function settle(fixture: ComponentFixture<SoldierField>): Promise<void> {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

function shownText(): string {
  return document.querySelector<HTMLInputElement>('#soldier')?.value ?? '';
}

async function pickOtabek(fixture: ComponentFixture<SoldierField>): Promise<void> {
  document.querySelector<HTMLElement>('.p-autocomplete-dropdown')?.click();
  await settle(fixture);
  document.querySelector<HTMLElement>('li[role="option"]')?.click();
  await settle(fixture);
}

describe('SoldierField', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    });
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('should set the user id and show the name when a soldier is picked', async () => {
    const fixture = await render();

    await pickOtabek(fixture);

    expect(fixture.componentInstance.value()).toBe(otabek.userId);
    expect(shownText()).toBe('Otabek Olimjonov');
  });

  it('should clear the shown name when the form resets the value', async () => {
    const fixture = await render();
    await pickOtabek(fixture);

    fixture.componentInstance.value.set(null);
    await settle(fixture);

    expect(shownText()).toBe('');
  });
});
