---
name: property-seo-conversion
description: Improve property-site discoverability and qualified enquiries. Use for SEO metadata, social previews, analytics, or changes to the booking and enquiry conversion path.
---

# Property SEO and Conversion

Use this skill for the path from discovery to a trustworthy enquiry, not for general page styling or release execution.

## Inspect before editing

- Read the relevant `site-data.js` SEO, analytics, contact, and booking fields with `scripts/sync-seo.js`, the generated SEO block in `index.html`, and `DEPLOYMENT.md`.
- Distinguish runtime changes from crawler-visible output: the SEO script generates static head tags and `sitemap.xml`; `robots.txt` remains a separate manual file.
- Compare the click-through promise, social preview, and measurement plan with the actual guest-facing content before proposing changes.

## Make focused decisions

- Keep metadata accurate, map/contact actions unambiguous, and analytics limited to property-owned identifiers and a clear guest value.
- Prefer the shortest suitable enquiry path; do not claim search performance, live availability, or measurement results without evidence.
- For property facts or media, use `property-content-configuration`. For a shared interaction or visual implementation, use `property-frontend`.

## Handoff

Use the SEO quality gate in `AGENTS.md`. Hand generated-file checks, preview evidence, and any live-domain or external-service step to `property-quality-release`.
