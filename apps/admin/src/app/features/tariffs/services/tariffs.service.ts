import { Injectable, inject } from '@angular/core';
import { ApiClient } from '@core/http/api-client';
import { Benefit } from '@shared/models/benefit';
import { Tariff } from '../models/tariff';
import { TariffDraft } from '../models/tariff-draft';
import { TariffType } from '../models/tariff-type';
import { TariffResponse } from './tariff.dto';
import {
  tariffTypes,
  toChangeTariffBenefitsRequest,
  toChangeTariffRequest,
  toTariffs,
} from './tariff.mapper';

const TARIFFS = '/tariffs';
const ADMIN_TARIFFS = '/admin/tariffs';

@Injectable({ providedIn: 'root' })
export class TariffsService {
  private readonly apiClient = inject(ApiClient);

  async list(): Promise<readonly Tariff[]> {
    return toTariffs(await this.apiClient.get<TariffResponse[]>(TARIFFS));
  }

  async change(type: TariffType, draft: TariffDraft): Promise<void> {
    await this.apiClient.put(
      `${ADMIN_TARIFFS}/${tariffTypes.toApi(type)}`,
      toChangeTariffRequest(draft),
    );
  }

  async changeBenefits(type: TariffType, benefits: readonly Benefit[]): Promise<void> {
    await this.apiClient.put(
      `${ADMIN_TARIFFS}/${tariffTypes.toApi(type)}/benefits`,
      toChangeTariffBenefitsRequest(benefits),
    );
  }
}
