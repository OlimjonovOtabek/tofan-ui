import { GarmentFormValue, emptyGarmentFormValue, toGarmentDraft } from './garment-form.schema';

const value: GarmentFormValue = {
  model: 'Peaktofan Classic',
  color: '#1A2B3C',
  size: 'M',
  material: '100% paxta',
  manufacturedAt: new Date(2026, 8, 20),
};

describe('garment form value', () => {
  it('should build the draft without a serial number when every field is filled', () => {
    expect(toGarmentDraft(value)).toEqual({
      model: 'Peaktofan Classic',
      color: '#1A2B3C',
      size: 'M',
      material: '100% paxta',
      manufacturedAt: new Date(2026, 8, 20),
    });
  });

  it('should build no draft when the size is not chosen yet', () => {
    expect(toGarmentDraft({ ...value, size: null })).toBeNull();
  });

  it('should start with an empty model and colour and the latest day when the dialog opens', () => {
    expect(emptyGarmentFormValue(new Date(2026, 8, 23))).toEqual({
      model: '',
      color: '',
      size: null,
      material: '',
      manufacturedAt: new Date(2026, 8, 23),
    });
  });
});
