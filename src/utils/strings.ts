/** Builds a two-letter monogram from a full name, e.g. "Franz Paul" -> "FP". */
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join('')
}
