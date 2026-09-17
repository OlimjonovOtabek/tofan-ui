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
  readonly loadError = signal<string | null>(null);

  async load(request: PageRequest = this.currentRequest()): Promise<void> {
    this.currentRequest.set(request);
    this.loading.set(true);
    this.loadError.set(null);
    try {
      this.page.set(await this.exercisesService.list(this.filter(), request));
    } catch (error) {
      this.page.set(emptyPage<Exercise>());
      this.loadError.set(toErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }
}
```

- Reads: a failed load clears the old rows and sets `loadError` (text from `toErrorMessage`); it does
  not raise a toast. The page shows it inline and offers a retry, so a failure never looks like an
  empty list.
- Writes: apply model rules (`createExerciseDraft(draft)`), call the service, notify via
  `core/feedback` (toast), reload.
- No HttpClient, no Optimus UI. Navigation stays in the page.
