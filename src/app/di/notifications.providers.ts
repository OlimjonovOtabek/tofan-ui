import { EnvironmentProviders, inject, makeEnvironmentProviders } from '@angular/core';
import { CreateNotificationTemplateUseCase } from '@application/notifications/create-notification-template.use-case';
import { DeleteNotificationTemplateUseCase } from '@application/notifications/delete-notification-template.use-case';
import { GetNotificationTemplatesUseCase } from '@application/notifications/get-notification-templates.use-case';
import { SendCustomNotificationUseCase } from '@application/notifications/send-custom-notification.use-case';
import { SendTemplatedNotificationUseCase } from '@application/notifications/send-templated-notification.use-case';
import { UpdateNotificationTemplateUseCase } from '@application/notifications/update-notification-template.use-case';
import { NotificationSender } from '@domain/notifications/repositories/notification-sender';
import { NotificationTemplateRepository } from '@domain/notifications/repositories/notification-template.repository';
import { FakeNotificationTemplateRepository } from '@infrastructure/notifications/fake-notification-template.repository';
import { FakeNotificationSender } from '@infrastructure/notifications/fake-notification.sender';
import { HttpNotificationTemplateRepository } from '@infrastructure/notifications/http-notification-template.repository';
import { HttpNotificationSender } from '@infrastructure/notifications/http-notification.sender';

export interface NotificationsProvidersOptions {
  readonly useMockApi: boolean;
}

export function provideNotifications({
  useMockApi,
}: NotificationsProvidersOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    // The fake sender reads the fake templates, so both must be the same instance.
    useMockApi
      ? { provide: NotificationTemplateRepository, useExisting: FakeNotificationTemplateRepository }
      : { provide: NotificationTemplateRepository, useClass: HttpNotificationTemplateRepository },
    {
      provide: NotificationSender,
      useClass: useMockApi ? FakeNotificationSender : HttpNotificationSender,
    },
    {
      provide: GetNotificationTemplatesUseCase,
      useFactory: () => new GetNotificationTemplatesUseCase(inject(NotificationTemplateRepository)),
    },
    {
      provide: CreateNotificationTemplateUseCase,
      useFactory: () =>
        new CreateNotificationTemplateUseCase(inject(NotificationTemplateRepository)),
    },
    {
      provide: UpdateNotificationTemplateUseCase,
      useFactory: () =>
        new UpdateNotificationTemplateUseCase(inject(NotificationTemplateRepository)),
    },
    {
      provide: DeleteNotificationTemplateUseCase,
      useFactory: () =>
        new DeleteNotificationTemplateUseCase(inject(NotificationTemplateRepository)),
    },
    {
      provide: SendCustomNotificationUseCase,
      useFactory: () => new SendCustomNotificationUseCase(inject(NotificationSender)),
    },
    {
      provide: SendTemplatedNotificationUseCase,
      useFactory: () => new SendTemplatedNotificationUseCase(inject(NotificationSender)),
    },
  ]);
}
