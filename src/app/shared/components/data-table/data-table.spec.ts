import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DataTable, DataTableColumn } from './data-table';

interface Row {
  readonly id: string;
  readonly name: string;
}

@Component({
  imports: [DataTable],
  template: `
    <app-data-table
      [columns]="columns"
      [items]="items()"
      [totalCount]="items().length"
      [error]="error()"
      emptyMessage="Hech narsa yo'q."
      (retry)="retries = retries + 1"
    >
      <ng-template #row let-row>
        <tr>
          <td>{{ row.name }}</td>
        </tr>
      </ng-template>
    </app-data-table>
  `,
})
class DataTableHost {
  readonly columns: readonly DataTableColumn[] = [{ field: 'name', header: 'Nomi' }];
  readonly items = signal<readonly Row[]>([]);
  readonly error = signal<string | null>(null);
  retries = 0;
}

describe('DataTable', () => {
  function render(): { host: DataTableHost; element: HTMLElement; refresh: () => void } {
    const fixture = TestBed.createComponent(DataTableHost);
    fixture.detectChanges();
    return {
      host: fixture.componentInstance,
      element: fixture.nativeElement as HTMLElement,
      refresh: () => fixture.detectChanges(),
    };
  }

  it('should show the empty message when there are no rows and no error', () => {
    const { element } = render();

    expect(element.textContent).toContain("Hech narsa yo'q.");
    expect(element.querySelector('[role=alert]')).toBeNull();
  });

  it('should show the error instead of the empty message when loading failed', () => {
    const { host, element, refresh } = render();

    host.error.set("Serverga ulanib bo'lmadi.");
    refresh();

    expect(element.querySelector('[role=alert]')?.textContent).toContain(
      "Serverga ulanib bo'lmadi.",
    );
    expect(element.textContent).not.toContain("Hech narsa yo'q.");
  });

  it('should emit retry when the retry button is clicked', () => {
    const { host, element, refresh } = render();
    host.error.set('Xatolik');
    refresh();

    element.querySelector<HTMLButtonElement>('[role=alert] button')?.click();

    expect(host.retries).toBe(1);
  });

  it('should render the rows when there are items', () => {
    const { host, element, refresh } = render();

    host.items.set([{ id: '1', name: 'Skvat' }]);
    refresh();

    expect(element.textContent).toContain('Skvat');
  });
});
