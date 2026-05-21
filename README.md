# fpamadeo.github.io

Personal portfolio website built with Vue 3 and Vite.

## Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Routing**: vue-router (hash history)
- **Markdown**: marked
- **Testing**: Vitest + Vue Test Utils + Lighthouse CI

## Project Structure

```
src/
├── assets/
│   └── styles/global.css      # Global styles and CSS variables
├── components/
│   ├── AppHeader.vue           # Site header with navigation
│   ├── AppFooter.vue           # Site footer with links
│   ├── HighlightComponent.vue  # Main content display
│   ├── RuleSeparator.vue       # Visual divider component
│   ├── SearchBar.vue          # Search input component
│   └── SidebarComponent.vue    # Sidebar with searchable entries
├── composables/
│   └── useMarkdown.js          # Markdown rendering utilities
├── data/                       # JSON data files
│   ├── about.json
│   ├── defaultHighlights.json
│   ├── education.json
│   ├── experience.json
│   └── writing.json
├── router/
│   └── index.js                # Route definitions
├── views/
│   ├── AboutPage.vue           # About page
│   ├── ExperiencePage.vue      # Experience page
│   └── OtherPage.vue           # Writing/Other page
├── App.vue                     # Root component
└── main.js                     # Entry point
```

## Getting Started

```sh
npm install
```

### Development

```sh
npm run dev
```

### Build for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

### Lighthouse CI

```sh
npm run lhci
```

### Unit Testing

```sh
npm run test        # Run tests in watch mode
npm run test:run    # Run tests once (CI mode)
```

Tests are located in `src/components/__tests__/` and `src/composables/__tests__/`.

#### SearchBar.spec.js (13 tests)

| Test Case | Expected Output |
|-----------|----------------|
| renders search input and button | Input and button elements exist |
| emits search event on button click | `search` event emitted with input value |
| emits search event on Enter key | `search` event emitted with trimmed value |
| trims whitespace from search query | Search query has no leading/trailing spaces |
| clears input via exposed clear method | Query reset to empty string, event emitted |
| has correct ARIA attributes | Proper role="search", aria-label on elements |
| search bar visible on mobile viewport | Element renders correctly at 375px width |
| input functional on touch devices | Input value updates on mobile |
| button tappable on mobile | Click triggers search event |
| enter key works on mobile keyboard | Keyboard submission works |
| opens Rick Astley video for "rick" | Window opens YouTube link |
| opens Rick Astley video for "Rick Astley" | Window opens YouTube link |
| does not trigger for non-rick queries | Normal search event emitted |

#### SidebarComponent.spec.js (15 tests)

| Test Case | Expected Output |
|-----------|----------------|
| renders sidebar with sections | Sidebar and section labels render |
| renders search bar when showSearch is true | Search bar element exists |
| hides search bar when showSearch is false | Search bar element hidden |
| displays summary section when provided | Summary element renders |
| displays entries in sections | Entry elements render |
| emits select event when entry is clicked | `select` event emitted with entry data |
| emits deselect event when summary is clicked | `deselect` event emitted |
| emits search event when search input changes | `search` event emitted |
| sidebar renders on mobile viewport | Sidebar renders at 375px width |
| sidebar is full width on mobile | Correct CSS classes applied |
| entries visible on mobile | Entry elements present |
| search functionality works on mobile | Search works on mobile |
| handles empty sections | No entries render |
| handles entries without tags | No 'is-related' class on entries |
| handles markdown in summary | Summary text renders |

#### HighlightComponent.spec.js (16 tests)

| Test Case | Expected Output |
|-----------|----------------|
| renders highlight section | Main highlight element exists |
| displays highlights section | "HIGHLIGHTS" heading visible |
| displays bullets section | "BULLETS" heading visible |
| renders list items for highlights | 4 list items (2 highlights + 2 bullets) |
| displays related entries count | Relations element with count "2" |
| shows media when provided | Image element renders with media prop |
| handles selected entry | Sections render for selected entry |
| renders search highlighting | Mark tags wrap matching text |
| renders on mobile viewport | Component renders at 375px width |
| highlight component has correct classes on mobile | 'highlight' class present |
| related entries display on mobile | Relations element visible |
| renders markdown in highlights | Strong tags in rendered output |
| handles entry with Content field | Content body renders, sections hidden |
| handles WORK IN PROGRESS content | WIP styling applied, label visible |
| emits tag-click with UID when item with tag is clicked | `tag-click` event with tagUID value |
| prinny overlay element exists in component template | Element not visible by default |

#### useMarkdown.spec.js (31 tests)

| Test Case | Expected Output |
|-----------|----------------|
| returns empty string for empty input (block) | Empty string returned |
| parses bold text | Strong tags in output |
| parses italic text | Em tags in output |
| parses inline code | Code tags in output |
| parses links | Anchor tags with href |
| parses lists | UL/LI elements |
| parses paragraphs with line breaks | P tags present |
| handles GFM tables | Table element in output |
| converts single newlines to br tags | BR tags in output |
| highlights matching text | Mark tags wrap match |
| is case insensitive | Case-insensitive highlighting |
| does not corrupt HTML tags | Tags preserved, mark applied |
| returns original when query is empty | No mark tags added |
| returns empty string for empty input (inline) | Empty string returned |
| parses bold without p wrapper | Strong without P |
| parses italic without p wrapper | Em without P |
| parses code without p wrapper | Code without P |
| parses links inline | Anchor without P |
| does not wrap in paragraph tags | No P tags for inline |
| highlights matching text inline | Mark tags in inline output |
| is case insensitive (inline) | Case-insensitive match |
| does not corrupt existing HTML (inline) | Tags preserved |
| same output for both layouts | Identical HTML |
| search highlighting works regardless of viewport | Mark tags work |
| handles unicode text | Unicode preserved |
| handles special characters in search | Special chars highlighted |
| handles regex special chars in search | Regex chars highlighted |
| handles empty search query | Original output unchanged |
| handles whitespace-only input | Trimmed/empty result |
| handles numbers as input | Numbers rendered |

## Features

- **Search**: Filter entries by keyword in sidebar
- **Linked Entries**: Click on tags in content to highlight related entries in sidebar
- **Responsive**: Adapts layout for mobile devices
- **Markdown Support**: Render markdown in content and bios
- **Lazy Loading**: Route-based code splitting + image lazy loading for performance
- **Dark Theme**: N/A (light theme only currently)
- **Accessibility**: Basic ARIA labels and keyboard navigation

## Pages

| Route | Description |
|-------|-------------|
| `/` | Experience & Education |
| `/about` | Bio, profile, and favorites |
| `/other` | Writing and articles |
| `/*` | 404 Not Found |

## Possible Improvements

- Add TypeScript
- Add dark mode support
- Add i18n support
- Add PWA manifest
- Add sitemap.xml for SEO
- Add Open Graph meta tags
- Improve accessibility (skip links, focus management)

## License

MIT