# Property Checklist — klone malen til en ny property

**Formål:** en punkt-for-punkt-liste for å ta denne malen fra **Property #1 (Celine Pool Villa Cha-Am)** til **Property #2**, uten å måtte huske noe fra hodet.

**Hvordan bruke listen:** gå gjennom seksjon 1–10 i rekkefølge og kryss av. Seksjon 11 er en samlet oversikt over alt som *ikke* kan løses ved å redigere `site-data.js` alene — les den før du starter, så du vet hva som venter.

**Viktig:** denne listen beskriver **hvordan repoet faktisk fungerer i dag** (verifisert direkte mot koden), ikke hvordan det burde fungere. Der noe burde vært config men ikke er det, står det tydelig merket **⚠️ Ikke config ennå**.

Referanse: full teknisk gjennomgang i [full-audit.md](.claude/full-audit.md).

---

## 0. Forutsetninger

- [ ] Node.js installert (kreves for `node scripts/sync-seo.js` — se seksjon 8)
- [ ] Python installert (valgfritt — kun for lokal forhåndsvisning via `.claude/launch.json`, `python -m http.server 5173`)
- [ ] Egen Formspree-konto/skjema for den nye propertyen (se seksjon 6 — **kritisk**, ikke valgfritt)
- [ ] Egen GA4-property og Microsoft Clarity-prosjekt for den nye propertyen (se seksjon 7)

---

## 1. Property identity / branding

| Felt | Hvor | Type | Hva du endrer |
|---|---|---|---|
| Navn, sted, hero-tittel | `site-data.js` (`name`, `location`, `heroTitle`) | Config | Rediger verdiene — brukes automatisk overalt (`data-property-name`, `-location`, `-hero-title`) |
| Fargepalett | `style.css:1–14` (`:root`) | **⚠️ Kode** | `--cream`, `--sand`, `--green`, `--green-light`, `--dark`, `--text`, `--muted`, `--white`, `--line` — hele visuelle identiteten til propertyen |
| Fonter | `style.css:12–13` (`--serif`, `--sans`) **og** `index.html:39–41` (Google Fonts `<link>`) | **⚠️ Kode, to steder** | Må endres begge steder samtidig — CSS-variabelen og selve font-importen. Malen bruker i dag Playfair Display + DM Sans. |
| Favicon (.ico) | `favicon.ico` (repo-rot) | Binærfil | Bytt fil, behold filnavnet `favicon.ico` — referert direkte i `index.html:30` |
| Apple touch icon | `apple-touch-icon.png` (repo-rot) | Binærfil | Bytt fil, behold filnavnet — referert i `index.html:32` |
| WebP-favicon | `assets/images/celine-pool-villa-favicon.webp` | **⚠️ Binærfil + kode** | Filnavnet har propertyens navn bakt inn. Du må enten (a) beholde nøyaktig samme filnavn og bare bytte innholdet, eller (b) gi den nytt filnavn **og** oppdatere `href` i `index.html:31` manuelt. Ingen config-kobling. |
| Google Search Console-verifisering | `index.html:7` (`<meta name="google-site-verification">`) | **⚠️ Kode, ikke config** | Denne tokenen er knyttet til ett spesifikt domene i Google Search Console. Den gamle propertyens token er ugyldig for det nye domenet — du må generere en **ny** verifiseringstag fra Search Console for det nye domenet og lime den inn her. Lett å glemme fordi den ligger begravd i `<head>`. |
| Tekst-logo (nav + footer) | `index.html:51`, `375` (fallback-tekst, styrt av `data-property-name`) | Config | Ingen bilde-logo finnes i malen — logoen er ren tekst hentet fra `config.name`. Trenger ikke røres i HTML. |

**Test:** last siden, sjekk fanetittel/favicon i nettleseren, sjekk at fargepaletten faktisk endret seg (ikke bare at CSS-filen ble lagret).

---

## 2. Text/content

Alt brødtekst-innhold under er **config**, i `site-data.js`, og appliseres automatisk via `data-property-*`-attributter i `renderStaticContent()` (`script.js:199–241`):

