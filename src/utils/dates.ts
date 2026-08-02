const PRESENT_MS = new Date(9999, 11, 31).getTime()

/**
 * Converts a date string to an epoch timestamp (ms). A missing value or the
 * literal `'Present'` sorts to the far future so open-ended entries always
 * appear first in date-sorted lists.
 */
export function parseDate(d: string | undefined | null): number {
  if (!d || d === 'Present') return PRESENT_MS
  return new Date(d).getTime()
}
