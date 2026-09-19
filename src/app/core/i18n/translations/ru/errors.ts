export const errorsRu = {
  "backend": {
    "Authentication.InvalidCredentials": "Неверный логин или пароль.",
    "Authentication.InvalidRefreshToken": "Сессия истекла. Войдите снова.",
    "IdentityProvider.UserNotFound": "Пользователь не найден.",
    "NotificationTemplate.Conflict": "Активный шаблон для этого типа уже существует. Сначала деактивируйте его.",
    "NotificationTemplate.NoActiveTemplate": "Не найден активный шаблон для этого типа.",
    "NotificationPreference.Disabled": "Пользователь отключил уведомления этого типа.",
    "PushNotification.NoActiveDevice": "У пользователя нет активного устройства для получения push-уведомлений.",
    "PushNotification.DispatchFailed": "Служба push не смогла доставить уведомление.",
    "PushNotification.Disabled": "Push-уведомления отключены в этой среде.",
    "PushNotification.ConfigurationInvalid": "Служба push не настроена (отсутствуют ключи Firebase). Обратитесь к администратору.",
    "UserId.Empty": "Необходимо указать ID пользователя.",
    "UserId.Invalid": "ID пользователя должен быть в формате UUID.",
    "Data.KeyEmpty": "Каждое значение должно иметь ключ.",
    "Data.KeyDuplicate": "Ключи не должны повторяться.",
    "StoredFile.InUse": "Файл используется. Сначала удалите его из упражнения.",
    "StoredFile.NotFound": "Файл не найден — возможно, он уже удален.",
    "StoredFile.Empty": "Выбранный файл пуст.",
    "StoredFile.UnsupportedContent": "Этот тип файла не поддерживается для выбранной категории.",
    "StoredFile.TooLarge": "Файл превышает допустимый размер.",
    "User.NotFound": "Аккаунт не найден — возможно, он удален из Keycloak.",
    "User.AlreadyBlocked": "Аккаунт уже заблокирован.",
    "User.NotBlocked": "Аккаунт не заблокирован.",
    "User.CannotBlockSelf": "Нельзя заблокировать собственный аккаунт.",
    "GetUsersQuery": "Не удалось прочитать аккаунты. Фильтр ролей может не работать без настройки Keycloak."
  },
  "classes": {
    "network": "Не удалось подключиться к серверу. Повторите попытку позже.",
    "invalidCredentials": "Неверный логин или пароль.",
    "sessionExpired": "Сессия истекла. Войдите снова.",
    "accessDenied": "У вас нет доступа для этого действия.",
    "notFound": "Данные не найдены — возможно, они удалены.",
    "conflict": "Такие данные уже существуют.",
    "validationFallback": "Данные заполнены неверно.",
    "generic": "Не удалось выполнить действие. Повторите попытку позже."
  }
};