| Felt | site-data.js-linje | Går til |
|---|---|---|
| `heroDescription` | 7–10 | Hero-tekst under tittelen |
| `heroDetails` | 11–14 | "Private Pool · 5 Bedrooms · 15 Guests"-linjen |
| `aboutTitle` | 16–19 | About-seksjonens overskrift |
| `aboutBody`, `aboutBody2` | 20–27 | About-seksjonens to avsnitt |
| `facts[]` | 28–34 | Facts-grid (ikon + verdi + label per rad) |
| `amenities[]` | 45–56 | Amenities-grid |
| `locationBody` | 57–60 | Location-seksjonens tekst |
| `locationHighlights[]` | 67–72 | De fire "5 min / Beach"-boksene ved kartet |
| `footerCopy` | 109 | Footer-copyright |

**⚠️ Dødt felt — dokumentert, ikke fjernet:** `locationBody2` (`site-data.js:61–64`) blir lest av `script.js:222` (`[data-property-location-body-2]`), men **ingen element i `index.html` har dette attributtet**. Uansett hva du skriver her, vises det aldri. Enten legg til elementet i HTML (utenfor scope for denne batchen), eller la feltet stå tomt/ignorer det — det gjør ingen skade, det gjør bare ingenting.

**Statiske UI-strenger** (knappetekst, navigasjonslabels, feilmeldinger, disclaimers) ligger i `translations.js` (85 nøkler × 2 språk) og er **ikke property-spesifikke** — det er generisk UI-tekst som gjelder for alle properties. Rør denne filen kun hvis selve *ordlyden* i grensesnittet skal endres for alle fremtidige properties, ikke som del av en normal property-klone.

**Test:** bla gjennom hele siden på begge språk, sjekk at ingen tekst mangler eller viser placeholder-tekst fra Property #1.

---

## 3. Images/assets

| Element | Hvor | Type | Merknad |
|---|---|---|---|
| Hero-bilde | `site-data.js:15` (`heroImage`) | Config | Styrer `<img data-property-hero-image>` (`index.html:77`) automatisk |
| Galleri (8 bilder) | `site-data.js:35–44` (`gallery[]`: `src`, `alt`, `span`, `width`, `height`) | Config | `renderGallery()` bruker disse feltene direkte — inkl. `width`/`height` for CLS-forebygging, så disse må stemme med de faktiske filenes pikseldimensjoner |
| **About-seksjonens bilde** | `index.html:147–150` | **⚠️ Ikke config i det hele tatt** | `villa-main.webp` og `alt="Villa exterior"` er skrevet direkte i HTML — ingen `data-property-*`-attributt, ingen config-felt. For å bytte dette bildet må du enten (a) beholde eksakt filnavnet `villa-main.webp` og kun bytte innholdet, eller (b) redigere `index.html` manuelt (både `src` og `alt`). Dette er det eneste bildet på siden som fungerer slik — alle andre er config-drevet. |
| Hero preload-lenke | `index.html:34` (`<link rel="preload" as="image" href="assets/images/hero.webp">`) | **⚠️ Ikke synkronisert med config** | Denne må matche `config.heroImage` manuelt. Endrer du hero-bildets filnavn i `site-data.js` uten å oppdatere denne linjen, mister du LCP-preload-gevinsten (siden fungerer fortsatt, bare litt tregere først-maling) |
| Hero `<img>` sin `alt`-tekst | `index.html:77` (`alt="Celine Pool Villa Cha-Am exterior"`) | **⚠️ Kode, ikke config** | `data-property-hero-image` styrer kun `src`, ikke `alt`. Må redigeres manuelt i HTML. |
| Faktiske bildefiler | `assets/images/*.webp` | Filer | 8 stk, 60–247 KB per fil i dag. Ingen automatisert komprimering/resizing — konverter/komprimer til WebP manuelt før du legger dem inn (se §15/§19 i full-audit.md — ingen sjekkliste for dette fantes før nå) |
| `srcset`/`sizes` | — | Bevisst utsatt | Malen bruker ikke responsive bildevarianter i dag (se full-audit.md "Bevisst utsatt"-seksjon) — ikke noe å gjøre her, bare vær klar over at galleribilder er noe oversamplet på mobil |

