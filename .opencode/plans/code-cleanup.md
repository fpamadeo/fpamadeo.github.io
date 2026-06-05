# Code Cleanup — Clean Code Review

**Target date:** June 15, 2026
**Created:** May 31, 2026

---

## 👤 HUMAN TODO — Readability Review

*Walk through each file and ask: "Would another human (or an AI) find this easy to read?" Items need your judgment.*

- [ ] **Names audit** — Skim every `.vue`, `.ts`, `.py` file. Any name that doesn't immediately reveal intent? Rename it.
- [ ] **Comment scrub** — Delete comments that say what the code already says. Add comments only where the *why* isn't obvious.
- [ ] **Duplication judgment** — `parseDate()` in 3 files, `initials` computed in 2, CSS media blocks in 5+. Decide: extract into shared composable or leave as-is?
- [ ] **`writingAsExperiences`** — Is this name clear enough, or should it be `normalizedWritingEntries`?
- [ ] **`experience.json:125-126`** — EndDate (2017) is before StartDate (2019). Wrong or intentional?
- [ ] **Data quality** — `writing.json:1` has `[{}]` (empty object). Intentional?

---

## 🤖 AI-Actionable Items

*These can be automated or done without human judgment.*

- [ ] **Add `setQuery` to `SearchBar.vue`** — define and expose so the revert-on-failed-search feature works
- [ ] **Add `marked` to `package.json`** — explicit dependency
- [ ] **Fix `test_sync_writings.py`** — update tests to match integer-based `generate_uid()`
- [ ] **Replace `any` types (~50)** — proper typing in all Vue files
- [ ] **Set `eslint.config.js`** — `no-explicit-any` to `'warn'`
- [ ] **Fix `tsconfig.json`** — resolve `strict: true` vs `noImplicitAny: false` conflict
- [ ] **Clean up `fpamadeo.github.io/`** — nested git repo
- [ ] **Fix relative import** — `./SearchBar.vue` → `@/components/SearchBar.vue`
- [ ] **Reformat `vitest.config.js`** — un-minify to readable lines
- [ ] **Remove empty directory** — `opencode-sessions/.opencode/plans/`
- [ ] **Update CONSTITUTION.md** — stale references in Sections 2, 3, 10
- [ ] **Convert 4 test `.spec.js` files** → `.ts`
- [ ] **Refactor `sync_writings.py:main()`** — split 176-line function into phase functions
- [ ] **Extract `parseDate()`** — shared composable if decided in Human TODO

---

## Reference: Clean Code Principles Table

*Use as a checklist when reviewing each file.*

| Principle | What to check | Key files |
|-----------|---------------|-----------|
| Meaningful Names | Names reveal intent | All files |
| Small Functions | Single-responsibility, <20 lines | `sync_writings.py`, `HighlightComponent.vue`, `SidebarComponent.vue` |
| Comments | Explain "why", not "what" | `sync_writings.py`, Vue templates |
| Formatting | Consistent style | Root configs, Vue SFCs |
| Objects & Data | Encapsulation, no null returns | `SidebarComponent.vue` |
| Error Handling | Exceptions over return codes | `SearchBar.vue` |
| Boundaries | Clean third-party integration | `package.json`, `useMarkdown.ts` |
| DRY | No duplication | `parseDate()` in 3 files, CSS in 5+ |
| Tests | Clean, accurate tests | Test files |
