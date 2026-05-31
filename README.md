# fpamadeo.github.io

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

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

| Test Case                                 | Expected Output                              |
| ----------------------------------------- | -------------------------------------------- |
| renders search input and button           | Input and button elements exist              |
| emits search event on button click        | `search` event emitted with input value      |
| emits search event on Enter key           | `search` event emitted with trimmed value    |
| trims whitespace from search query        | Search query has no leading/trailing spaces  |
| clears input via exposed clear method     | Query reset to empty string, event emitted   |
| has correct ARIA attributes               | Proper role="search", aria-label on elements |
| search bar visible on mobile viewport     | Element renders correctly at 375px width     |
| input functional on touch devices         | Input value updates on mobile                |
| button tappable on mobile                 | Click triggers search event                  |
| enter key works on mobile keyboard        | Keyboard submission works                    |
| opens Rick Astley video for "rick"        | Window opens YouTube link                    |
| opens Rick Astley video for "Rick Astley" | Window opens YouTube link                    |
| does not trigger for non-rick queries     | Normal search event emitted                  |

#### SidebarComponent.spec.js (15 tests)

| Test Case                                    | Expected Output                        |
| -------------------------------------------- | -------------------------------------- |
| renders sidebar with sections                | Sidebar and section labels render      |
| renders search bar when showSearch is true   | Search bar element exists              |
| hides search bar when showSearch is false    | Search bar element hidden              |
| displays summary section when provided       | Summary element renders                |
| displays entries in sections                 | Entry elements render                  |
| emits select event when entry is clicked     | `select` event emitted with entry data |
| emits deselect event when summary is clicked | `deselect` event emitted               |
| emits search event when search input changes | `search` event emitted                 |
| sidebar renders on mobile viewport           | Sidebar renders at 375px width         |
| sidebar is full width on mobile              | Correct CSS classes applied            |
| entries visible on mobile                    | Entry elements present                 |
| search functionality works on mobile         | Search works on mobile                 |
| handles empty sections                       | No entries render                      |
| handles entries without tags                 | No 'is-related' class on entries       |
| handles markdown in summary                  | Summary text renders                   |

#### HighlightComponent.spec.js (16 tests)

| Test Case                                              | Expected Output                         |
| ------------------------------------------------------ | --------------------------------------- |
| renders highlight section                              | Main highlight element exists           |
| displays highlights section                            | "HIGHLIGHTS" heading visible            |
| displays bullets section                               | "BULLETS" heading visible               |
| renders list items for highlights                      | 4 list items (2 highlights + 2 bullets) |
| displays related entries count                         | Relations element with count "2"        |
| shows media when provided                              | Image element renders with media prop   |
| handles selected entry                                 | Sections render for selected entry      |
| renders search highlighting                            | Mark tags wrap matching text            |
| renders on mobile viewport                             | Component renders at 375px width        |
| highlight component has correct classes on mobile      | 'highlight' class present               |
| related entries display on mobile                      | Relations element visible               |
| renders markdown in highlights                         | Strong tags in rendered output          |
| handles entry with Content field                       | Content body renders, sections hidden   |
| handles WORK IN PROGRESS content                       | WIP styling applied, label visible      |
| emits tag-click with UID when item with tag is clicked | `tag-click` event with tagUID value     |
| prinny overlay element exists in component template    | Element not visible by default          |

#### useMarkdown.spec.js (31 tests)

