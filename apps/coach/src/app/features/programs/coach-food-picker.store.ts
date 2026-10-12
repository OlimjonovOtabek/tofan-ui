import { Injectable, inject, signal } from '@angular/core';
import { NotificationService } from '@core/feedback/notification.service';
import { DEFAULT_LIBRARY_SOURCE, LibrarySource } from './models/coach-library-source';
import { MealFoodChoice } from './models/coach-meal-draft';
import { toCatalogFoodChoice, toOwnFoodChoice } from './services/coach-meal-program.mapper';
import { CoachProgramLibraryService } from './services/coach-program-library.service';

@Injectable()
export class CoachFoodPickerStore {
  private readonly library = inject(CoachProgramLibraryService);
  private readonly notifications = inject(NotificationService);

  readonly options = signal<readonly MealFoodChoice[]>([]);
  readonly loading = signal(false);
  readonly source = signal<LibrarySource>(DEFAULT_LIBRARY_SOURCE);
  readonly searchText = signal('');

  reset(): Promise<void> {
    this.source.set(DEFAULT_LIBRARY_SOURCE);
    this.searchText.set('');
    return this.load();
  }

  setSource(source: LibrarySource): Promise<void> {
    this.source.set(source);
    return this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.options.set(await this.fetch(this.searchText().trim()));
    } catch (error) {
      this.options.set([]);
      this.notifications.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  private async fetch(search: string): Promise<readonly MealFoodChoice[]> {
    if (this.source() === 'own') {
      return (await this.library.listOwnFoods()).map(toOwnFoodChoice);
    }
    return (await this.library.listFoodCatalog(search)).map(toCatalogFoodChoice);
  }
}
