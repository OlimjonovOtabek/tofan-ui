import { Injectable, computed, inject, signal } from '@angular/core';
import { ErrorMessage, toErrorMessage } from '@core/feedback/error-message';
import { Page } from '@shared/models/page';
import { LatestRequest } from './models/coach-latest-request';
import { ReportRange, periodRange } from './models/coach-report-period';
import { SessionStatus } from './models/coach-session-status';
import { CoachAdherence, CoachWorkoutSession } from './models/coach-client';
import { CoachClientDetailService } from './services/coach-client-detail.service';

const DEFAULT_DAYS = 14;

@Injectable()
export class CoachWorkoutReportStore {
  private readonly service = inject(CoachClientDetailService);
  private readonly latestSessions = new LatestRequest();
  private readonly latestAdherence = new LatestRequest();
  private readonly defaultRange = periodRange(DEFAULT_DAYS, new Date());
  private userId: string | null = null;

  readonly sessions = signal<Page<CoachWorkoutSession> | null>(null);
  readonly sessionError = signal<ErrorMessage | null>(null);
  readonly adherence = signal<CoachAdherence | null>(null);
  readonly adherenceError = signal<ErrorMessage | null>(null);
  readonly sessionFrom = signal(this.defaultRange.from);
  readonly sessionTo = signal(this.defaultRange.to);
  readonly sessionStatus = signal<SessionStatus | null>(null);
  readonly loadingMoreSessions = signal(false);
  readonly canLoadMoreSessions = computed(() => {
    const page = this.sessions();
    return page !== null && page.items.length < page.totalCount;
  });

  async show(userId: string): Promise<void> {
    this.userId = userId;
    await Promise.all([this.loadSessions(), this.loadAdherence()]);
  }

  clear(): void {
    this.latestSessions.cancel();
    this.latestAdherence.cancel();
    this.userId = null;
    this.sessions.set(null);
    this.sessionError.set(null);
    this.adherence.set(null);
    this.adherenceError.set(null);
  }

  async setWorkoutRange(range: ReportRange): Promise<void> {
    this.sessionFrom.set(range.from);
    this.sessionTo.set(range.to);
    await Promise.all([this.loadSessions(), this.loadAdherence()]);
  }

  setSessionStatus(status: SessionStatus | null): Promise<void> {
    this.sessionStatus.set(status);
    return this.loadSessions();
  }

  retrySessions(): Promise<void> {
    return this.loadSessions();
  }

  retryAdherence(): Promise<void> {
    return this.loadAdherence();
  }

  async moreSessions(): Promise<void> {
    const page = this.sessions();
    if (page === null || !this.canLoadMoreSessions() || this.loadingMoreSessions()) {
      return;
    }
    const isCurrent = this.latestSessions.begin();
    this.loadingMoreSessions.set(true);
    try {
      const next = await this.fetchSessions(page.items.length);
      if (next !== null && isCurrent()) {
        this.sessions.set(appendPage(page, next));
        this.sessionError.set(null);
      }
    } catch (error) {
      if (isCurrent()) {
        this.sessionError.set(toErrorMessage(error));
      }
    } finally {
      this.loadingMoreSessions.set(false);
    }
  }

  private async loadSessions(): Promise<void> {
    const isCurrent = this.latestSessions.begin();
    try {
      const sessions = await this.fetchSessions(0);
      if (sessions !== null && isCurrent()) {
        this.sessions.set(sessions);
        this.sessionError.set(null);
      }
    } catch (error) {
      if (isCurrent()) {
        this.sessions.set(null);
        this.sessionError.set(toErrorMessage(error));
      }
    }
  }

  private async loadAdherence(): Promise<void> {
    const userId = this.userId;
    if (userId === null) {
      return;
    }
    const isCurrent = this.latestAdherence.begin();
    try {
      const adherence = await this.service.getAdherence(userId, this.sessionFrom(), this.sessionTo());
      if (isCurrent()) {
        this.adherence.set(adherence);
        this.adherenceError.set(null);
      }
    } catch (error) {
      if (isCurrent()) {
        this.adherence.set(null);
        this.adherenceError.set(toErrorMessage(error));
      }
    }
  }

  private async fetchSessions(first: number): Promise<Page<CoachWorkoutSession> | null> {
    const userId = this.userId;
    if (userId === null) {
      return null;
    }
    return this.service.getSessions(
      userId,
      first,
      this.sessionFrom(),
      this.sessionTo(),
      this.sessionStatus() ?? undefined,
    );
  }
}

function appendPage(
  known: Page<CoachWorkoutSession>,
  next: Page<CoachWorkoutSession>,
): Page<CoachWorkoutSession> {
  const knownIds = new Set(known.items.map((item) => item.id));
  return {
    items: [...known.items, ...next.items.filter((item) => !knownIds.has(item.id))],
    totalCount: next.totalCount,
  };
}
