import { Injectable, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { Food } from './models/food';
import { MealProgramsService } from './services/meal-programs.service';

@Injectable()
export class FoodPickerStore {
  private readonly service = inject(MealProgramsService);
  private latest = '';

  readonly foods = signal<readonly Food[] | null>(null);
  readonly error = signal<ErrorMessage | null>(null);

  async search(query: string): Promise<void> {
    const text = query.trim();
    this.latest = text;
    this.error.set(null);
    this.foods.set(null);
    try {
      const foods = await this.service.searchFoods(text);
      if (text === this.latest) {
        this.foods.set(foods);
      }
    } catch (error) {
      if (text === this.latest) {
        this.error.set(toErrorMessage(error));
      }
    }
  }
}
