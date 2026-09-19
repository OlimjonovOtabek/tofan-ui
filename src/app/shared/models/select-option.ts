export interface SelectOption<TValue, TLabel extends string = string> {
  readonly value: TValue;
  readonly label: TLabel;
}

export function toSelectOptions<TValue extends string, TLabel extends string>(
  values: readonly TValue[],
  labels: Record<TValue, TLabel>,
): SelectOption<TValue, TLabel>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}
