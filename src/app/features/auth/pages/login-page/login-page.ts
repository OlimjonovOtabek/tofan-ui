import { Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toErrorMessage } from '@core/feedback/error-message';
import { AuthStore } from '@core/auth/auth.store';
import { FloatingThemeSwitcher } from '@core/layout/components/floating-theme-switcher/floating-theme-switcher';
import { AppPaths } from '@core/config/app-paths';
import { Logo } from '@shared/components/logo/logo';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Message } from '@openng/optimus-ui/message';
import { Password } from '@openng/optimus-ui/password';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { MessagePipe } from '@core/i18n/message.pipe';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    Button,
    InputText,
    Password,
    Message,
    Logo,
    FloatingThemeSwitcher,
    TranslatePipe,
    MessagePipe,
  ],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly returnUrl = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    try {
      const { username, password } = this.form.getRawValue();
      await this.authStore.login(username, password);
      await this.router.navigateByUrl(this.safeReturnUrl());
    } catch (error) {
      this.errorMessage.set(toErrorMessage(error));
    } finally {
      this.isSubmitting.set(false);
    }
  }

  protected isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && control.touched;
  }

  private safeReturnUrl(): string {
    const url = this.returnUrl();
    return url?.startsWith('/') && !url.startsWith('//') ? url : AppPaths.dashboard;
  }
}
