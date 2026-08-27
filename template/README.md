# Property template — clean seed

This folder is the **canonical clean starting point** for a new property site.
It contains the full frontend (engine + config + placeholder content) with
**no real property, customer, contact, analytics, booking or SEO data**, and
with booking and analytics disabled.

Property #1 lives at the repo root and Property #2 in `property-2/`. Neither is
a safe thing to copy from — both hold live customer data. **Always start a new
property from this folder.**

---

## What's in here

| File / folder | What it is | Touch when cloning? |
|---|---|---|
| `index.html` | Page structure. Property text is injected from `site-data.js`; the hardcoded text is only a no-JS fallback. | Only the two hardcoded image paths (see below) |
| `site-data.js` | **All property content and configuration.** | Yes — replace every value |
| `assets/images/*.png` | Placeholder photos, generated at the exact dimensions declared in `site-data.js`. | Yes — replace all |
| `favicon.ico`, `assets/images/favicon.png`, `apple-touch-icon.png` | Placeholder icons. | Yes — replace all |
| `style.css` | Layout + the brand palette / font variables (`:root` at the top). | Only if rebranding |
| `script.js`, `booking-logic.js`, `translations.js` | Shared engine and generic UI strings. | No |
| `scripts/validate-config.js` | Validates `site-data.js` against the schema + checks images exist. | No |
| `scripts/sync-seo.js` | Bakes static SEO tags into `index.html` and writes `sitemap.xml` from `site-data.js`. | No |
| `schema/property-config.schema.json` | The config contract. | No |
| `tests/` | `node --test` unit tests for the booking/date/price/text logic and the schema. | No |
| `robots.txt`, `sitemap.xml` | SEO hygiene. `sitemap.xml` fills in once `seo.siteUrl` is set and `sync-seo.js` is re-run. | `robots.txt`: add the `Sitemap:` line once the domain is known |

---

## Creating a new property

### 1. New repository (no history carry-over)

Create a **brand-new, empty git repo** for the property and copy the
**contents of this folder** into it as the repo root:

```bash
mkdir property-3 && cd property-3
git init
# copy the contents of template/ (not the folder itself) into here
```

Do **not** `git clone` this repo or a customer repo — that drags the whole
commit history (which contains other properties' IDs, endpoints and tokens)
into the new repo. If you use GitHub, the "template repository" feature does
the same thing cleanly (it starts the new repo with a single fresh commit).

### 2. Fill in `site-data.js`

Replace every `TODO:` value with the property's real data. Notes:

- Most text fields require **both `en` and `th`** non-empty. A few (alt text,
  `seo.title`/`seo.description`) allow an empty `th`. The schema is the source
  of truth — `node scripts/validate-config.js` will tell you exactly which.
- `booking.enabled` stays `false` until `currency`, `pricePerNight` and
  `formspreeEndpoint` are all real.
- `analytics.*`, `booking.formspreeEndpoint` and `seo.googleSiteVerification`
  **must each be newly created for this property** — never paste another
  property's value.

### 3. Replace the images

Drop the property's real photos into `assets/images/`, then:

- Update `heroImage`, `aboutImage.src` and every `gallery[].src` in
  `site-data.js` to the new filenames.
- Set each `gallery[].width` / `height` to the file's **true pixel size**.
- Replace `favicon.ico`, `assets/images/favicon.png` and `apple-touch-icon.png`.
- The placeholders are `.png`. If you use `.webp` (recommended for photos),
  also update the extension in the two hardcoded spots in `index.html`:
  the `<link rel="preload" ... href="assets/images/hero...">` and the
  `<link rel="icon" ... href="assets/images/favicon...">`.

### 4. Validate, sync, test

```bash
node scripts/validate-config.js     # must print VALID
node scripts/sync-seo.js            # bakes SEO tags into index.html + sitemap.xml
node --test                         # all tests green
```

Re-run `node scripts/sync-seo.js` after **any** later change to the `seo`
block, and before every deploy — it is not automatic.

### 5. Manual smoke test in a browser

Serve the folder (`python -m http.server 5173`) and check:

- Both languages render, no `TODO:` text left, no console errors, no config
  error banner.
- Gallery + lightbox work; the map points at the right place.
- If `booking.enabled` is `true`: run the full booking flow and confirm the
  request lands in **this property's** Formspree inbox, and that GA4 Realtime
  shows **this property's** measurement ID.

### 6. Domain

Once the real domain is known: set `seo.siteUrl` in `site-data.js`, re-run
`node scripts/sync-seo.js`, and add the `Sitemap:` line to `robots.txt`.

---

## Deploy

Static files — no build step. Deploy `index.html`, `style.css`, `script.js`,
`booking-logic.js`, `site-data.js`, `translations.js`, `assets/`, `robots.txt`
and `sitemap.xml` as-is. `scripts/`, `schema/` and `tests/` are dev-only and
do not need to be deployed.

---

## Notes

- `translations.js` holds shared, generic UI copy (button labels, nav, form
  messages). A few strings still say "villa" / "Thailand" (`heroEyebrow`,
  `galleryTitle`, `availableTitle`, `footerTemplate`). Adjust per property if
  it isn't a Thai villa.
- The repo root's `PROPERTY-CHECKLIST.md` has a much more detailed,
  field-by-field walkthrough of the same steps.
- Before going live, search the new repo for leftover `TODO:` markers and for
  any other property's name, IDs or endpoints — nothing from another property
  should appear anywhere.
