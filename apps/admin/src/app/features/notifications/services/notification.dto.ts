export enum NotificationType {
  WorkoutReminder = 1,
  MealReminder = 2,
  WaterReminder = 3,
  StreakReminder = 4,
  GoalMilestone = 5,
  DpEarned = 6,
  SecurityAlert = 7,
  WeeklyReport = 8,
  LeaderboardChange = 9,
}

export enum TrainerStyle {
  Soft = 1,
  Professional = 2,
  Aggressive = 3,
}

export interface NotificationTemplateResponse {
  id: string;
  type: NotificationType;
  trainerStyle: TrainerStyle;
  title: string;
  titleUz: string;
  titleRu: string;
  body: string;
  bodyUz: string;
  bodyRu: string;
  isActive: boolean;
  createdOnUtc: string;
  updatedOnUtc: string;
}

export interface CreateNotificationTemplateRequest {
  type: NotificationType;
  trainerStyle: TrainerStyle;
  title: string;
  titleUz: string;
  titleRu: string;
  body: string;
  bodyUz: string;
  bodyRu: string;
  isActive: boolean;
}

export interface SendCustomNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string> | null;
}

export interface SendTemplatedNotificationRequest {
  userId: string;
  type: NotificationType;
  data?: Record<string, string> | null;
}
