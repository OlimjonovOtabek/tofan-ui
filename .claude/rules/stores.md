---
paths:
  - "src/app/**/*.store.ts"
---

# Store rules

- One store per screen, `@Injectable()`, provided by the page (`providers: [ExercisesStore]`).
  Only truly global state (`AuthStore`) is `providedIn: 'root'`.
- The store injects the feature service directly. No repository abstraction, no use-case classes.
- Private writable signals, public readonly views:

```ts
@Injectable()
export class ExercisesStore {
  private readonly exercisesService = inject(ExercisesService);
  private readonly notifications = inject(NotificationService);

  private readonly page = signal<Page<Exercise>>(emptyPage<Exercise>());
  private readonly currentRequest = signal<PageRequest>(firstPage());

  readonly exercises = computed(() => this.page().items);
  readonly totalCount = computed(() => this.page().totalCount);
  readonly loading = signal(false);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    try {
      this.page.set(await this.exercisesService.list(this.filter(), request));
    } catch (error) {
      this.notifications.error(error);
    } finally {
      this.loading.set(false);
    }
  }
}
```

- Writes: apply model rules (`createExerciseDraft(draft)`), call the service, notify via
  `core/feedback`, reload.
- No HttpClient, no Optimus UI. Navigation stays in the page.
