export const errorsEn = {
  "backend": {
    "Authentication.InvalidCredentials": "Invalid username or password.",
    "Authentication.InvalidRefreshToken": "Session expired. Please log in again.",
    "IdentityProvider.UserNotFound": "User not found.",
    "NotificationTemplate.Conflict": "An active template for this type already exists. Deactivate it first.",
    "NotificationTemplate.NoActiveTemplate": "No active template found for this type.",
    "NotificationPreference.Disabled": "The user has disabled notifications of this type.",
    "PushNotification.NoActiveDevice": "The user has no active device to receive push notifications.",
    "PushNotification.DispatchFailed": "Push service failed to deliver the notification.",
    "PushNotification.Disabled": "Push notifications are disabled in this environment.",
    "PushNotification.ConfigurationInvalid": "Push service is not configured. Contact the administrator.",
    "UserId.Empty": "User ID is required.",
    "UserId.Invalid": "User ID must be a UUID.",
    "Data.KeyEmpty": "Each value must have a key.",
    "Data.KeyDuplicate": "Keys must be unique.",
    "StoredFile.InUse": "File is in use. Remove it from the exercise first.",
    "StoredFile.NotFound": "File not found — it may have been deleted.",
    "StoredFile.Empty": "The selected file is empty.",
    "StoredFile.UnsupportedContent": "This file type is not supported.",
    "StoredFile.TooLarge": "The file exceeds the allowed size.",
    "User.NotFound": "Account not found — it may have been deleted.",
    "User.AlreadyBlocked": "Account is already blocked.",
    "User.NotBlocked": "Account is not blocked.",
    "User.CannotBlockSelf": "You cannot block your own account.",
    "GetUsersQuery": "Failed to read accounts. Role filter may not work."
  },
  "classes": {
    "network": "Failed to connect to the server. Please try again later.",
    "invalidCredentials": "Invalid username or password.",
    "sessionExpired": "Session expired. Please log in again.",
    "accessDenied": "You do not have permission for this action.",
    "notFound": "Data not found — it may have been deleted.",
    "conflict": "Such data already exists.",
    "validationFallback": "Data is not filled correctly.",
    "generic": "Action failed. Please try again later."
  }
};