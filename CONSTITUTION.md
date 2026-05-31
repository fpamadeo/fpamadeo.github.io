# Francis's Portfolio - Project Constitution

## 1. Project Identity

**Name**: Francis's Portfolio
**Type**: Personal portfolio website
**Purpose**: A portfolio to showcase my work and background, while also having a space to share/curate my thoughts on my diverse set of interests.

**Goal**: Create a personal site that mirrors the simple outline of my resume while giving liberties to express my personality and interests.

---

## 2. Technology Stack

The project uses the following established stack:

- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build Tool**: Vite
- **Routing**: vue-router (hash history mode)
- **Markdown Rendering**: marked library
- **Testing**: Lighthouse CI

### Dependencies

```
vue@^3.4.0
vue-router@^4.3.0
marked@^12.0.0
vite@^5.0.0
@vitejs/plugin-vue@^5.0.0
@lhci/cli@^0.13.0
```

---

## 3. Architecture

```
src/
├── assets/styles/
│   └── global.css              # Global styles, CSS variables
├── components/                 # Reusable Vue components
│   ├── AppHeader.vue          # Navigation header
│   ├── AppFooter.vue          # Footer with links
│   ├── HighlightComponent.vue # Main content display
│   ├── RuleSeparator.vue      # Visual divider
│   ├── SearchBar.vue          # Search input
│   └── SidebarComponent.vue   # Searchable sidebar
├── composables/               # Composable functions
│   └── useMarkdown.js         # Markdown utilities
├── data/                      # Static JSON data files
│   ├── about.json
│   ├── defaultHighlights.json
│   ├── education.json
│   ├── experience.json
│   └── writing.json
├── router/
│   └── index.js               # Route definitions
├── views/                     # Page components
│   ├── WorkPage.vue           # Experience & work showcase
│   ├── AboutPage.vue          # Personality and self
│   └── OtherPage.vue          # Blog/thoughts curation
├── App.vue                    # Root component
└── main.js                    # Entry point
```

---

## 4. Routes Structure

| Route | Page | Purpose |
|-------|------|---------|
| `/` | WorkPage | Showcase work as a software engineer |
| `/about` | AboutPage | Showcase personality and self |
| `/other` | OtherPage | Curated showcase of thoughts |

**Design Principle**: All three routes should have a similar layout and design that mirrors the simple outline of a resume, with creative liberties taken to express personality.

---

## 5. Data Structure

### 5.1 experience.json
Professional experience entries containing:
- Company/Organization name
- Role/Title
- Date range
- Highlights (array of accomplishments with tags)

### 5.2 education.json
Education entries containing:
- Institution name
- Degree/Certification
- Date range
- Relevant details

### 5.3 writing.json
Blog/thought entries containing:
- Title
- Date published
- Content (markdown supported)
- Tags for categorization

### 5.4 about.json
Personal information containing:
- Bio/Introduction
- Profile details
- Favorites (books, tools, etc.)
- Personality traits/interests

### 5.5 defaultHighlights.json
Default highlighted content for sidebar display on the main page.

---

## 6. Code Style & Conventions

### 6.1 General Principles

- **Single Responsibility**: Keep functions and classes small with one clear purpose
- **Code Integrity**: Maintain strong cohesion within modules
- **Minimal Comments**: Write self-documenting code; add comments only when necessary for clarity
- **Clean & Concise**: Avoid unnecessary complexity

### 6.2 Vue Component Guidelines

- Use `<script setup>` syntax for all new components
- Props should be explicitly typed
- Emit events clearly with type definitions
- Keep components focused and reusable

### 6.3 Naming Conventions

- Vue files: PascalCase (`AppHeader.vue`)
- Component usage in templates: kebab-case (`<app-header>`)
- JSON data files: camelCase (`experience.json`)
- CSS classes: kebab-case

### 6.4 File Organization

- Components go in `src/components/`
- Pages/views go in `src/views/`
- Data files go in `src/data/`
- Composables go in `src/composables/`

---

## 7. Development Workflow

### 7.1 Available Scripts

```sh
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Production build
npm run preview    # Preview production build
npm run lhci       # Run Lighthouse CI audits
```

### 7.2 Future Scripts (To Be Added)

The following scripts should be added to improve code quality:

- **Linting**: ESLint or similar for code quality
- **Type Checking**: TypeScript or Vue type checking
- **Unit Testing**: Vitest or Vue Test Utils

### 7.3 Development Process

1. Make changes to code or data files
2. Create or update unit tests for any new or modified functionality
3. Run tests and ensure all pass before proceeding
4. Test with `npm run dev`
5. Verify with `npm run build`
6. Run Lighthouse audits with `npm run lhci`
7. Review and iterate

### 7.4 Testing Requirement

**Rule**: For every function, component, or composable created or modified, unit tests must be created or updated to ensure the functionality works correctly before pushing to the repository.

- **Coverage**: Tests should cover core functionality, edge cases, and expected behavior
- **Full Layout Coverage**: All tests must account for both desktop and mobile layouts. This includes:
  - Testing responsive behavior at key breakpoints
  - Verifying touch interactions work on mobile
  - Ensuring no functionality breaks between layouts
- **Framework**: Use Vitest or Vue Test Utils (to be added as a dependency)
- **Location**: Test files should be placed alongside the code they test (e.g., `ComponentName.spec.js`)
- **CI Enforcement**: All tests must pass in the local environment before commit
- **Scope**: This applies to:
  - New Vue components
  - New composable functions
  - Modified existing functions or components
  - Any new utility functions

---

## 8. Component Contracts

