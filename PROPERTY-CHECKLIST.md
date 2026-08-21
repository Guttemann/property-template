# Property Checklist — klone malen til en ny property

**Formål:** en punkt-for-punkt-liste for å ta denne malen fra **Property #1 (Celine Pool Villa Cha-Am)** til **Property #2**, uten å måtte huske noe fra hodet.

**Hvordan bruke listen:** gå gjennom seksjon 1–10 i rekkefølge og kryss av. Seksjon 11 er en samlet oversikt over alt som *ikke* kan løses ved å redigere `site-data.js` alene — les den før du starter, så du vet hva som venter.

**Viktig:** denne listen beskriver **hvordan repoet faktisk fungerer i dag** (verifisert direkte mot koden), ikke hvordan det burde fungere. Der noe burde vært config men ikke er det, står det tydelig merket **⚠️ Ikke config ennå**.

Referanse: full teknisk gjennomgang i [full-audit.md](.claude/full-audit.md).

---

## 0. Forutsetninger

- [ ] Node.js installert (kreves for `node scripts/sync-seo.js` — se seksjon 8 — og for `node --test`/`node scripts/validate-config.js` — se seksjon 10)
- [ ] npm/npx tilgjengelig **og** nettverkstilgang til npm-registryet (valgfritt — kun hvis du vil kjøre `node scripts/validate-config.js`, se seksjon 10. Kjører `npx ajv-cli@5.0.0` — ikke installert i prosjektet, hentes/caches av npx ved første kjøring)
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
| Google Search Console-verifisering | `site-data.js` (`seo.googleSiteVerification`), bakt inn i `index.html` av `node scripts/sync-seo.js` | ✅ **Config (Fase 2.4)** | Verdien er fortsatt **domene-spesifikk** — du må uansett generere en **ny** token fra Search Console for det nye domenet, det endrer ikke seg. Det som endret seg: du redigerer den nå i `site-data.js` sammen med resten av `seo`-blokken, og kjører `node scripts/sync-seo.js` for å bake den inn — i stedet for å redigere en frittstående `<meta>`-tag direkte i `index.html`. Se seksjon 8. |
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

**⚠️ Dødt felt — bevisst beholdt (vurdert på nytt i Fase 2.4):** `locationBody2` blir lest av `script.js` (`[data-property-location-body-2]`), men **ingen element i `index.html` har dette attributtet**. Uansett hva du skriver her, vises det aldri. Feltet ble eksplisitt vurdert for sletting i Fase 2.4-cleanupen og **beholdt**, fordi det inneholder ekte, utfylt property-innhold (reise-avstander til Forest Park/togstasjon/flyplass), ikke placeholder-tekst — en cleanup-batch skal ikke destruere reelt innhold. Kandidat for enten (a) en fremtidig feature som legger til elementet i HTML, eller (b) en senere eksplisitt sletting hvis noen bestemmer at innholdet aldri skal vises.

