---
name: property-content-configuration
description: Create or update verified property content, imagery, and configuration in site-data.js. Use for property facts, English/Thai copy, media, maps, contact details, or booking values that do not change shared behaviour.
---

# Property Content and Configuration

Use this skill for a property's data, not for reusable frontend behaviour.

## Inspect before editing

- Read the relevant part of `PROPERTY-INTAKE-BRIEF.md`, `PROPERTY-CHECKLIST.md`, and `schema/property-config.schema.json` alongside the target `site-data.js`.
- Treat the root and `property-2/` configurations as confidential examples, never as values to copy into another property. New sites start from `template/`.
- Check how a field is rendered before promising it to the guest. `locationBody2` and `photosUrl` are documented as not currently rendered; `translations.js` is shared UI copy rather than normal property content.

## Work within the configuration contract

- Turn verified facts into guest-centred content; surface missing facts instead of inventing them.
- Keep the English/Thai fields and image metadata consistent with the schema. When imagery changes, consult the checklist for the related raw-HTML preload and icon references.
- Treat booking dates as manually maintained enquiry availability. Changing booking flow or shared pricing/calendar behaviour belongs in `property-frontend`.
- Route metadata, analytics, social previews, or enquiry-conversion changes to `property-seo-conversion`.

## Handoff

Apply the configuration quality gate in `AGENTS.md`. For a property launch, hand the evidence and any unresolved factual, map, or booking questions to `property-quality-release`.
