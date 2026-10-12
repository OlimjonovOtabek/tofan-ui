import { Logo } from '@shared/components/logo/logo';
import { Card } from '@openng/optimus-ui/card';
import { Message } from '@openng/optimus-ui/message';
import { TextField } from '@shared/components/text-field/text-field';
import { ButtonDirective } from '@openng/optimus-ui/button';
import { Component, inject, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { toErrorMessage } from '@core/feedback/error-message';
import { Translator } from '@core/i18n/translator';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { required, schema } from '@angular/forms/signals';

interface LoginValue {
  username: string;
  password: string;
}

const loginSchema = schema<LoginValue>((path) => {
  required(path.username);
  required(path.password);
});

@Component({
  selector: 'coach-login-page',
  imports: [Logo, Card, Message, TextField, ButtonDirective, FormField, TranslatePipe],
  templateUrl: './coach-login-page.html',
  styleUrl: './coach-login-page.css',
})
export class CoachLoginPage {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translator = inject(Translator);

  protected readonly value = signal<LoginValue>({ username: '', password: '' });
  protected readonly loginForm = form(this.value, loginSchema);
  protected readonly saving = signal(false);
  protected readonly failure = signal<string | null>(null);

  protected async submit(): Promise<void> {
    this.loginForm().markAsTouched();
    if (this.loginForm().invalid()) {
      return;
    }
    this.saving.set(true);
    this.failure.set(null);
    try {
      await this.auth.login(this.value().username, this.value().password);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/programs';
      await this.router.navigateByUrl(returnUrl);
    } catch (error) {
      this.failure.set(this.translator.message(toErrorMessage(error)));
    } finally {
      this.saving.set(false);
    }
  }
}
