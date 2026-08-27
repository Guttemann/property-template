# Deployment & go-live runbook

Taking one finished property site from the clean template to a live, HTTPS
deployment on the client's domain. Static HTML/CSS/JS, no build step, no
backend. This file is the single authoritative deployment process — anything
else (`PROPERTY-CHECKLIST.md`, `template/README.md`) defers to it for the
order of operations.

## Model

- **One property = one private Git repository**, created fresh from the
  `template/` seed. Never `git clone` — history carries other properties' IDs,
  endpoints and tokens.
- **Netlify** is the hosting/deploy platform. Publish directory = repo root,
  no build command. `template/netlify.toml` sets this, so it lands in every
  new property repo automatically.
- **Netlify preview deploys** (every branch and PR gets its own URL) replace a
  separate staging environment. `main` = production.

## Prerequisites

Per property, before you start:

- Node.js (repo is on v24; v20+ is fine) and npm — for the pre-deploy checks
  only. Nothing runs on Netlify.
- Network access to the npm registry (for `npx ajv-cli@5.0.0` inside
  `scripts/validate-config.js`).
- A Netlify account with permission to create sites.
- The property's **own**, freshly created: Formspree form, GA4 property,
  Microsoft Clarity project, and — at domain time — Google Search Console
  verification token. Never reuse another property's.
- The client's content collected — see `PROPERTY-INTAKE-BRIEF.md`.

---

## Step 1 — Create the property repository

1. Create a new **empty, private** repository, e.g. `property-celine-cha-am`.
2. Copy the **contents of `template/`** (not the folder itself) into it. Do
   **not** `git clone` this repo or any customer repo.
3. `git init`, one initial commit, push.

`netlify.toml` is part of the seed and lands in the new repo automatically.