**Liten observasjon (ikke en action item):** i det lokale repoet heter hero-filen `Hero.webp` med stor H på disk, men `git ls-files` viser at Git faktisk sporer den som `hero.webp` (liten h) — det matcher koden. Dette er en kosmetisk Windows-artefakt (case-insensitivt filsystem), ikke en reell feil, men vær obs på filnavn-casing generelt når du legger inn nye bilder på Windows, siden et ekte case-mismatch *ville* brutt siden på en case-sensitiv server.

**Test:** åpne galleriet, klikk gjennom lightbox, sjekk at ingen bilde mangler eller viser feil `alt`-tekst i devtools.

---

## 4. Location/maps

| Felt | Hvor | Type | Merknad |
|---|---|---|---|
| `mapAddress` | `site-data.js:97` | Config | Vises under kartet |
| `mapUrl` | `site-data.js:98` | Config | "Open in Google Maps"-lenken |
| `mapEmbedUrl` | `site-data.js:99–104` | Config | Selve iframe-kartet. **Fremgangsmåte er dokumentert direkte i kommentaren i filen:** søk opp den nye adressen på Google Maps → Share → Embed a map → kopier `src="..."`-verdien, eller bytt bare `q=`-parameteren i eksisterende URL |
| `locationBody` | `site-data.js:57–60` | Config | Se seksjon 2 |
| `locationBody2` | `site-data.js:61–64` | **⚠️ Dødt felt** | Se seksjon 2 — skrives aldri ut noe sted |
| `locationHighlights[]` | `site-data.js:67–72` | Config | De fire hurtig-info-boksene ("5 min · Beach" osv.) |

**Test:** sjekk at kartet faktisk viser riktig adresse (ikke bare at det laster), og at "Open in Google Maps"-lenken peker til riktig sted.

---

## 5. Contact/social

| Felt | Hvor | Type | Merknad |
|---|---|---|---|
| `phone` | `site-data.js:106` | Config | Styrer `tel:`-lenken automatisk |
| `email` | `site-data.js:105` | Config | Tom streng i dag → footer faller tilbake til "Contact via Facebook" + `contactUrl`. Sett en ekte e-post her hvis propertyen har en. |
| `contactUrl` | `site-data.js:107` | Config | Facebook-siden (eller annen kontakt-URL). Styrer nå **alle tre** kontaktlenkene korrekt via `data-property-contact-link` (dette var et 🟠-funn i audit-en, lukket i en tidligere økt) |
| `photosUrl` | `site-data.js:108` | **⚠️ Dødt felt — nytt funn** | Leses av `script.js:230` (`[data-property-photos-link]`), men **ingen element i `index.html` har dette attributtet**. Akkurat samme situasjon som `locationBody2` — dokumentert her, ikke fjernet. |
| Footer e-post-lenkens startverdi | `index.html:382–383` | **⚠️ Kode-fallback, overstyres av JS** | `href` er i dag hardkodet til Property #1 sin Facebook-URL. Dette overstyres umiddelbart av `renderStaticContent()` ved sideinnlasting (se `script.js:224`), så det er **ikke en synlig bug** — men det er en manuelt vedlikeholdt fallback-verdi kopiert fra forrige property. Verdt å sjekke/nulle ut når du kloner, i tilfelle JS feiler eller en crawler leser rå HTML før JS kjører. |
| `booking.contact.email` | `site-data.js:182–186` | Config | **Faktisk brukt** — CC'es inn i Formspree-innsendingen (se seksjon 6) |
| `booking.contact.phone`, `booking.contact.line` | `site-data.js:182–186` | **⚠️ Ubrukte placeholders** | Ingen kode leser disse ennå. Fyll dem gjerne ut for fremtidig bruk, men det gjør ingen forskjell i dag. |

**Test:** klikk alle tre "Facebook"/"Contact Owner"-lenkene, sjekk at de peker til riktig side; sjekk `tel:`-lenken på mobil.

---

## 6. Booking/pricing

