import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, computed, contentChild, input, output } from '@angular/core';
import { DEFAULT_PAGE_SIZE, PageRequest, SortDirection } from '@shared/models/page';
import { TableLazyLoadEvent } from '@openng/optimus-ui/types/table';
import { TableModule } from '@openng/optimus-ui/table';

export interface DataTableColumn {
  readonly field: string;
  readonly header: string;
  readonly sortable?: boolean;
  readonly width?: string;
}

const ASCENDING = 1;
const DESCENDING = -1;
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

@Component({
  selector: 'app-data-table',
  imports: [TableModule, NgTemplateOutlet],
  templateUrl: './data-table.html',
})
export class DataTable<TItem> {
  readonly columns = input.required<readonly DataTableColumn[]>();
  readonly items = input.required<readonly TItem[]>();
  readonly totalCount = input.required<number>();
  readonly loading = input(false);
  readonly pageSize = input(DEFAULT_PAGE_SIZE);
  readonly first = input(0);
  readonly emptyMessage = input("Ma'lumot topilmadi.");
  readonly dataKey = input('id');
  readonly defaultSortField = input<string | undefined>(undefined);
  readonly defaultSortDirection = input<SortDirection>('asc');

  readonly pageChange = output<PageRequest>();

  protected readonly rowTemplate = contentChild.required<TemplateRef<{ $implicit: TItem }>>('row');
  protected readonly value = computed(() => this.items() as TItem[]);
  protected readonly rowsPerPageOptions = ROWS_PER_PAGE_OPTIONS;
  protected readonly defaultSortOrder = computed(() =>
    this.defaultSortDirection() === 'desc' ? DESCENDING : ASCENDING,
  );

  protected onLazyLoad(event: TableLazyLoadEvent): void {
    this.pageChange.emit({
      first: event.first ?? 0,
      rows: event.rows ?? this.pageSize(),
      ...toSort(event),
    });
  }
}

function toSort(event: TableLazyLoadEvent): { sortField?: string; sortDirection?: SortDirection } {
  const sortField = Array.isArray(event.sortField) ? event.sortField[0] : event.sortField;
  if (typeof sortField !== 'string' || sortField.length === 0) {
    return {};
  }
  return { sortField, sortDirection: event.sortOrder === DESCENDING ? 'desc' : 'asc' };
}
