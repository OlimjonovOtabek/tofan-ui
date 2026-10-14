import { Dialog } from '@openng/optimus-ui/dialog';
import { TextField } from '@shared/components/text-field/text-field';
import { NumberField } from '@shared/components/number-field/number-field';
import { Message } from '@openng/optimus-ui/message';
import { Skeleton } from '@openng/optimus-ui/skeleton';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormField, form, min, pattern, required, schema } from '@angular/forms/signals';
import { ConfirmDialogService } from '@core/feedback/confirmation.service';
import { CoachContentHeader } from '../../components/coach-content-header/coach-content-header';
import { MessagePipe } from '@core/i18n/message.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { CoachFoodRequest, CoachFoodSummary } from '../../services/coach-content.dto';
import { CoachFoodsStore } from '../../coach-foods.store';

interface CoachFoodFormValue {
  name: string;
  servingSizeGrams: number | null;
  caloriesPerServing: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatGrams: number | null;
  fiberGrams: number | null;
}

const NON_BLANK = /\S/;
const REQUIRED_NUMBER = 0;

const foodSchema = schema<CoachFoodFormValue>((path) => {
  required(path.name, { message: 'coach.content.foodNameRequired' });
  pattern(path.name, NON_BLANK, { message: 'coach.content.foodNameRequired' });
  required(path.servingSizeGrams, { message: 'coach.content.foodValueRequired' });
  min(path.servingSizeGrams, 0.1, { message: 'coach.content.foodValueRequired' });
  required(path.caloriesPerServing, { message: 'coach.content.foodValueRequired' });
  min(path.caloriesPerServing, REQUIRED_NUMBER, { message: 'coach.content.foodValueRequired' });
  required(path.proteinGrams, { message: 'coach.content.foodValueRequired' });
  min(path.proteinGrams, REQUIRED_NUMBER, { message: 'coach.content.foodValueRequired' });
  required(path.carbsGrams, { message: 'coach.content.foodValueRequired' });
  min(path.carbsGrams, REQUIRED_NUMBER, { message: 'coach.content.foodValueRequired' });
  required(path.fatGrams, { message: 'coach.content.foodValueRequired' });
  min(path.fatGrams, REQUIRED_NUMBER, { message: 'coach.content.foodValueRequired' });
});

function emptyForm(): CoachFoodFormValue {
  return {
    name: '',
    servingSizeGrams: null,
    caloriesPerServing: null,
    proteinGrams: null,
    carbsGrams: null,
    fatGrams: null,
    fiberGrams: null,
  };
}

@Component({
  selector: 'coach-foods-page',
  imports: [
    Dialog,
    NumberField,
    TextField,
    Message,
    Skeleton,
    ButtonDirective,
    FormField,
    MessagePipe,
    CoachContentHeader,
    TranslatePipe,
  ],
  providers: [CoachFoodsStore],
  templateUrl: './coach-foods-page.html',
  styleUrl: '../coach-library-page.css',
})
export class CoachFoodsPage implements OnInit {
  private readonly confirmations = inject(ConfirmDialogService);

  protected readonly store = inject(CoachFoodsStore);
  protected readonly searchText = signal('');
  protected readonly editingId = signal<string | null>(null);
  protected readonly editorVisible = signal(false);
  protected readonly value = signal<CoachFoodFormValue>(emptyForm());
  protected readonly foodForm = form(this.value, foodSchema);
  protected readonly items = computed(() => {
    const query = this.searchText().trim().toLocaleLowerCase();
    return this.store
      .items()
      .filter((food) => this.nameOf(food).toLocaleLowerCase().includes(query));
  });

  ngOnInit(): void {
    void this.store.load();
  }

  protected searchChanged(event: Event): void {
    const input = event.currentTarget;
    if (input instanceof HTMLInputElement) {
      this.searchText.set(input.value);
    }
  }

  protected clearSearch(): void {
    this.searchText.set('');
  }

  protected nameOf(item: CoachFoodSummary): string {
    return item.name;
  }

  protected addFood(): void {
    this.editingId.set(null);
    this.value.set(emptyForm());
    this.foodForm().reset(emptyForm());
    this.editorVisible.set(true);
  }

  protected editFood(food: CoachFoodSummary): void {
    this.editingId.set(food.id);
    const value = {
      name: food.name,
      servingSizeGrams: food.servingSizeGrams,
      caloriesPerServing: food.caloriesPerServing,
      proteinGrams: food.proteinGrams,
      carbsGrams: food.carbsGrams,
      fatGrams: food.fatGrams,
      fiberGrams: food.fiberGrams,
    };
    this.value.set(value);
    this.foodForm().reset(value);
    this.editorVisible.set(true);
  }

  protected async saveFood(): Promise<void> {
    this.foodForm().markAsTouched();
    if (this.foodForm().invalid()) {
      return;
    }
    const request = toRequest(this.value());
    if (request === null) {
      return;
    }
    if (await this.store.save(this.editingId(), request)) {
      this.editorVisible.set(false);
    }
  }

  protected async deleteFood(food: CoachFoodSummary): Promise<void> {
    const confirmed = await this.confirmations.confirmDelete(this.nameOf(food), {
      key: 'coach.content.deleteFoodConfirm',
    });
    if (confirmed) {
      await this.store.remove(food.id);
    }
  }
}

function toRequest(value: CoachFoodFormValue): CoachFoodRequest | null {
  const { servingSizeGrams, caloriesPerServing, proteinGrams, carbsGrams, fatGrams, fiberGrams } =
    value;
  if (
    servingSizeGrams === null ||
    caloriesPerServing === null ||
    proteinGrams === null ||
    carbsGrams === null ||
    fatGrams === null
  ) {
    return null;
  }
  return {
    name: value.name.trim(),
    servingSizeGrams,
    caloriesPerServing,
    proteinGrams,
    carbsGrams,
    fatGrams,
    fiberGrams,
  };
}