| Felt | Hvor | Type | Merknad |
|---|---|---|---|
| `currency`, `pricePerNight`, `cleaningFee`, `serviceFee` | `site-data.js:138–141` | Config | Sett `pricePerNight: 0` for å skjule all prisvisning (kalenderen fungerer fortsatt) |
| `minimumStay`, `maximumStay`, `bookingHorizonMonths` | `site-data.js:144–153` | Config | `null` = ingen grense (unntatt `minimumStay`, se kjent avvik i full-audit.md §04) |
| `maximumGuests` | `site-data.js:157` | Config | Hold denne i sync med `facts`-arrayets "guests"-verdi manuelt — ingen automatisk kobling mellom dem |
| `blockedDates[]` | `site-data.js:164–167` | Config | Hånd-redigert liste, ingen reservasjons-lås (kjent, akseptert driftsrisiko — se full-audit.md §03) |
| **`FORMSPREE_ENDPOINT`** | `script.js:1128` | **🔴 Kritisk — kode, ikke config** | Hardkodet Formspree-skjema-URL (`https://formspree.io/f/mbgrqqlg`) spesifikt for Property #1. **Glemmer du å bytte denne, går alle bestillingsforespørsler fra Property #2 til Property #1 sin Formspree-innboks.** Opprett et nytt Formspree-skjema for den nye propertyen og lim inn den nye URL-en her før lansering. Dette er ikke nevnt eksplisitt i full-audit.md §02 og er den mest kritiske "glem-dette-og-ingenting-funker"-fellen i hele malen. |
| `NUMBER_LOCALES` | `script.js:1025` | **⚠️ Kode, ikke config** | `{ en: "en-US", th: "th-TH" }` — kun brukt til tallformatering (valuta-visning). Fungerer i dag fordi begge properties bruker samme to locale-mappinger. En property med annen valuta/tredje språk krever kodeendring her. |
| `integrations.airbnb` / `integrations.bookingCom` | `site-data.js:173–176` | Ubrukte placeholders | Ingen kode leser disse ennå — forberedt plass for Fase 3 (backend) |

**Test (obligatorisk, ikke valgfritt):** etter kloning, **send en faktisk test-bestillingsforespørsel** gjennom hele flyten (velg datoer → Check Availability → Request to Book → fyll skjema → send) og verifiser at den faktisk lander i **den nye propertyens** Formspree-innboks/e-post — ikke i den gamle. Dette er den eneste måten å fange en glemt `FORMSPREE_ENDPOINT`-oppdatering på.

---

## 7. Analytics

| Felt | Hvor | Type | Merknad |
|---|---|---|---|
| `analytics.ga4MeasurementId` | `site-data.js:119` | Config | Format `G-XXXXXXXXXX`, validert av `initAnalytics()` (`script.js:441–462`) — ugyldig format hoppes stille over med `console.warn`, ikke sendt som den er |
| `analytics.clarityProjectId` | `site-data.js:120` | Config | Microsoft Clarity project ID, samme validering |

**Kritisk å huske:** disse må være **nye** ID-er opprettet for den nye propertyen — **ikke** gjenbruk av Property #1 sine ID-er. Gjenbruker du dem, blandes trafikkdata fra to forskjellige eiendommer i samme GA4/Clarity-konto uten at noen oppdager det (dette var et 🔴-funn i original-audit-en, allerede lukket for selve *kode*-delen — men config-verdien må fortsatt settes riktig manuelt per property).

Sett begge til `""` for å deaktivere sporing helt (nyttig før analytics er satt opp for en ny property).

**Test:** åpne den nye siden i nettleseren, sjekk GA4 Realtime-visningen og Clarity-dashboardet for den **nye** propertyen — bekreft at events faktisk kommer inn der, ikke i den gamle kontoen.

---

## 8. SEO