**⚠️ Ikke alle `{en, th}`-felt tillater tom thai-tekst (funn fra Property #2-byggeøkten, 2026-08-21).** De fleste tekstfelt over (`heroDescription`, `aboutBody`, osv.) krever `minLength: 1` i **begge** språk (`localizedText` i schemaet) — men noen få felt (`seo.title`, `heroImageAlt`, `aboutImage.alt`) bruker den mykere `localizedTextOptional`, der tom thai-tekst er eksplisitt lovlig og faller tilbake til engelsk i praksis. Feltene der dette *ikke* er lov inkluderer, litt overraskende, `gallery[].alt` og `amenities[].label` — begge er vanlig, gjentakende innhold (ett per bilde/amenity) man lett antar er "myke" felt som resten av bilde-relaterte data, men schemaet krever faktisk utfylt thai-tekst i hver eneste oppføring. `node scripts/validate-config.js` fanger dette umiddelbart (`must NOT have fewer than 1 characters`) — men sjekk `schema/property-config.schema.json` per felt (`$ref: localizedText` vs. `localizedTextOptional`) i stedet for å anta at "tom thai er ok ett sted" gjelder generelt.

**Statiske UI-strenger** (knappetekst, navigasjonslabels, feilmeldinger, disclaimers) ligger i `translations.js` (85 nøkler × 2 språk) og er **ikke property-spesifikke** — det er generisk UI-tekst som gjelder for alle properties. Rør denne filen kun hvis selve *ordlyden* i grensesnittet skal endres for alle fremtidige properties, ikke som del av en normal property-klone.

**Test:** bla gjennom hele siden på begge språk, sjekk at ingen tekst mangler eller viser placeholder-tekst fra Property #1.

---

## 3. Images/assets

| Element | Hvor | Type | Merknad |
|---|---|---|---|
| Hero-bilde | `site-data.js:15` (`heroImage`) | Config | Styrer `<img data-property-hero-image>` (`index.html:77`) automatisk |
| Galleri (8 bilder) | `site-data.js:35–44` (`gallery[]`: `src`, `alt`, `span`, `width`, `height`) | Config | `renderGallery()` bruker disse feltene direkte — inkl. `width`/`height` for CLS-forebygging, så disse må stemme med de faktiske filenes pikseldimensjoner |
| **About-seksjonens bilde** | `site-data.js` (`aboutImage.src`, `aboutImage.alt`) | ✅ **Config (Fase 2.4)** | Var tidligere skrevet direkte i HTML uten noen config-kobling. `index.html` sitt About-bilde har nå `data-property-about-image`, satt av `renderStaticContent()` i script.js — samme mønster som hero-bildet. Feltet er valgfritt: mangler `aboutImage` i config, beholdes de hardkodede fallback-verdiene i `index.html` uendret, så en ufullstendig klone feiler ikke stille. |
| Hero preload-lenke | `index.html:34` (`<link rel="preload" as="image" href="assets/images/hero.webp">`) | **⚠️ Bevisst hardkodet — se seksjon 11** | Denne må matche `config.heroImage` manuelt. Ikke flyttet til config i Fase 2.4: nettleserens preloader leser rå HTML *før* JavaScript kjører, så en config-drevet verdi (satt av script.js) ville komme for sent til å gi noen LCP-gevinst i det hele tatt — selve poenget med preload krever at linjen står i rå HTML. Endrer du hero-bildets filnavn i `site-data.js` uten å oppdatere denne linjen, mister du kun LCP-preload-gevinsten (siden fungerer fortsatt, bare litt tregere først-maling). |
| Hero `<img>` sin `alt`-tekst | `site-data.js` (`heroImageAlt`) | ✅ **Config (Fase 2.4)** | `data-property-hero-image` setter nå både `src` (fra `heroImage`) og `alt` (fra `heroImageAlt`). Valgfritt felt — mangler det, beholdes HTML-fallback-teksten. |
| Faktiske bildefiler | `assets/images/*.webp` | Filer | 8 stk, 60–247 KB per fil i dag. Ingen automatisert komprimering/resizing — konverter/komprimer til WebP manuelt før du legger dem inn (se §15/§19 i full-audit.md — ingen sjekkliste for dette fantes før nå) |
| `srcset`/`sizes` | — | Bevisst utsatt | Malen bruker ikke responsive bildevarianter i dag (se full-audit.md "Bevisst utsatt"-seksjon) — ikke noe å gjøre her, bare vær klar over at galleribilder er noe oversamplet på mobil |

**Liten observasjon (ikke en action item):** i det lokale repoet heter hero-filen `Hero.webp` med stor H på disk, men `git ls-files` viser at Git faktisk sporer den som `hero.webp` (liten h) — det matcher koden. Dette er en kosmetisk Windows-artefakt (case-insensitivt filsystem), ikke en reell feil, men vær obs på filnavn-casing generelt når du legger inn nye bilder på Windows, siden et ekte case-mismatch *ville* brutt siden på en case-sensitiv server.

**✅ `node scripts/validate-config.js` sjekker nå at bildefilene faktisk finnes på disk (fikset i opprydningsbatchen etter Property #2-reviewen, 2026-08-21).** Etter at selve schema-sjekken går grønn, verifiserer scriptet — med Node sin innebygde `fs`, ingen ny dependency — at `heroImage`, `aboutImage.src` og hver `gallery[].src` faktisk finnes som fil på disk, løst relativt til propertyens egen rot. Mangler én, rapporteres nøyaktig hvilket felt og hvilken sti scriptet lette etter, og kommandoen avslutter med exit-kode `1` (samme kode som et vanlig schema-brudd), ikke `0`. **Fortsatt ikke sjekket:** at `gallery[].width`/`height` faktisk stemmer med filens ekte pikseldimensjoner — det krever å dekode selve bildeheaderen, en egen, større sjekk som bevisst ikke er bygget nå. En grønn kjøring er altså bevis for at bildene *finnes*, men ikke for at deklarert `width`/`height` er korrekt — det fanges fortsatt kun av den manuelle smoke-testen under (synlig feil beskjæring/CLS i nettleseren).

**Test:** åpne galleriet, klikk gjennom lightbox, sjekk at ingen bilde mangler eller viser feil `alt`-tekst i devtools.

---

## 4. Location/maps

| Felt | Hvor | Type | Merknad |
|---|---|---|---|
| `mapAddress` | `site-data.js:97` | Config | Vises under kartet |
| `mapUrl` | `site-data.js:98` | Config | "Open in Google Maps"-lenken |
| `mapEmbedUrl` | `site-data.js:99–104` | Config | Selve iframe-kartet. **Fremgangsmåte er dokumentert direkte i kommentaren i filen:** søk opp den nye adressen på Google Maps → Share → Embed a map → kopier `src="..."`-verdien, eller bytt bare `q=`-parameteren i eksisterende URL |
| `locationBody` | `site-data.js:57–60` | Config | Se seksjon 2 |
| `locationBody2` | `site-data.js` | **⚠️ Dødt felt — bevisst beholdt** | Se seksjon 2 — skrives aldri ut noe sted, men beholdt med vilje (ekte innhold, ikke slettet i Fase 2.4) |
| `locationHighlights[]` | `site-data.js:67–72` | Config | De fire hurtig-info-boksene ("5 min · Beach" osv.) |

**Test:** sjekk at kartet faktisk viser riktig adresse (ikke bare at det laster), og at "Open in Google Maps"-lenken peker til riktig sted.

---

## 5. Contact/social

| Felt | Hvor | Type | Merknad |
|---|---|---|---|
| `phone` | `site-data.js:106` | Config | Styrer `tel:`-lenken automatisk |
| `email` | `site-data.js:105` | Config | Tom streng i dag → footer faller tilbake til "Contact via Facebook" + `contactUrl`. Sett en ekte e-post her hvis propertyen har en. |
| `contactUrl` | `site-data.js:107` | Config | Facebook-siden (eller annen kontakt-URL). Styrer nå **alle tre** kontaktlenkene korrekt via `data-property-contact-link` (dette var et 🟠-funn i audit-en, lukket i en tidligere økt) |
| `photosUrl` | `site-data.js` (kommentert i filen som bevisst beholdt) | **⚠️ Dødt felt — bevisst beholdt** | Leses av `script.js` (`[data-property-photos-link]`), men **ingen element i `index.html` har dette attributtet**. Samme status som `locationBody2` (seksjon 2/4). Vurdert eksplisitt i Fase 2.4-cleanupen og **ikke** slettet: innholdet er ekte property-data (en Google-photosphere-lenke), ikke placeholder-tekst, og en cleanup-batch skal ikke destruere reelt innhold. Kandidat for enten (a) en fremtidig feature som faktisk kobler den til et HTML-element, eller (b) en senere eksplisitt sletting hvis noen bestemmer at den aldri skal brukes. |
| Footer e-post-lenkens startverdi | `index.html:382–383` | **⚠️ Kode-fallback, overstyres av JS — nullstill aktivt ved kloning** | `href` er i dag hardkodet til forrige property sin *ekte* Facebook-URL. Dette overstyres umiddelbart av `renderStaticContent()` ved sideinnlasting (se `script.js:224`), så det er **ikke en synlig bug i den kjørende siden** — men **bekreftet i Property #2-byggeøkten (2026-08-21):** en fersk klone av `index.html` beholder denne verdien bokstavelig frem til noen aktivt endrer den, så en no-JS-besøkende (eller en crawler som leser rå HTML før JS kjører) på den *nye* propertyen kan se/klikke seg til den *forrige* propertyens kontaktside. Sett den til `href="#"` (eller den nye propertyens egen URL) som en del av selve klone-steget, ikke som en "sjekk om nødvendig"-post. Samme prinsipp gjelder de andre hardkodede no-JS-fallback-tekstene: nav-logo (`index.html:51`), footer-logo (`:375`), hero-tittel (`:85`), hero-beskrivelse/-detaljer/-sted (`:87–94`), about-tittel/-body (`:112–124`) og kart-adresse (`:205`) — alle overstyres av JS ved lasting, men bør nullstilles/settes til placeholder ved kloning av samme grunn. |
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
| **`booking.formspreeEndpoint`** | `site-data.js` (`booking.formspreeEndpoint`) | ✅ **Fikset i Fase 2.4 — nå config** | Var tidligere en hardkodet konstant (`FORMSPREE_ENDPOINT`) i `script.js`. Flyttet inn i `booking`-blokken i `site-data.js`, rett ved siden av resten av booking-configen — samme fil du uansett redigerer for pris/datoer. `submitBookingRequest()` har fått en fail-loud guard: er feltet tomt, kastes en tydelig feil (`"Booking requests are not configured yet — set booking.formspreeEndpoint in site-data.js."`) i stedet for å sende mot en tom/manglende URL. **Fortsatt like kritisk å faktisk sette riktig verdi per property** — flyttingen fjerner ikke det steget, bare gjør en glemt/tom verdi synlig med en gang i stedet for stille feilsendte forespørsler. Opprett et nytt Formspree-skjema for den nye propertyen og lim inn URL-en her før lansering. |
| `booking.numberLocales` | `site-data.js` (`booking`-blokken) | Config | `{ en: "en-US", th: "th-TH" }` — kun brukt til tallformatering (gruppe-/desimalskilletegn i prisvisning), ikke valutasymbolet (det er `currency` over). Legger den nye propertyen til et tredje språk (utenfor scope for en vanlig klone, se seksjon 9), trenger den én ny nøkkel her — ellers ingen endring nødvendig. Manglende/ugyldig verdi faller trygt tilbake til `en-US`. |
| `integrations.airbnb` / `integrations.bookingCom` | `site-data.js:173–176` | Ubrukte placeholders | Ingen kode leser disse ennå — forberedt plass for Fase 3 (backend) |

**⚠️ `currency` er en ren tekst-suffiks, ikke lokalisert valutaformatering (funn fra Property #2-valideringsøkten, 2026-08-21).** `formatMoney()` (`booking-logic.js:239–252`) setter alltid `currency`-verdien **etter** det formaterte beløpet, f.eks. `"10 000 THB"`. Det finnes ingen støtte for et valutasymbol foran beløpet (`$180`, `€150`) eller ekte ISO 4217-lokalisert formatering — bekreftet direkte i koden. Fungerer helt fint for en ny THB-property, eller enhver valuta man aksepterer som suffiks (`"180 USD"`); **ikke anta** at å sette `currency: "USD"` gir `$`-prefiks — det krever en faktisk kodeendring i `formatMoney()`.

**Test (obligatorisk, ikke valgfritt):** etter kloning, **send en faktisk test-bestillingsforespørsel** gjennom hele flyten (velg datoer → Check Availability → Request to Book → fyll skjema → send) og verifiser at den faktisk lander i **den nye propertyens** Formspree-innboks/e-post — ikke i den gamle. Dette er den eneste måten å fange en glemt `booking.formspreeEndpoint`-oppdatering på (den nye fail-loud guarden fanger kun *tom* verdi, ikke en verdi som ved en feil peker til feil property).

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
| `seo.title`, `seo.description` | `site-data.js` (`seo` block) | Config | Appliseres **dynamisk** av `applySeoMeta()` i script.js hver gang siden lastes/språk byttes — alltid korrekt uten ekstra steg |
| `seo.ogImage`, `seo.siteUrl`, `seo.twitterHandle`, `seo.googleSiteVerification` | `site-data.js` (`seo` block) | Config | Brukes **kun** av `scripts/sync-seo.js` (se under) — påvirker ikke runtime. `googleSiteVerification` er nytt i Fase 2.4, flyttet hit fra en frittstående hardkodet `<meta>`-tag i `index.html`. |
| **Statisk SEO-block i `<head>`** | `index.html` (mellom `SEO:START`/`SEO:END`) | **⚠️ Config, men krever manuelt script-kjøring** | Open Graph, Twitter Card, Google Search Console-verifisering (nytt i Fase 2.4) og (når `siteUrl` er satt) canonical-tag bakes inn i rå HTML av `node scripts/sync-seo.js`. Disse leses av roboter — lenke-forhåndsvisning (Facebook, LINE, WhatsApp) **og** Googles site-verification-sjekk — som **ikke kjører JavaScript** — derfor holder ikke den dynamiske oppdateringen alene. **Du må kjøre scriptet manuelt** hver gang `seo`-blokken i `site-data.js` endres, før deploy. |
| `sitemap.xml` | repo-rot | Generert fil | Samme script (`syncSitemap()`) genererer denne fra `seo.siteUrl`. Forblir en tom `<urlset>` helt til `siteUrl` er satt — det er korrekt/forventet, ikke en feil. |
| `robots.txt` | repo-rot | **⚠️ Helt statisk, IKKE rørt av scriptet** | `scripts/sync-seo.js` oppdaterer **ikke** denne filen. Den har en utkommentert linje (`# Add "Sitemap: https://yourdomain.com/sitemap.xml"...`) som må aktiveres/redigeres for hånd når det ekte domenet er kjent. |
| Google Search Console-verifisering (selve tokenet) | `site-data.js` (`seo.googleSiteVerification`) | ✅ **Fikset i Fase 2.4 — nå config** | Fortsatt domene-spesifikk (se seksjon 1) — du må fortsatt generere en ny token per domene, det endrer ikke seg. Det som endret seg: den redigeres nå i `site-data.js` sammen med resten av SEO-blokken, i stedet for en frittstående hardkodet `<meta>`-tag i `index.html`. |
| Canonical-tag, JSON-LD | — | Bevisst utsatt | Canonical er kodeferdig i `sync-seo.js` og aktiveres automatisk når `siteUrl` settes. JSON-LD er bevisst ikke bygget ennå (se full-audit.md "Bevisst utsatt") — ingen action her, bare vær klar over at det mangler. |

**Fremgangsmåte (i rekkefølge):**
1. Rediger `seo`-blokken i `site-data.js`.
2. Sett `seo.siteUrl` til det ekte domenet **så snart det er kjent** (aktiverer canonical + fyller `sitemap.xml`).
3. Kjør `node scripts/sync-seo.js` fra repo-roten.
4. Sjekk at `index.html`s SEO-block og `sitemap.xml` faktisk ble oppdatert (scriptet logger dette i terminalen).
5. Oppdater `robots.txt` manuelt med `Sitemap:`-linjen når domenet er satt.
6. Sett en ny, domene-spesifikk token i `seo.googleSiteVerification` i `site-data.js`, og kjør `node scripts/sync-seo.js` på nytt (steg 3) for å bake den inn.

**Test:** valider `sitemap.xml` som well-formed XML, sjekk OG-tagger med en lenke-debugger (f.eks. Facebook Sharing Debugger) etter at siten er live på ekte domene.

---

## 9. Languages

Malen støtter i dag **nøyaktig to språk: `en` og `th`** — hardkodet flere steder, ikke en konfigurerbar liste:

| Hvor antallet/valget av språk er hardkodet | Type |
|---|---|
| Språkbytte-knapper (`index.html:65–67`, kun EN/TH) | **⚠️ Kode** |
| Hver tekstverdi i `site-data.js` forventes å være `{ en: "...", th: "..." }` | **⚠️ Kode-struktur** |
| `translations.js` sine to toppnivå-nøkler `en`/`th` | **⚠️ Kode** |

Å legge til et tredje språk (eller kjøre med kun ett) er **ikke** noe du løser i `site-data.js` alene — det krever endringer i alle tre punktene over.

`booking.numberLocales` (se seksjon 6) er **ikke lenger** en av disse — den er nå config, så et tredje språk trenger kun en ny nøkkel der, ikke en `script.js`-endring. Manglende/tomt for et nytt språk faller uansett trygt tilbake til `en-US`-tallformatering i stedet for å knekke prisvisningen.

**For en property som fortsatt bruker begge språkene (vanligste tilfelle):** sjekk manuelt at **alle** tekstfelt i `site-data.js` faktisk har utfylt både `en` og `th` — dette verifiseres **ikke** automatisk for property-innhold. (`translations.js` sin UI-tekst *er* programmatisk verifisert til 85/85 nøkler i begge språk — det er noe annet enn property-teksten.)

**Test:** bytt språk på hver seksjon av siden, se etter tomme felt eller engelsk tekst som lekker gjennom på thai-visningen.

---

## 10. Deployment/verification

- [ ] Ingen build-steg — rene statiske filer, deploy `index.html` + `style.css` + `script.js` + `booking-logic.js` + `site-data.js` + `translations.js` + `assets/` + `robots.txt` + `sitemap.xml` som de er. `booking-logic.js` er **runtime**, ikke bare test-infrastruktur — `index.html` laster den som en vanlig `<script>` før `script.js`, og siden er ødelagt uten den. `tests/`, `schema/` og `scripts/validate-config.js` (og `node --test` selv) er derimot dev-only og trenger **ikke** deployes.
- [ ] Lokal forhåndsvisning: `.claude/launch.json` kjører `python -m http.server 5173` — ingen property-spesifikk konfigurasjon her
- [ ] Kjør `node scripts/sync-seo.js` **etter** siste endring i `site-data.js`, **før** deploy (se seksjon 8)
- [ ] **Anbefalt, valgfritt:** kjør `node scripts/validate-config.js` **etter** at `site-data.js` er ferdig redigert for den nye propertyen, **før** `node --test`/smoke-test under. Validerer hele configen mot [schema/property-config.schema.json](../schema/property-config.schema.json) (JSON Schema Draft-07) — fanger opp ting som et manglende required-felt, en feilstavet `icon`-nøkkel (faller ellers stille tilbake til pin-ikonet), en `gallery`-oppføring uten `width`/`height`, eller `booking.enabled: true` med en tom `formspreeEndpoint` (se seksjon 6/11). Rent dev-/kvalitetsverktøy — ingen effekt på selve siden, og ikke et krav for at siden skal fungere. Kjører `npx ajv-cli@5.0.0` (pinnet versjon, ingen prosjekt-dependency); krever npm/nettverkstilgang (se seksjon 0). Exit code 0 = gyldig, 1 = faktiske schema-brudd (rett feltet scriptet peker på), 2 = kunne ikke validere i det hele tatt (npm/nettverk utilgjengelig — **ikke** en bekreftelse på at configen er gyldig, bare at valideringen ikke kunne kjøres).
- [ ] Kjør `node --test` **før** deploy — 64 tester dekker dato-/blokkering-/prislogikken, `resolveLocalizedText()`s tekstfallback (`booking-logic.js`, se §06/opprydningsbatchen 2026-08-21) og JSON-schemaet (`schema/property-config.schema.json`), og feiler raskt hvis en fremtidig endring bryter noe her. Ingen `npm install` nødvendig for kjernetestene (Node sin innebygde testrunner) — schema-testene i `tests/schema-validation.test.js` bruker samme `npx ajv-cli@5.0.0` som over.

  **📌 Fast konvensjon — kjør `node --test` fra INNSIDEN av property-mappen du faktisk vil teste** (`cd property-2 && node --test`), aldri fra repo-roten, når mer enn én property-mappe finnes i dette repoet. Dette er en ren kjøre-konvensjon, ikke kode — det finnes bevisst ingen egen test-discovery-/ekskluderingslogikk bygget for å løse dette automatisk.

  **Bakgrunn (Node v24.19.0):** `node --test <mappe>/` med en eksplisitt katalogsti (trailing slash) feiler med `MODULE_NOT_FOUND` — bruk bar `node --test` (auto-discovery) fra riktig `cwd` i stedet. `node --test` uten argumenter **oppdager rekursivt alle `tests/`-mapper under `cwd`**. Siden `property-2/` nå er en **permanent** del av dette repoet (ikke lenger en midlertidig template-test), gir `cd property-2 && node --test` et rent, isolert tall for Property #2 alene (64 tester).

  **Asymmetri å være obs på:** dette isolerer property-2 fullstendig (den har ingen egne under-property-mapper), men **kan ikke** isolere repo-roten/Property #1 sitt eget tall — siden `property-2/` fysisk ligger *inni* rot-mappens filtre, vil `node --test` kjørt fra roten alltid også plukke opp `property-2/tests/` (128 tester = 64 + 64, verifisert 2026-08-21). Det finnes ingen bar `node --test`-kommando som isolerer rotens egne 64 alene mens `property-2/` ligger nestet inni den — det er en strukturell konsekvens av at property-2 lever som en undermappe i samme repo, ikke noe denne konvensjonen løser eller prøver å løse. I en ekte produksjonssetting (hver property i sitt eget, separate repo) oppstår ikke denne asymmetrien i det hele tatt.
- [ ] Manuell smoke-test i nettleser (`node --test` dekker ikke DOM/UI — se over):
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

Samlet oversikt — alt herfra kan **ikke** løses ved kun å redigere `site-data.js`.

**Fikset i Fase 2.4 (config cleanup, 2026-08-20)** — disse fire sto tidligere i denne listen, er nå config: `booking.formspreeEndpoint` (var `FORMSPREE_ENDPOINT` i script.js), About-seksjonens bilde (`aboutImage.src`/`aboutImage.alt`), hero-bildets `alt`-tekst (`heroImageAlt`), og Google Search Console-tokenet (`seo.googleSiteVerification`, bakt inn av `sync-seo.js`). Se seksjon 1, 3, 6 og 8 over, og `.claude/full-audit.md` for full detalj.

Gjenstående, fortsatt kode (bevisst — se begrunnelse per punkt):

1. **Hero preload-lenke** (`index.html:34`) — må matches manuelt mot `config.heroImage`. Bevisst **ikke** flyttet til config: nettleserens preloader leser rå HTML *før* JavaScript kjører, så en config-drevet verdi ville komme for sent og gi null LCP-gevinst. Se seksjon 3.
2. **Favicon-filnavnet** `celine-pool-villa-favicon.webp` (`index.html:31`) — propertyens navn er bakt inn i filnavnet. Bevisst **ikke** flyttet til config: ingen kode leser denne verdien i dag, og en config-kobling uten en byggemekanisme som faktisk skriver `href`-en ville bare flyttet problemet, ikke løst det.
3. **`robots.txt`** — helt statisk, ikke generert, `Sitemap:`-linjen må legges til for hånd
4. **Fargepalett og fonter** (`style.css:1–14`, `index.html:39–41`) — den visuelle identiteten, forventet å være kode
5. **Antall/valg av språk** (`index.html:65–67`, `translations.js`) — se seksjon 9, kun relevant hvis språk-settet skal endres. `booking.numberLocales` er **ikke** en del av dette punktet — det er config, se seksjon 6/9.
6. **`node scripts/sync-seo.js`** må kjøres manuelt hver gang `seo`-blokken endres — ikke automatisk, ikke en del av deploy

**Dødte config-felt** (finnes i `site-data.js`, men ingen kode/HTML konsumerer dem — trygt å ignorere, men forvirrende hvis noen prøver å bruke dem og lurer på hvorfor ingenting skjer):
- `locationBody2` — **bevisst beholdt** (vurdert for sletting i Fase 2.4, men inneholder ekte property-innhold, ikke en placeholder — se seksjon 2/4)
- `photosUrl` — **bevisst beholdt**, samme begrunnelse (se seksjon 5)
- `booking.contact.phone`, `booking.contact.line` — annen kategori enn de to over: dette er **bevisst forberedt** config for en fremtidig integrasjon (samme status som `booking.integrations.airbnb`/`bookingCom`), ikke et glemt/dødt felt. Kun `booking.contact.email` er faktisk lest av kode i dag.

---

*Sist verifisert direkte mot koden: 2026-08-20 (inkl. Fase 2.4 config cleanup), med addendum 2026-08-21 i tre steg: først en ren analyse-/valideringsøkt (hypotetisk config, ingen filer opprettet; to funn lagt til i seksjon 3 og 6), deretter en faktisk byggeøkt samme dag som opprettet en reell, isolert kopi av templaten under [property-2/](property-2/) i dette repoet — nå en **permanent** del av repoet, ikke en midlertidig test (se innledning i den mappens `site-data.js` for status). Denne andre økten kjørte hele verktøykjeden reelt (ikke bare i minnet) og fant to nye ting: (1) `gallery[].alt`/`amenities[].label` krever ikke-tom thai-tekst der man kunne anta det var valgfritt (seksjon 2), og (2) `node --test` fra repo-roten teller nå rekursivt med tester fra enhver `tests/`-mappe under seg, inkl. en klonet propertys (seksjon 10). Deretter en tredje, liten opprydningsbatch samme dag (post-Property #2-review) rettet `getText()`/`t()`-inkonsekvensen, formaliserte `node --test`-konvensjonen i seksjon 10, og la til fil-eksistens-sjekk for bilder i `validate-config.js` (seksjon 3) — 64/64 tester grønt i begge property-mapper isolert. Se [full-audit.md](.claude/full-audit.md) "Property #2 bygget for reelt" og "Opprydningsbatch etter Property #2-review" for full detalj. Denne listen dokumenterer repoets faktiske oppførsel på dette tidspunktet — linjenumre kan flytte seg ved senere endringer.*
