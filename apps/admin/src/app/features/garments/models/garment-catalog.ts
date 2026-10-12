export const GARMENT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
export type GarmentSize = (typeof GARMENT_SIZES)[number];
