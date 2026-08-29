---
name: property-frontend
description: Build or repair the reusable property-site frontend. Use for HTML, CSS, JavaScript, accessibility, responsive layout, or booking behaviour changes.
---

# Property Frontend

Use this skill when the reusable experience changes rather than only one property's content.

## Inspect before editing

- Trace the affected path through `index.html`, `style.css`, `script.js`, and, for booking logic, `booking-logic.js` and its focused tests.
- Confirm whether `site-data.js` can solve the request first. Change shared engine files only when the capability benefits the reusable product.
- Preserve the static-site model: `index.html` loads translations, property configuration, booking logic, then the main script. The no-JavaScript fallback and static SEO block are part of that model.

## Build deliberately

- Keep property-specific values out of reusable files and keep shared UI strings in `translations.js` only when they are genuinely shared.
- Preserve the English/Thai interface and test the guest journey, including keyboard and narrow-screen states when relevant.
- Do not imply live channel availability or introduce a booking integration without a separately approved, verified implementation.
- Route metadata, tracking, and enquiry-path optimisation to `property-seo-conversion`; route release evidence to `property-quality-release`.

## Handoff

Use the applicable `AGENTS.md` quality gate. Report the changed shared behaviour, affected guest states, verification evidence, and any compatibility or rollback risk.