| Felt | Hvor | Type | Merknad |
|---|---|---|---|
| `seo.title`, `seo.description` | `site-data.js:88–92` | Config | Appliseres **dynamisk** av `applySeoMeta()` (`script.js:186–197`) hver gang siden lastes/språk byttes — alltid korrekt uten ekstra steg |
| `seo.ogImage`, `seo.siteUrl`, `seo.twitterHandle` | `site-data.js:93–95` | Config | Brukes **kun** av `scripts/sync-seo.js` (se under) — påvirker ikke runtime |
| **Statisk SEO-block i `<head>`** | `index.html:14–28` (mellom `SEO:START`/`SEO:END`) | **⚠️ Config, men krever manuelt script-kjøring** | Open Graph, Twitter Card og (når `siteUrl` er satt) canonical-tag bakes inn i rå HTML av `node scripts/sync-seo.js`. Disse leses av lenke-forhåndsvisnings-roboter (Facebook, LINE, WhatsApp) som **ikke kjører JavaScript** — derfor holder ikke den dynamiske oppdateringen alene. **Du må kjøre scriptet manuelt** hver gang `seo`-blokken i `site-data.js` endres, før deploy. |
| `sitemap.xml` | repo-rot | Generert fil | Samme script (`syncSitemap()`) genererer denne fra `seo.siteUrl`. Forblir en tom `<urlset>` helt til `siteUrl` er satt — det er korrekt/forventet, ikke en feil. |
| `robots.txt` | repo-rot | **⚠️ Helt statisk, IKKE rørt av scriptet** | `scripts/sync-seo.js` oppdaterer **ikke** denne filen. Den har en utkommentert linje (`# Add "Sitemap: https://yourdomain.com/sitemap.xml"...`) som må aktiveres/redigeres for hånd når det ekte domenet er kjent. |
| Google Search Console-verifisering | `index.html:7` | **⚠️ Se seksjon 1** | Ikke del av `seo`-blokken i config eller av sync-scriptet — helt separat, helt manuell |
| Canonical-tag, JSON-LD | — | Bevisst utsatt | Canonical er kodeferdig i `sync-seo.js` og aktiveres automatisk når `siteUrl` settes. JSON-LD er bevisst ikke bygget ennå (se full-audit.md "Bevisst utsatt") — ingen action her, bare vær klar over at det mangler. |

**Fremgangsmåte (i rekkefølge):**
1. Rediger `seo`-blokken i `site-data.js`.
2. Sett `seo.siteUrl` til det ekte domenet **så snart det er kjent** (aktiverer canonical + fyller `sitemap.xml`).
3. Kjør `node scripts/sync-seo.js` fra repo-roten.
4. Sjekk at `index.html`s SEO-block og `sitemap.xml` faktisk ble oppdatert (scriptet logger dette i terminalen).
5. Oppdater `robots.txt` manuelt med `Sitemap:`-linjen når domenet er satt.
6. Bytt `google-site-verification`-taggen til en ny, domene-spesifikk token.

**Test:** valider `sitemap.xml` som well-formed XML, sjekk OG-tagger med en lenke-debugger (f.eks. Facebook Sharing Debugger) etter at siten er live på ekte domene.

---

## 9. Languages

Malen støtter i dag **nøyaktig to språk: `en` og `th`** — hardkodet flere steder, ikke en konfigurerbar liste:

| Hvor antallet/valget av språk er hardkodet | Type |
|---|---|
| Språkbytte-knapper (`index.html:65–67`, kun EN/TH) | **⚠️ Kode** |
| Hver tekstverdi i `site-data.js` forventes å være `{ en: "...", th: "..." }` | **⚠️ Kode-struktur** |
| `translations.js` sine to toppnivå-nøkler `en`/`th` | **⚠️ Kode** |
| `NUMBER_LOCALES` i `script.js:1025` (kun `en-US`/`th-TH`) | **⚠️ Kode** |

Å legge til et tredje språk (eller kjøre med kun ett) er **ikke** noe du løser i `site-data.js` alene — det krever endringer i alle fire punktene over.

**For en property som fortsatt bruker begge språkene (vanligste tilfelle):** sjekk manuelt at **alle** tekstfelt i `site-data.js` faktisk har utfylt både `en` og `th` — dette verifiseres **ikke** automatisk for property-innhold. (`translations.js` sin UI-tekst *er* programmatisk verifisert til 85/85 nøkler i begge språk — det er noe annet enn property-teksten.)

