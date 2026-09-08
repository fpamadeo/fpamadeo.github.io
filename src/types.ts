export type Entry = {
  id: number
  Title: string
  subtitle?: string
  StartDate?: string
  EndDate?: string
  Description?: string
  media?: string
  tags?: string[]
  related?: number[]
  Bullets?: (string | { text?: string })[]
  Highlights?: (string | { text?: string })[]
  body?: string
}

export type WritingEntry = Entry & {
  isWip?: boolean
  Date?: string
  datePublished?: string
  summary?: string
  footnote?: string
}