| Test Case                                        | Expected Output               |
| ------------------------------------------------ | ----------------------------- |
| returns empty string for empty input (block)     | Empty string returned         |
| parses bold text                                 | Strong tags in output         |
| parses italic text                               | Em tags in output             |
| parses inline code                               | Code tags in output           |
| parses links                                     | Anchor tags with href         |
| parses lists                                     | UL/LI elements                |
| parses paragraphs with line breaks               | P tags present                |
| handles GFM tables                               | Table element in output       |
| converts single newlines to br tags              | BR tags in output             |
| highlights matching text                         | Mark tags wrap match          |
| is case insensitive                              | Case-insensitive highlighting |
| does not corrupt HTML tags                       | Tags preserved, mark applied  |
| returns original when query is empty             | No mark tags added            |
| returns empty string for empty input (inline)    | Empty string returned         |
| parses bold without p wrapper                    | Strong without P              |
| parses italic without p wrapper                  | Em without P                  |
| parses code without p wrapper                    | Code without P                |
| parses links inline                              | Anchor without P              |
| does not wrap in paragraph tags                  | No P tags for inline          |
| highlights matching text inline                  | Mark tags in inline output    |
| is case insensitive (inline)                     | Case-insensitive match        |
| does not corrupt existing HTML (inline)          | Tags preserved                |
| same output for both layouts                     | Identical HTML                |
| search highlighting works regardless of viewport | Mark tags work                |
| handles unicode text                             | Unicode preserved             |
| handles special characters in search             | Special chars highlighted     |
| handles regex special chars in search            | Regex chars highlighted       |
| handles empty search query                       | Original output unchanged     |
| handles whitespace-only input                    | Trimmed/empty result          |
| handles numbers as input                         | Numbers rendered              |

## Data Format — Entry Fields

Each entry in `src/data/*.json` supports these optional fields beyond the required `UID`, `Company`, `Title`, etc.

| Field      | Type     | Default   | Description                                                                             |
| ---------- | -------- | --------- | --------------------------------------------------------------------------------------- |
| `media`    | `string` | —         | Path to an image displayed in the highlight section                                     |
| `mediaFit` | `string` | `"cover"` | CSS `object-fit` value for the media image. Controls how the image fills its container. |

### `mediaFit` Examples

| Value            | Behavior                                                                               | Use Case                                                        |
| ---------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `"cover"`        | Image fills the container, cropping excess. Default.                                   | Wide/landscape photos that should span full width               |
| `"contain"`      | Image scales to fit entirely within the container, letterboxed if aspect ratio differs | Tall/portrait images, group photos that should be fully visible |
| `"fill"`         | Image stretches to fill, ignoring aspect ratio                                         | Banners or background textures                                  |
| `"none"`         | Image displays at its natural size, ignoring container dimensions                      | Small icons or thumbnails                                       |
| `"scale-down"`   | Like `none` but scales down if the image is larger than the container                  | Large images that should never be upscaled                      |
| `"as-is"`        | Image at native resolution, no scaling — all constraints removed                       | Full-resolution screenshots, pixel-perfect assets               |
| `"force-height"` | Width fills the container; height shows the full original (no crop)                    | Tall infographics, vertical photos that must be fully visible   |
| `"force-width"`  | Height capped at 260px; width shows the full original (no crop)                        | Wide panoramas, horizontal banners at full width                |

```json
// Example: tall portrait image, fits vertically
{
  "media": "assets/images/portrait.jpg",
  "mediaFit": "contain"
}

// Example: wide landscape, cropped to fill (default)
{
  "media": "assets/images/banner.png"
}

// Example: small icon, natural size
{
  "media": "assets/images/icon.svg",
  "mediaFit": "none"
}
```

## Features

- **Search**: Filter entries by keyword in sidebar
- **Linked Entries**: Click on tags in content to highlight related entries in sidebar
- **Responsive**: Adapts layout for mobile devices
- **Markdown Support**: Render markdown in content and bios
- **Lazy Loading**: Route-based code splitting + image lazy loading for performance
- **Dark Theme**: N/A (light theme only currently)
- **Accessibility**: Basic ARIA labels and keyboard navigation

## Pages

| Route      | Description                                                           |
| ---------- | --------------------------------------------------------------------- |
| `/`        | Experience & Education                                                |
| `/about`   | Bio, profile, and favorites                                           |
| `/other`   | Writing and articles                                                  |
| `/contact` | Contact info — email address set in `src/views/ContactPage.vue:17-19` |
| `/*`       | 404 Not Found                                                         |

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
