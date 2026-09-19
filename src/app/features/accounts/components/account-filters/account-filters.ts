import { Component, computed, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { debounceTime } from 'rxjs';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { Translator } from '@core/i18n/translator';
import { AccountFilter, AccountRoleFilter } from '../../models/account-filter';
import { ACCOUNT_ROLE_OPTIONS, ACCOUNT_STATUS_OPTIONS } from '../../models/account-labels';

const SEARCH_DEBOUNCE_MS = 400;

interface AccountFilterValue {
  readonly search: string;
  readonly isActive: boolean | null;
  readonly role: AccountRoleFilter | null;
}

@Component({
  selector: 'app-account-filters',
  imports: [ReactiveFormsModule, Button, InputText, Select, TranslatePipe],
  templateUrl: './account-filters.html',
})
export class AccountFilters {
  private readonly translator = inject(Translator);

  readonly filterChange = output<AccountFilter>();

  protected readonly statusOptions = computed(() =>
    this.translator.options(ACCOUNT_STATUS_OPTIONS),
  );
  protected readonly roleOptions = computed(() => this.translator.options(ACCOUNT_ROLE_OPTIONS));

  protected readonly form = inject(NonNullableFormBuilder).group({
    search: [''],
    isActive: [null as boolean | null],
    role: [null as AccountRoleFilter | null],
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed())
      .subscribe(() => this.filterChange.emit(toAccountFilter(this.form.getRawValue())));
  }

  protected reset(): void {
    this.form.reset();
  }
}

function toAccountFilter(value: AccountFilterValue): AccountFilter {
  const search = value.search.trim();
  return {
    ...(search.length === 0 ? {} : { search }),
    ...(value.isActive === null ? {} : { isActive: value.isActive }),
    ...(value.role === null ? {} : { role: value.role }),
  };
}