**Test:** bytt språk på hver seksjon av siden, se etter tomme felt eller engelsk tekst som lekker gjennom på thai-visningen.

---

## 10. Deployment/verification

- [ ] Ingen build-steg — rene statiske filer, deploy `index.html` + `style.css` + `script.js` + `site-data.js` + `translations.js` + `assets/` + `robots.txt` + `sitemap.xml` som de er
- [ ] Lokal forhåndsvisning: `.claude/launch.json` kjører `python -m http.server 5173` — ingen property-spesifikk konfigurasjon her
- [ ] Kjør `node scripts/sync-seo.js` **etter** siste endring i `site-data.js`, **før** deploy (se seksjon 8)
- [ ] Manuell smoke-test i nettleser (ingen automatisert testsuite finnes ennå — se full-audit.md Fase 2, punkt 3):
  - [ ] Alle 8 seksjoner viser riktig innhold på begge språk
  - [ ] Galleri + lightbox fungerer, riktig bildeantall
  - [ ] Kart viser riktig adresse
  - [ ] Full booking-flyt: velg datoer → Check Availability → Request to Book → send skjema → bekreft at forespørselen faktisk lander i **riktig** Formspree-innboks (se seksjon 6)
  - [ ] Alle kontakt-/social-lenker peker til riktig sted
  - [ ] Ingen konsollfeil, ingen synlig config-error-banner (se `reportConfigError()` i `script.js`)
  - [ ] GA4 Realtime + Clarity mottar events fra riktig konto (se seksjon 7)
  - [ ] `sitemap.xml` og `robots.txt` er tilgjengelige og korrekte på det nye domenet

---

## 11. Ting som fortsatt krever manuell kodeendring

Samlet oversikt — alt herfra kan **ikke** løses ved kun å redigere `site-data.js`:

1. **`FORMSPREE_ENDPOINT`** (`script.js:1128`) — 🔴 mest kritisk, se seksjon 6
2. **About-seksjonens bilde** (`index.html:147–150`) — helt utenfor config, se seksjon 3
3. **Hero preload-lenke** (`index.html:34`) — må matches manuelt mot `config.heroImage`, se seksjon 3
4. **Hero-bildets `alt`-tekst** (`index.html:77`) — ikke koblet til noen `data-property-*`-attributt
5. **`google-site-verification`-tag** (`index.html:7`) — domene-spesifikk, helt utenfor config og utenfor `sync-seo.js`
6. **Favicon-filnavnet** `celine-pool-villa-favicon.webp` (`index.html:31`) — propertyens navn er bakt inn i filnavnet
7. **`robots.txt`** — helt statisk, ikke generert, `Sitemap:`-linjen må legges til for hånd
8. **Fargepalett og fonter** (`style.css:1–14`, `index.html:39–41`) — den visuelle identiteten, forventet å være kode
9. **`NUMBER_LOCALES`** (`script.js:1025`) — currency/locale-formatering, kun relevant hvis ny property bruker annen valuta enn THB/samme locale-par
10. **Antall/valg av språk** (`index.html:65–67`, `translations.js`, `NUMBER_LOCALES`) — se seksjon 9, kun relevant hvis språk-settet skal endres
11. **`node scripts/sync-seo.js`** må kjøres manuelt hver gang `seo`-blokken endres — ikke automatisk, ikke en del av deploy
12. **Locale/valuta-mapping** — se punkt 9, samme sak som `NUMBER_LOCALES`

**Dødte config-felt** (finnes i `site-data.js`, men ingen kode/HTML konsumerer dem — trygt å ignorere, men forvirrende hvis noen prøver å bruke dem og lurer på hvorfor ingenting skjer):
- `locationBody2` (`site-data.js:61–64`)
- `photosUrl` (`site-data.js:108`)
- `booking.contact.phone`, `booking.contact.line` (`site-data.js:182–186`) — kun `booking.contact.email` er faktisk i bruk

---

*Sist verifisert direkte mot koden: 2026-08-20. Denne listen dokumenterer repoets faktiske oppførsel på dette tidspunktet — linjenumre kan flytte seg ved senere endringer.*
