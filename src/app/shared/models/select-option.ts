export interface SelectOption<TValue> {
  readonly value: TValue;
  readonly label: string;
}

export function toSelectOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, string>,
): SelectOption<TValue>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}
