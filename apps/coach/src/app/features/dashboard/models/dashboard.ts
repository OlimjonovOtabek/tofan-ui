import { Payment } from '@coach/core/payments/payment';
import { DashboardPeriod } from './dashboard-period';

export interface EarningsTotal {
  readonly paymentCount: number;
  readonly netAmount: number;
}

export interface DashboardEarnings {
  readonly currencyCode: string;
  readonly totals: Readonly<Record<DashboardPeriod, EarningsTotal>>;
  readonly renewedThisMonth: number;
}

export interface SubscriberStats {
  readonly total: number;
  readonly active: number;
  readonly expiring: number;
  readonly renewedThisMonth: number;
  readonly churnedThisMonth: number;
  readonly activeUsers: number;
  readonly lowActivity: number;
}

export interface ProgramUsage {
  readonly workoutUsers: number;
  readonly workoutPercent: number;
  readonly mealUsers: number;
  readonly mealPercent: number;
}

export interface DashboardPerson {
  readonly userId: string;
  readonly fullName: string;
  readonly initials: string;
  readonly subscriptionEndsOn: Date;
  readonly lastWorkoutOn: Date | null;
}

export interface Dashboard {
  readonly earnings: DashboardEarnings | null;
  readonly subscribers: SubscriberStats | null;
  readonly programs: ProgramUsage | null;
  readonly expiring: readonly DashboardPerson[];
  readonly lowActivity: readonly DashboardPerson[];
  readonly recentPayments: readonly Payment[];
}