### SidebarComponent
- **Purpose**: Searchable sidebar for filtering entries
- **Props**: `title`, `items`, `searchable`
- **Emits**: `select` when an item is chosen
- **Features**: Search filtering, item selection, tag-based highlighting

### HighlightComponent
- **Purpose**: Display main content area
- **Props**: `title`, `items`
- **Features**: Render highlighted/selected content

### SearchBar
- **Purpose**: Text search input
- **Props**: `placeholder`
- **Emits**: `search` with input value
- **Features**: Real-time search filtering

### AppHeader
- **Purpose**: Navigation header
- **Features**: Links to Work, About, Other pages

### AppFooter
- **Purpose**: Site footer
- **Features**: Social links, copyright

---

## 9. Design Principles

- **Similar Layout**: Work, About, and Other pages share a common layout structure
- **Resume-inspired**: Design echoes the simple outline of a traditional resume
- **Personal Liberties**: Allow creative expression within the structural framework
- **Responsive**: Ensure mobile-friendly experience across all pages
- **Minimal**: Keep the design clean and uncluttered
- **Lazy Loading**: Implement lazy loading for images and route components to improve initial load performance

---

## 9B. Mobile Vision

The mobile version of the site is a core part of the design, not an afterthought. Every feature must be implemented with both desktop and mobile layouts in mind.

### 9B.1 Layout Structure

- **Single Column**: Mobile uses a stacked, single-column layout
- **Header**: Visually the same as desktop, but route navigation is moved into a right-aligned hamburger menu in the header (replaces the desktop nav below the name)
- **Highlights Component**: Displayed below the header as a sized-down, scrollable version of the desktop layout
- **Sidebar Component**: Moves below highlights, functioning as a vertical navigation menu for highlights
- **Collapse Toggle**: A button between the Highlights and Sidebar components allows the sidebar to collapse/expand on mobile
- **Footer**: Remains at the bottom of the page

### 9B.2 Accessibility & Sizing

- All text and media must be resized according to mobile accessibility standards
- Touch targets must meet minimum size requirements (44x44px recommended)
- Font sizes adjusted for readability on smaller screens
- Images optimized for mobile bandwidth and display

### 9B.3 Mobile-First Testing

- All unit tests must include test cases for both desktop and mobile layouts
- Test responsive behavior at key breakpoints
- Verify that all interactions work on touch devices
- Ensure no functionality is broken when switching between layouts

---

## 10. Future Vision & Roadmap

### Short-term Goals
- Add TypeScript support for better type safety
- Implement dark mode toggle
- Add linting and type checking scripts
- Revisit contact page — finalize real email address in `src/views/ContactPage.vue:17-19` and decide on UX approach (auto `mailto:` redirect vs. static page)

### Medium-term Goals
- Improve SEO with sitemap.xml and Open Graph meta tags
- Add PWA manifest for offline capability
- Enhance accessibility (skip links, focus management)

### Long-term Goals
- Expand the "Other" section into a full blog system
- Add a reading list or bookmarks section
- Implement more sophisticated content categorization

---

## 11. Contributing & Maintenance

### Code Review Requirement

**Rule**: Every code change must be reviewed before applying changes to the codebase.

- **Process**: Present the proposed changes to the user for review before implementation
- **Scope**: This applies to all code modifications including:
  - New components, composables, or utility functions
  - Changes to existing functionality
  - Data structure changes
  - Route modifications
  - Style or design changes
  - **New technologies** proposed to be added to the tech stack
- **New Technology Highlight**: Any proposed change that introduces new dependencies, libraries, frameworks, or tools to the project **must be explicitly highlighted** during review, regardless of whether a review is otherwise requested. This includes but is not limited to:
  - New npm packages or dependencies
  - New build tools or bundlers
  - New CSS frameworks or preprocessors
  - New testing libraries
  - New routing solutions
- **Exception (Code Changes Only)**: If the initial command explicitly states that review is not required (e.g., "just do it", "no review needed"), you may proceed with code changes without requesting review
- **No Circumvention for New Tech**: The "no review needed" exception **cannot bypass** the new technology highlight requirement. Even with "no review needed" prompts, new technologies must always be flagged for the user's awareness
- **No Circumvention**: Do not ask to bypass or circumvent this review requirement under any circumstances

### General Guidelines

- All content changes go through JSON files in `src/data/`
- UI changes go in `src/components/` and `src/views/`
- Route changes are made in `src/router/index.js`
- Always run `npm run dev` to test changes locally before deployment

---

## 12. Session Documentation

### Session Summary Requirement

**Rule**: When the user indicates the session is complete (e.g., "done for today", "finished", "that's all", "stop", "end session", or any similar phrase indicating completion), a session summary must be created automatically.

**Trigger Phrases**:
- "done for today"
- "done"
- "finished"
- "that's all"
- "stop"
- "end session"
- "wrap up"
- "call it a day"
- Any phrase indicating session completion

**Required Actions**:
1. Create a markdown file in `opencode-sessions/` folder
2. Filename format: `session-YYYY-MM-DD.md`
3. Include:
   - Overview of changes made
   - List of new/modified files
   - Test results (pass/fail counts)
   - Build status
   - Any pending items or next steps
4. Add the `opencode-sessions/` folder to `.gitignore` (already configured)
5. Present the summary to the user before ending

**No Circumvention**: Do not skip creating the summary even if the session was short or had minimal changes. Every session that makes changes should be documented.

---

## 13. Deployment

- Build output: `npm run build` generates `dist/` directory
- Platform: GitHub Pages (fpamadeo.github.io)
- Deploy by pushing the `dist/` folder to the main branch

---

*Last Updated: May 2026*
*Version: 1.0*