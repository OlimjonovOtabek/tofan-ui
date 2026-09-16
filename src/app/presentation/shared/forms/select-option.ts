/** One entry of an Optimus UI select; `label` is what the admin reads, `value` what we store. */
export interface SelectOption<TValue> {
  readonly value: TValue;
  readonly label: string;
}

/**
 * Pairs every value of a domain list with its Uzbek label.
 * The select takes a mutable array, so the options are handed over as one.
 */
export function toSelectOptions<TValue extends string>(
  values: readonly TValue[],
  labels: Record<TValue, string>,
): SelectOption<TValue>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}
