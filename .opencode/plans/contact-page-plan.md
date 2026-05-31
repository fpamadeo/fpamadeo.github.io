# Contact Page — Short-Term Plan

## Overview

Revisit `/contact` to finalize the email and decide on the UX approach (immediate `mailto:` redirect vs. static page with clickable link).

## To Do

- [ ] Replace placeholder email in `src/views/ContactPage.vue:17-19` with the real address
- [ ] Decide: auto-redirect to `mailto:` on mount, or keep as a static page with a clickable link?
- [ ] If auto-redirect: add a fallback message for users whose mail client doesn't open
- [ ] If static page: consider adding the contact link to the About page or elsewhere as a content link
