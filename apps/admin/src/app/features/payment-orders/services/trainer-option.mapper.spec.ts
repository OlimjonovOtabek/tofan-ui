import { toTrainerOption } from './trainer-option.mapper';

describe('toTrainerOption', () => {
  it('should keep the name and read the monthly price as the Standard price', () => {
    expect(
      toTrainerOption({
        id: '452bcf11-d084-4224-a4d2-54a589dfc707',
        displayName: 'Stage Coach',
        monthlyPrice: 200000,
      }),
    ).toEqual({
      id: '452bcf11-d084-4224-a4d2-54a589dfc707',
      displayName: 'Stage Coach',
      standardPrice: 200000,
    });
  });
});
