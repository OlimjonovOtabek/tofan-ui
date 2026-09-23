import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ClipboardService } from '@core/feedback/clipboard.service';
import { Garment } from '../../models/garment';
import { GarmentViewDialog } from './garment-view-dialog';

const SERIAL = '01K7X8M4Q9F2A6BC3DEFGHJKMN';

const garment = new Garment(
  'f3a1',
  'n1gq9Xh2',
  SERIAL,
  'Peaktofan Classic',
  '#1A3C6E',
  'L',
  '',
  new Date(2026, 8, 20),
  'inactive',
);

async function render(): Promise<{ copy: ReturnType<typeof vi.fn> }> {
  const copy = vi.fn().mockResolvedValue(undefined);
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: ClipboardService, useValue: { copy } }],
  });
  const fixture = TestBed.createComponent(GarmentViewDialog);
  fixture.componentRef.setInput('visible', true);
  fixture.componentRef.setInput('garment', garment);
  fixture.detectChanges();
  await fixture.whenStable();
  return { copy };
}

function copyButtons(): HTMLButtonElement[] {
  return [...document.body.querySelectorAll<HTMLButtonElement>('dl button')];
}

describe('GarmentViewDialog', () => {
  afterEach(() => {
    document.body.querySelectorAll('.p-dialog-mask').forEach((mask) => mask.remove());
  });

  it('should show every field and a dash for the empty ones when a garment is given', async () => {
    await render();
    const text = document.body.textContent ?? '';

    expect(text).toContain(SERIAL);
    expect(text).toContain('#1A3C6E');
    expect(text).toContain('—');
  });

  it('should offer a copy button only for the fields that have a value', async () => {
    await render();

    expect(copyButtons()).toHaveLength(7);
  });

  it('should copy the serial number when its copy button is clicked', async () => {
    const { copy } = await render();

    copyButtons()[0]?.click();

    expect(copy).toHaveBeenCalledWith(SERIAL, 'garments.fields.serialNumber');
  });
});