*A dedicated `property-seed` GitHub template repository (so "Use this
template" does the clean copy) is planned but not set up yet — until then,
copy `template/` contents by hand.*

---

## Step 2 — Configure the property

Work through **`PROPERTY-CHECKLIST.md`** section by section: identity/branding,
text, images, location/map, contact, booking/pricing, analytics, SEO,
languages. Those steps are not repeated here.

Two points that matter for deployment:

- `seo.siteUrl` stays empty until Step 6 (the real domain). Expected —
  `sitemap.xml` is a valid empty `<urlset>` until then.
- `booking.enabled` stays `false` until `currency`, `pricePerNight` and
  `booking.formspreeEndpoint` are all real.

---

## Step 3 — Pre-deploy checks

Run all five from the **customer repo root**. All must pass before the repo is
connected to Netlify, and again before any later production deploy.

1. **Config validation**
   ```bash
   node scripts/validate-config.js
   ```
   Expect `VALID` and exit 0. Exit 1 = fix the field it names. **Exit 2 = not
   verified** (npm/network unavailable) — that is *not* a pass; resolve and
   rerun.

2. **SEO sync**
   ```bash
   node scripts/sync-seo.js
   ```
   Bakes `<title>` / description / canonical / Open Graph / Twitter /
   verification tags into `index.html` (between the `SEO:START` / `SEO:END`
   markers) and rewrites `sitemap.xml`, both from the `seo` block in
   `site-data.js`. Then commit the result **if it changed anything**:
   ```bash
   git add index.html sitemap.xml && git commit -m "Sync SEO tags"
   ```
   Re-run after every later change to the `seo` block. It is never a Netlify
   build step — see [How SEO sync fits deployment](#how-seo-sync-fits-deployment).

3. **Tests**
   ```bash
   node --test
   ```
   All green. Run from the repo root; a real one-property repo has no nested
   `tests/` directories.

4. **Browser smoke test**
   ```bash
   python -m http.server 5173     # then open http://localhost:5173
   ```
   - Both languages render; no `TODO:` text anywhere; no console errors; no
     config-error banner.
   - Gallery + lightbox work; correct image count; map shows the right address.
   - Every contact / social link points at this property.
   - If `booking.enabled` is `true`: run the whole booking flow and confirm the
     request lands in **this property's** Formspree inbox, and GA4 Realtime
     shows **this property's** measurement ID.

5. **Leftover-content scan**
   ```bash
   grep -rn "TODO:" .
   ```
   Zero hits. Then eyeball for any other property's name, phone, Facebook URL,
   GA4 / Clarity ID or Formspree endpoint — nothing from another property may
   appear.

---

## Step 4 — Connect to Netlify

1. Netlify → **Add new site → Import an existing project** → connect the Git
   provider and pick the property repo.
2. Netlify reads `netlify.toml`: **build command empty**, **publish directory =
   repo root**. Leave both as shown. Deploy.
3. Rename the site: **Site configuration → Change site name** → e.g.
   `celine-pool-villa` → review URL becomes
   `https://celine-pool-villa.netlify.app`.
4. From here: every push to `main` deploys to that URL; every other branch and
   every PR gets its own preview URL automatically.

No staging site. Content changes go on a branch → review that branch's preview
URL → merge to `main` to release.

---

## Step 5 — Client review

Send the client the `*.netlify.app` URL. Iterate via branches until approved.
The Netlify URL is review-only; once the domain is live the canonical tag
points at the real domain, so the Netlify URL drops out of search results on
its own — nothing to configure.

---

## Step 6 — Domain and go-live

### Connect the domain

Registrar is the client's choice — not locked in. Two ways to wire DNS:

- **A — client keeps their DNS provider.** Netlify → Domain management → add
  the custom domain → Netlify shows the exact records to add at the registrar
  (a `CNAME` for `www`, and for the apex either an `ALIAS`/`ANAME` or Netlify's
  load-balancer IP).
- **B — client delegates DNS to Netlify.** Point the domain's nameservers at
  Netlify DNS; apex + `www` are then handled for you.

Make the **apex** (`example.com`) the canonical host and let `www` redirect to
it (automatic once the apex is the primary domain in Netlify). HTTPS: Netlify
provisions and renews a Let's Encrypt certificate automatically once the
domain verifies — wait for it, then confirm the padlock.

*Exact Netlify dashboard steps get confirmed and pinned here during the first
real go-live.*

### Point the site at the domain

1. Set `seo.siteUrl` in `site-data.js` to the canonical URL (e.g.
   `https://example.com`, no trailing slash).
2. Set a fresh, domain-specific `seo.googleSiteVerification` token from Google
   Search Console.
3. `node scripts/sync-seo.js` — now fills in the canonical tag and the real
   `sitemap.xml` entry.
4. Add `Sitemap: https://example.com/sitemap.xml` to `robots.txt` (manual
   one-line edit — the script does not touch `robots.txt`).
5. Commit, push to `main`, let Netlify deploy.
6. In Search Console: verify the domain, submit the sitemap.

### Go-live checklist

Tick through this on the live domain.

**Content / data**
- [ ] Name, location, address, bed/bath/guests correct on **both** EN and TH
- [ ] No `TODO:` text anywhere (view source, scroll both languages)
- [ ] No other property's name, photos, phone, Facebook link or IDs present
- [ ] Map pin on the actual property; "Open in Google Maps" link correct
- [ ] `tel:` link works on a real phone; every contact / social link is right

**Booking enquiry (if enabled)**
- [ ] `booking.formspreeEndpoint` is **this** property's own form
- [ ] Real test enquiry submitted → arrives in the correct inbox within minutes
- [ ] Received email: reply-to = guest's address; subject names the property
- [ ] Honeypot: submit with the hidden `company` field filled → silent
      success, **no** email
- [ ] Decided whether `booking.contact.email` may appear in the public
      `site-data.js`, or is left blank so delivery relies on the Formspree
      form's own notification address

**Domain / HTTPS**
- [ ] `https://` loads on apex **and** `www`; one 301-redirects to the other
- [ ] Padlock shown; no mixed-content warnings in the console
- [ ] `http://` redirects to `https://`

**SEO / metadata**
- [ ] `seo.siteUrl` matches the live canonical exactly; `sync-seo.js` re-run
      after the last edit
- [ ] View source: `<title>`, description, canonical, OG / Twitter all show
      this property, with absolute URLs
- [ ] `/robots.txt` reachable and has the `Sitemap:` line with the real domain
- [ ] `/sitemap.xml` reachable, well-formed, lists the real homepage URL
- [ ] `og:image` is an absolute URL that loads

**Mobile / browser**
- [ ] Real iOS Safari + Android Chrome: layout, hamburger nav, gallery /
      lightbox, booking calendar all work
- [ ] Desktop: current Chrome + one of Firefox / Safari / Edge
- [ ] No console errors, no config-error banner on load

**Analytics (if enabled)**
- [ ] GA4 Realtime shows your test hit under **this** property's measurement ID
- [ ] Clarity records the session under **this** property's project
- [ ] If disabled: both IDs are `""` and no gtag / clarity requests fire

**Social share preview**
- [ ] Live URL through the Facebook Sharing Debugger (and LINE / WhatsApp if
      the client uses them) → correct title, description, image; re-scrape if
      stale

---

## How SEO sync fits deployment

`scripts/sync-seo.js` is a **local, manual, pre-commit** step. Its outputs —
the SEO block in `index.html` and `sitemap.xml` — are **committed files**,
reviewed in the diff like any other change. Netlify just serves them.

It is deliberately **not** a Netlify build step: that would add a build
runtime, make the deployed `index.html` differ from the committed one, and
turn a "serve static files" deploy into something with moving parts. In
practice the script runs about twice in a property's life — once at initial
build (Step 3), once at domain time (Step 6) — so "remember to run it" is a
checklist item, not a burden. A forgotten run surfaces as a wrong `<title>` /
OG tags, which the go-live "view source" check catches.

---

## What this setup deliberately does not include

Not needed for a safe, repeatable first deployment. Revisit only with a
concrete reason:

- **No CI / GitHub Actions.** The pre-deploy checks are run by hand from
  Step 3. Automate only once the manual process has proven itself on real
  properties.
- **No separate staging environment.** Netlify preview URLs cover client
  review and safe pre-release checks.
- **No custom redirects / `_headers` / cache rules.** Single static page;
  Netlify's defaults are correct.
- **No `.netlifyignore`.** `scripts/`, `schema/` and `tests/` being fetchable
  is harmless — they hold nothing the public `site-data.js` / `index.html`
  don't already expose.
- **No consent / cookie banner.** Acceptable for a Thailand property; required
  before any property marketed to EU / UK visitors with analytics enabled.
