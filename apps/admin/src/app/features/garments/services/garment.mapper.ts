import { CreatedGarment } from '../models/created-garment';
import { Garment } from '../models/garment';
import { GarmentDraft } from '../models/garment-draft';
import { GarmentStatus } from '../models/garment-status';
import { enumMap } from '@shared/utils/enum-map';
import { fromUtcCalendarDate, toUtcCalendarDate } from '@shared/utils/calendar-date';
import {
  CreateGarmentRequest,
  CreateGarmentResponse,
  GarmentResponse,
  GarmentStatus as ApiGarmentStatus,
} from './garment.dto';

export const garmentStatuses = enumMap<GarmentStatus, ApiGarmentStatus>(ApiGarmentStatus);

export function toGarment(response: GarmentResponse): Garment {
  return new Garment(
    response.id,
    response.token,
    response.serialNumber,
    response.model,
    response.color,
    response.size,
    response.material,
    fromUtcCalendarDate(response.manufacturedAt),
    garmentStatuses.toDomain(response.status),
    response.ownerId ?? null,
    toDateOrNull(response.activatedAt),
    toDateOrNull(response.expiresAt),
  );
}

export function toCreateGarmentRequest(draft: GarmentDraft): CreateGarmentRequest {
  return {
    model: draft.model,
    color: draft.color,
    size: draft.size,
    material: draft.material,
    manufacturedAt: toUtcCalendarDate(draft.manufacturedAt),
  };
}

export function toCreatedGarment(response: CreateGarmentResponse): CreatedGarment {
  return {
    id: response.id,
    serialNumber: response.serialNumber,
    token: response.token,
    linkUrl: response.linkUrl,
  };
}

function toDateOrNull(value: string | null | undefined): Date | null {
  return value === null || value === undefined ? null : new Date(value);
}
