# Senior Code Audit — Property Template

**Celine Pool Villa Cha-Am · 2026-08-20 · statisk HTML/CSS/JS, ingen backend**

*Full gjennomgang · ingen kodeendringer utført*

## Sammendrag

| Kategori | Antall |
|---|---|
| 🔴 Må fikses før kommersiell bruk | 5 |
| 🟠 Bør fikses før produksjon | 8 |
| 🟡 Forbedring / teknisk gjeld | 19 |
| 🟢 Ser bra ut / la det være | 18 |

**Rapport:** Sammendrag · Funn per område (Arkitektur & struktur, Gjenbrukbarhet, Booking-flyt, Prisberegning & rabatter, Datoer & edge cases, JS-kvalitet, Feilhåndtering, Sikkerhet, Performance, Responsive / mobile, Accessibility, SEO, i18n / språk, Analytics / GA4, Bilder & assets) · Syntese (Mange properties, Til backend, Til dashboard, Teknisk gjeld) · Veien videre (Prioritert roadmap)

### Solid motor, løs karosseri.

Booking-kjernen (kalender, priskalkulasjon, dato-validering) er skrevet med et modenhetsnivå du sjelden ser i en mal av denne størrelsen — edge cases er tenkt gjennom, og kommentarene forklarer *hvorfor*, ikke hva. Det som ikke henger med er alt rundt: analytics-ID-er, SEO-metadata og én kontaktlenke er hardkodet direkte i `index.html` i stedet for `site-data.js` — så "bytt fil, få ny property" stemmer ikke ennå. Og bestillingsskjemaet sender fortsatt ingenting til noen. Ingen av dette krever backend å fikse — det er alt sammen frontend-arbeid, i tråd med at dere vil holde dere til dagens steg-for-steg-tilnærming.

---

## 01 Arkitektur og prosjektstruktur

Fem flate filer, ingen build, ingen rammeverk. For størrelsen på prosjektet er dette riktig valg — problemet er ikke strukturen, det er at ett par ansvar sniker seg utenfor den.

**🟢 OK — Lagdeling er reell, ikke bare på papiret**

Struktur (index.html), innhold (site-data.js), oversettelser (translations.js), logikk (script.js) og presentasjon (style.css) er faktisk holdt fra hverandre. Ingen npm, ingen bundler.

**Anbefaling:** ikke innfør React/Vue/build-verktøy nå — det løser ingen av problemene under, og dere har eksplisitt bedt om å ikke bygge før grunnmuren er klar.

**🟡 Gjeld — `script.js` er én 1053-linjers fil uten moduler**

*script.js (hele filen)*

Navigasjon/lightbox/reveal, i18n-rendering og hele bookingmotoren ligger i samme globale scope. Fungerer fint for én property. Blir en flaskehals den dagen dere skal patche 5–10 property-repoer med samme bugfiks.

**Anbefaling:** ikke splitt nå, men planlegg for det — se roadmap fase 3.

**🟡 Gjeld — `site-data.js` har ingen skjema eller typer**

*site-data.js:1–151*

Det er en JS-fil som setter `window.propertyConfig`, ikke JSON validert mot noe. Feil i strukturen oppdages først når siden feiler i nettleseren.

**Anbefaling:** formaliser et JSON Schema/TS-type *før* dashboard bygges — se "Til dashboard" lenger ned.

**🟡 Gjeld — Dødt config-felt: `locationBody2`**

*site-data.js:61–64 · script.js:144*

`script.js` kobler denne til `[data-property-location-body-2]`, men index.html har ingen slik attributt. Reiseavstandene til Forest Park/togstasjon/flyplass skrives aldri ut noe sted.

**Anbefaling:** enten legg til elementet i HTML, eller fjern feltet.

---

## 02 Gjenbrukbarhet mellom properties

Dette er kjernespørsmålet i oppdraget, og her er gapet størst mellom intensjon og virkelighet. Kommentaren i site-data.js:94–95 lover at man "kun trenger å endre denne filen" — det stemmer ikke helt ennå.

**🔴 Kritisk — GA4- og Clarity-ID hardkodet i `index.html`, ikke i config**

*index.html:9–31*

**Hvorfor det betyr noe:** kopier denne malen til villa #2, glem å bytte disse to ID-ene (lett å glemme — de ligger begravd i et `<head>`-script, ikke i filen dere ellers redigerer), og trafikk fra to eiendommer blandes i samme GA4/Clarity-konto. Umulig å oppdage uten å lete etter det.

**Anbefaling:** flytt begge ID-ene til **`site-data.js`** (f.eks. `config.analytics.ga4Id`) og la et lite script i `<head>` lese dem derfra, eller injiser tag-oppsettet fra `script.js` ved oppstart.

**🔴 Kritisk — Tittel, meta description og all SEO-metadata er hardkodet i rå HTML**

*index.html:35–38*

**Hvorfor det betyr noe:** dette er de viktigste on-page SEO-signalene en eiendom har, og de er den ene tingen som IKKE følger "bare rediger site-data.js"-prinsippet malen ellers bygger på. Ny property = manuell HTML-redigering man lett glemmer, med direkte SEO-konsekvens.

**Anbefaling:** generer `<title>`/`<meta description>` fra `site-data.js` via et lite script tidlig i `<head>`, eller legg dem inn som egne felt i config og skriv dem inn ved bygg/deploy.

**🟠 Bør fikses — Facebook-lenke hardkodet tre steder, mens data-attributtet for det finnes ubrukt**

*index.html:359, 378, 387 · script.js:151*

`script.js` støtter allerede `[data-property-contact-link]`, men ingen elementer i HTML-en bruker det — de tre Facebook-lenkene er skrevet rett inn som literal `href`. Sammenlign med telefon/e-post, som *er* korrekt koblet via data-attributter (script.js:146–147).

**Anbefaling:** merk de tre lenkene med `data-property-contact-link` så mønsteret som allerede finnes faktisk brukes konsekvent.

**🟡 Gjeld — Valuta/locale-mapping er kode, ikke config**

*script.js:805 (NUMBER_LOCALES)*

Fungerer i dag fordi det kun finnes to språk med 1:1 locale-mapping. En property med annen valuta eller et tredje språk krever kodeendring, ikke config-endring.

**Anbefaling:** flytt til `site-data.js` når property #2 faktisk trenger en annen valuta — ikke før.

**🟢 OK — `data-property-*`-mønsteret er en solid, gjenbrukbar konvensjon**

*script.js:131–160*

Facts, gallery, amenities og location-highlights er 100 % config-drevet. Det meste av innhold *er* allerede isolert til én fil — de fire punktene over er unntakene, ikke normen.

**Anbefaling:** behold mønsteret, bruk det til å rette de fire punktene over i stedet for å finne på noe nytt.

---

## 03 Booking-flyt fra start til slutt

Kalender → resultat → forespørsel → bekreftelse. Selve UI-flyten er ryddig og godt tilstandsstyrt. Det som mangler er enden av rørledningen: ingen som faktisk mottar forespørselen.

**🔴 Kritisk — `submitBookingRequest()` er fortsatt en demo-stub**

*script.js:910–913*

**Hvorfor det betyr noe:** en gjest som fullfører hele flyten og trykker "Send Booking Request" i dag, får en pen suksess-side — men forespørselen havner kun i `console.info`. Ingen e-post, ingen varsling, ingen lagring. Dette er ikke et gjenbrukbarhets-problem, det er et "fungerer produktet i det hele tatt"-problem, uavhengig av hvor mange properties dere har.

**Anbefaling:** koble til en enkel innsendingstjeneste (Formspree, EmailJS eller en minimal serverless-endpoint) — *fortsatt uten å bygge et fullt backend/dashboard.* Funksjonen er allerede isolert til ett sted, så dette er en avgrenset endring.

**🔴 Kritisk — Ingen beskyttelse mot dobbeltbooking**

*site-data.js:128–131 (blockedDates), script.js: getBlockedDates()*

**Hvorfor det betyr noe:** to gjester kan se de samme ledige datoene samtidig og begge sende forespørsel, fordi tilgjengelighet kommer fra en hånd-redigert liste uten noen reservasjons-lås. Dette er en iboende konsekvens av "v1 manuell" og allerede erkjent i kodekommentarene — men bør være en tydelig, bevisst driftsrisiko dere kommuniserer til eiere, ikke en overraskelse.

**Anbefaling:** ingen kodefiks løser dette uten et backend. Reduser vinduet i mellomtiden med rask manuell oppfølging fra eier, og planlegg reell løsning (kalender-lås ved innsending, eller iCal-sync) i backend-fasen — se "Til backend".

**🟢 OK — Tilgjengelighet re-sjekkes rett før bekreftelse**

*script.js:741–753*

`getBlockedDates()` leses på nytt idet gjesten trykker "Check Availability", ikke bare ved sideinnlasting. Minker race-vinduet, selv om det ikke fjerner det helt (se punktet over).

**🟢 OK — Fire tydelige steg, med korrekt re-oversettelse ved språkbytte**

*script.js:1021–1050 (refreshBookingTexts)*

Bytter du språk midt i en booking-forespørsel, oppdateres kalender, valideringsmelding, sammendrag *og* suksess-siden riktig — ikke bare de statiske tekstene. Lett å overse, men gjort riktig her.

---

## 04 Prisberegning og fremtidig støtte for rabatter

Ett knutepunkt for prislogikk, brukt av alle tre visningsflater. Riktig forberedt for rabatter — uten at rabatter er bygget for tidlig.

**🟢 OK — `calculateBookingPrice()` er eneste kilde til sannhet**

*script.js:790–799*

Resultat-panel, forespørsel-sammendrag og suksess-sammendrag kaller alle samme funksjon. Ingen duplisert prislogikk å holde synkron. Dette er nøyaktig riktig sted å utvide fra *når* rabatter trengs.

**Anbefaling:** ikke bygg sesongpriser/rabatter nå — vent til første reelle behov, utvid da denne ene funksjonen pluss en ny rate-struktur i `site-data.js`.

**🟡 Gjeld — Ingen datastruktur for sesongpriser ennå**

*site-data.js:96–151 (booking-objektet)*

Kun flat `pricePerNight`. Helt greit i dag — å bygge en rate-tabell før noen faktisk trenger variabel pris hadde vært over-engineering.

**Anbefaling:** når behovet kommer, legg til noe sånt som `booking.rateRanges: [{ from, to, pricePerNight }]` og la `calculateBookingPrice()` slå opp riktig sats per natt.

**🟡 Gjeld — `minimumStay`-parsing skiller ikke `0` fra "ikke satt"**

*script.js:453*

`Number(config.booking.minimumStay) || 1` — en bevisst `0` i config blir stille til `1`. `maximumStay` og `bookingHorizonMonths` lenger ned i samme funksjon skiller derimot korrekt mellom `null`/`undefined` og faktiske tallverdier — denne ene er avviket.

**Anbefaling:** lite praktisk problem (minimum-opphold på 0 netter er uansett meningsløst), men rett opp for konsistens neste gang filen røres.

---

## 05 Datoer, availability og edge cases

Dette er den mest gjennomarbeidede delen av hele kodebasen. Turnover-dager, booking-horisont og ugyldige datoer er alle håndtert med et presisjonsnivå som er uvanlig å se i en mal på dette stadiet.

**🟢 OK — Samme-dags-turnover er korrekt løst**

*script.js:575–605 (isCheckoutCandidate)*

En natt markert opptatt sperrer den natten som innsjekk, men tillater fortsatt at samme dato brukes som utsjekk for neste gjest — uten netter-overlapp. Dette er en edge case svært mange enkle booking-widgets bommer på.

**🟢 OK — Strengt validerte blokkerte datoer, feiler synlig i stedet for stille**

*script.js:313–376 (expandBlockedDates)*

Regex + ekte-kalenderdato-sjekk (fanger f.eks. "2026-02-30") + `from ≤ to` + maks intervall-lengde. Ugyldige oppføringer droppes med `console.warn` — aldri gjettet på, aldri kastet ukontrollert. For en hånd-redigert fil er "fail visible" nøyaktig riktig retning.

**🟡 Gjeld — Valideringsmønsteret i `initBooking()` gjentas med subtile variasjoner**

*script.js:453–489*

`minimumStay`, `maximumStay` og `bookingHorizonMonths` parses hver for seg med egen fail-open/fail-closed-logikk (bevisst forskjellig, godt kommentert — ikke en feil). Men mønsteret ("parse tall, valider, fall tilbake med warn") vil vokse ubehagelig fort når rabatt- og sesongfelt kommer.

**Anbefaling:** vurder en liten delt `parseConfigNumber(value, {fallback, min, onInvalid})`-hjelper neste gang et nytt tallfelt legges til config — ikke refaktorer bare for å refaktorere nå.

---

## 06 JavaScript-kvalitet, duplisering og kompleksitet

**🟢 OK — Kommentarene forklarer hvorfor, ikke hva**

*script.js, hele booking-seksjonen*

Særlig rundt turnover-unntaket og horisont-vs-utsjekk-logikken. Eksemplarisk stil for fremtidige vedlikeholdere — behold denne standarden når koden splittes opp videre.

**🟡 Gjeld — Inkonsekvent fallback: `||` vs `??`**

*script.js:41–44 (getText) vs script.js:430–439 (t)*

`getText()` bruker `value?.[lang] || value?.en`; `t()` bruker riktig `??`. En bevisst tom streng `""` som oversettelse ville falle tilbake til engelsk i `getText()`, men ikke i `t()`. Lav praktisk risiko i dag, men verdt å rette for konsistens.

**🟡 Gjeld — Ingen automatiserte tester av kjernelogikken**

*script.js: diffInNights, expandBlockedDates, isRangeClear, calculateBookingPrice*

Nettopp den typen ren, edge-case-tung logikk som er billig å teste og der en regresjon koster mest — spesielt den dagen flere property-nettsteder deler samme kjerne og en "liten fiks" et sted lekker inn en bug alle steder.

**Anbefaling:** ikke bygg full E2E-testing nå. Legg heller til et lett sett unit-tester (Vitest eller ren Node-assert) for nettopp disse fire funksjonene før dere kopierer malen til property #2.

---

## 07 Feilhåndtering og validering

**🟢 OK — `safeStorageGet/Set` beskytter mot at localStorage kaster**

*script.js:8–22*

Dekker Safari privat-modus, sandkasse-iframes og `file://`-opprinnelse. Et lite steg mange team hopper over — gjort riktig her.

**🟠 Bør fikses — Ingen toppnivå try/catch rundt config-bruk**

*script.js:41 (getText), 131–160 (renderStaticContent)*

**Hvorfor det betyr noe:** `site-data.js` er ment å bli hånd-redigert for hver ny property. En manglende komma eller ubalansert klamme der gir i dag en blank/ødelagt side, uten noe tydelig varsel til personen som satt opp den nye eiendommen.

**Anbefaling:** pakk oppstarts-rendering i try/catch og vis en enkel synlig feilmelding (ikke bare en tom side) hvis `window.propertyConfig` mangler eller er malformert.

**🟢 OK — Skjemavalidering er ryddig og gir tydelige feilmeldinger**

*script.js:900–941 (isValidEmail, handleBookingRequestSubmit)*

Klient-side only, som forventet uten backend. Navn/e-post/telefon sjekkes med klare, oversatte feilmeldinger fremfor stille avvisning.

**🟠 Bør fikses — Ingen anti-spam på bestillingsskjemaet**

*index.html:292–325 (bookingRequestForm)*

Irrelevant risiko i dag siden skjemaet ikke sender noe sted ennå — men **må** på plass samtidig som ekte innsending kobles til (se 🔴-punktet i Booking-flyt), ellers er dette en åpen spam-kanal fra dag én.

**Anbefaling:** en enkel honeypot-input holder lenge; ingen grunn til CAPTCHA på et lite kontaktskjema.

---

## 08 Sikkerhet

**🟠 Bør fikses — GA4 og Microsoft Clarity lastes uten samtykke**

*index.html:9–31*

**Hvorfor det betyr noe:** ingen samtykkebanner før sporingsskript kjører. Lav risiko for én Thailand-basert villa i dag, men blir en reell juridisk eksponering (GDPR/CCPA) idet malen selges/brukes for eiendommer med EU/UK-gjester eller EU-baserte eiere.

**Anbefaling:** vurder et enkelt samtykke-lag før kommersiell utrulling til flere markeder — ikke nødvendigvis før property #1 lanseres i Thailand.

**🟢 OK — Ingen brukerinput rendres via `innerHTML` i dag**

*script.js (alle innerHTML-kall)*

Alt som settes med `innerHTML` kommer fra den lokale, tiltrodde `site-data.js`/`translations.js` — aldri fra gjestens skjemafelter. Ingen XSS-vei i dagens kode.

**Fremtidsnotat:** når et admin-dashboard skal vise innsendte navn/meldinger, bruk `textContent` der — ikke gjenbruk innerHTML-mønsteret ukritisk for brukerdata.

**🟢 OK — Ingen npm-avhengigheter**

*hele prosjektet*

Null supply-chain-overflate i frontend. Ikke noe å patche, ikke noe som kan bli kompromittert via en pakkeoppdatering.

---

## 09 Performance

**🟠 Bør fikses — Bilder mangler lazy-loading, dimensjoner og responsive varianter**

*script.js:87–99 (renderGallery)*

8 bilder opp til ~272 KB rendres uten `loading="lazy"`, uten `width`/`height` (CLS-risiko), og uten `srcset`/`sizes` — mobil laster samme fil som desktop.

**Anbefaling:** legg `loading="lazy"` på galleribilder (behold hero eager/high-priority), sett eksplisitte dimensjoner, og vurder 2–3 bildestørrelser per foto.

**🟢 OK — Fonts og analytics lastes riktig**

*index.html:44–49, 9–31*

`preconnect` + én samlet Google Fonts-forespørsel + `display=swap`. GA/Clarity lastes async, blokkerer ikke rendering.

**🟡 Gjeld — CSS er én uminifisert 1471-linjers fil**

*style.css*

Uproblematisk i dag — bildevekt dominerer totalvekten uansett. Verdt en enkel minifiseringssjekk når det er flere properties i drift og hver kilobyte multipliseres.

---

## 10 Responsive / mobile UX

**🟢 OK — Tre gjennomtenkte brytningspunkter med reell omflyt**

*style.css:1229–1472 (1100px / 800px / 560px)*

Ikke bare skalering — grid-kolonner, gallerispenn og navigasjon endrer seg reelt for hvert steg. Solid grunnarbeid, ingen grunn til å røre dette nå.

**🟡 Gjeld — Touch-mål under anbefalt minimum på enkelte knapper**

*style.css:825–836 (guest-btn, 32px), 663–673 (cal-nav, 34px)*

Gjest-stepper og kalendernavigasjon er under de ~44px som vanligvis anbefales for komfortable touch-mål på mobil. Ikke en blokkerende feil, men merkbart på små skjermer.

---

## 11 Accessibility

**🟠 Bør fikses — Kontrastforhold under WCAG AA for gjennomgående brødtekst**

*style.css:8 (--muted #718078) mot style.css:2 (--cream #f3efe6)*

**Målt:** ~3.6:1 — under kravet på 4.5:1 for normal tekststørrelse. Brukes i `.section-intro`, `.intro-text`, `.secondary-text` og de fleste labels, altså store deler av sidens brødtekst.

**Anbefaling:** mørk `--muted` noen få trinn (mot f.eks. `#5c6b63`) for å nå 4.5:1 uten å endre paletten merkbart visuelt.

**🟠 Bør fikses — Lightbox mangler fokusfelle og dialog-semantikk**

*index.html:399–410, script.js:219–256*

Ingen `role="dialog"`, `aria-modal="true"`, og ingen fokusfelle — en tastaturbruker kan tabbe ut av det åpne lightbox-et og videre inn i siden bak.

**🟡 Gjeld — Diverse manglende ARIA-tilstander**

*index.html:70–74 (språkknapper), 76–79 (hamburgermeny)*

Språkbytte-knapper mangler `aria-pressed`/`aria-current` (kun CSS-klasse viser aktivt språk). Hamburgermeny mangler `aria-expanded`. Kalenderdatoer har kun ISO-datostrengen som `aria-label` — ingen forklaring på *hvorfor* en dato er deaktivert.

---

## 12 SEO

**🔴 Kritisk — Tittel og meta description oppdateres aldri ved språkbytte**

*index.html:35–38, script.js: setLanguage()*

**Hvorfor det betyr noe:** hele resten av siden bytter korrekt til thai, men nettleserfane og søkemotor-metadata forblir alltid engelsk. Thai-oversettelsene finnes, men er usynlige for både brukere som ser fanetittelen og søkemotorer som leser meta-taggene.

**Anbefaling:** la `setLanguage()` også oppdatere `document.title` og meta description-innholdet fra config.

**🟠 Bør fikses — Ingen separate URL-er eller hreflang for thai-versjonen**

*hele siden — én URL, klient-side språkbytte*

Alt skjer via JS-toggle på samme URL. Google indekserer i praksis kun den engelske versjonen, selv om komplette thai-oversettelser finnes og kunne gitt reell søketrafikk fra det thailandske markedet.

**🟡 Gjeld — Ingen strukturert data, sitemap eller social-metadata**

*index.html \<head>*

Ingen JSON-LD (LodgingBusiness/VacationRental) — går glipp av rich snippets i søkeresultater. Ingen `robots.txt`, `sitemap.xml` eller canonical-tag. Ingen Open Graph/Twitter Card — spesielt relevant siden Facebook er hovedkanalen for kontakt/markedsføring i dag, og lenker delt dit i dag får en ustyrt forhåndsvisning.

---

## 13 i18n / språk

**🟢 OK — verifisert — Full nøkkelparitet mellom engelsk og thai**

*translations.js:1–227*

Kjørt programmatisk diff: 85/85 nøkler til stede i begge språk, ingen manglende oversettelser, ingen mismatch i `{n}`/`{date}`-parametre mellom språkversjonene. Dette er ikke gjettet — det er telt.

**🟢 OK — Riktig størrelse på løsningen for to språk**

*translations.js, data-i18n-attributter*

Flate nøkkel/verdi-ordbøker og `data-i18n`-attributter er lett å lese og vedlikeholde. Ingen grunn til å innføre et tungt i18n-bibliotek for to språk.

---

## 14 Analytics / GA4

**🟡 Gjeld — Ingen egendefinerte hendelser for bestillingstrakten**

*script.js: handleCheckAvailability, showBookingRequestForm, handleBookingRequestSubmit*

GA4 sporer i dag kun sidevisning. Ingen event for "sjekket tilgjengelighet", "startet forespørsel" eller "sendte forespørsel". Blir mer verdifullt jo flere eiendommer skal sammenlignes på konvertering — ikke kritisk for én villa alene.

**Anbefaling:** legg til 3–4 `gtag('event', …)`-kall på nøkkelpunktene i bookingflyten når dere først rører den filen.

---

## 15 Bilder / assets

**🟢 OK — Favicon-oppsettet er faktisk komplett**

*index.html:40–42*

`favicon.ico` + webp-ikon + apple-touch-icon, alle til stede. Ikke noe å endre her — lett å overse som "ferdig" fordi det sjelden nevnes.

**🟡 Gjeld — Ingen dokumentert sjekkliste for bildeoptimalisering per ny property**

*assets/images/\*.webp (150–272 KB per fil)*

Manuelt, repetitivt arbeid som lett glemmes for property #3, #4, #5 — hver ny eier laster opp egne feriebilder rett inn uten komprimering/resizing.

**Anbefaling:** en enkel "ny property"-sjekkliste (maks filstørrelse, anbefalt oppløsning, webp-konvertering) holder lenge — ingen automatisert pipeline nødvendig ennå.

---

## 16 Hva blir vanskelig med mange properties

### De fire tingene som faktisk brekker først

- **Analytics-ID-er** hardkodet i HTML → krysskontaminert trafikkdata mellom eiendommer (se §02).
- **SEO-metadata** hardkodet i HTML → hver ny property krever manuell head-redigering (se §02).
- **`script.js` uten moduler** → en bugfiks må manuelt kopieres inn i hvert property-repo, med fare for at de driver fra hverandre (se §01).
- **Ingen skjema for `site-data.js`** → ingen måte å validere en ny propertys config før den går i produksjon (se §01).

### Det som *ikke* blir vanskelig

- Selve booking-motoren (kalender, priskalkulasjon, dato-validering) er allerede skrevet generisk nok til å tåle mange properties uendret.
- Innholds-rendring via `data-property-*` skalerer fint — det er unntakene fra mønsteret som må ryddes, ikke mønsteret selv.
- Fravær av rammeverk/build er ikke en skaleringsbegrensning på dette stadiet — det blir først relevant når 10+ properties skal driftes samtidig fra én kodebase.

---

## 17 Hva som bør flyttes til backend senere

### Når backend først bygges, bør det eie

- **Mottak og lagring av bestillingsforespørsler** — erstatter `submitBookingRequest()`-stubben (§03).
- **Reservasjons-lås ved innsending** — den reelle fiksen for dobbeltbooking-risikoen (§03).
- **Blokkerte datoer som delt tilstand** — i stedet for hånd-redigert `site-data.js` per eiendom, med rom for iCal/kanalhåndterings-sync (integrasjonspunktene er allerede forberedt: site-data.js:137–140).
- **Server-side validering** av skjemainnhold — klientvalidering finnes, men er ikke nok alene når data faktisk skal lagres.

### Kan vente enda lenger

- Sesong-/rabattregler — bygg først når prislogikken faktisk trenger å variere (§04).
- Ekte betalingsintegrasjon — ikke antydet noe sted i dagens flyt, som fortsatt er "forespørsel bekreftes manuelt".

---

## 18 Hva dashboardet bør kunne styre

### Naturlige dashboard-felt (allerede isolert i config)

- Tekstinnhold: hero, about, location-tekster, fakta, amenities — alt allerede i `site-data.js`.
- Galleri-bilder og rekkefølge.
- Pris per natt, gebyrer, min/maks opphold, booking-horisont.
- Blokkerte datoer (kalender-UI over dagens hånd-redigerte array).
- Kontaktinfo: telefon, e-post, sosiale lenker.

### Bør trolig *ikke* være dashboard-styrt ennå

- SEO-metadata og analytics-ID-er — bør fikses som kodefelt *før* dashboard, ikke løses *av* dashboard (§02) — å bygge et dashboard-felt for noe som i dag ikke engang leser fra config, bare flytter samme bug til et nytt sted.
- Ikoner/layout-klasser (f.eks. `span: "is-large"` i galleriet) — utviklerdetaljer, ikke eierinnhold.
- Sesong-/rabattstruktur — ikke bygg dashboard-UI for noe som ikke finnes i datamodellen ennå (§04).

---

## 19 Ting som kan bli teknisk gjeld

Ingen av disse haster — de er samlet her fordi de blir dyrere å rette jo flere properties som er avhengige av koden når dere kommer dit.

### Vokser stille med antall properties

- Manglende tester av kjernelogikk (§06) — én regresjon rammer alle eiendommer samtidig.
- Monolittisk `script.js` uten moduler (§01) — patching blir manuelt arbeid per repo.
- Manuell bildeoptimalisering (§15) og validering-repetisjon (§05) — begge er "gjør det samme igjen og igjen riktig hver gang"-oppgaver, den typen som glipper under tidspress.

### Billig å rette nå, dyrt å utsette

- `||` vs `??`-inkonsekvensen (§06) — fem minutters fiks i dag, forvirrende å spore opp senere.
- De hardkodede analytics/SEO/Facebook-feltene (§02) — hver dag dette står slik, øker sjansen for at det kopieres videre til enda en property.

---

## → Prioritert roadmap

Bygget for å matche måten dere allerede jobber på: frontend-grunnmuren ferdigstilles i egne, avgrensede steg — ingen backend eller dashboard før fase 4.

### Fase 0 — Gjør produktet reelt (blokkerer kommersiell bruk uansett antall properties)

*Frontend-only*

1. Koble **`submitBookingRequest()`** til en ekte innsendingstjeneste (Formspree/EmailJS/minimal endpoint) — §03.
2. Flytt **GA4- og Clarity-ID** fra `index.html` til `site-data.js` — §02.
3. Koble **tittel/meta description** til config, og la `setLanguage()` oppdatere dem ved språkbytte — §02, §12.
4. Rett de **tre hardkodede Facebook-lenkene** til å bruke `data-property-contact-link` — §02.

Hvorfor først: uten disse fungerer ikke produktet for property #1 heller — dette er ikke skalerings-arbeid, det er "virker det i dag"-arbeid.

### Fase 1 — Produksjonsherding for property #1

*Frontend-only*

1. Legg til **honeypot/anti-spam** på bestillingsskjemaet, samtidig med fase 0, punkt 1 — §07.
2. Rett **kontrastforhold** på `--muted`, legg til **fokusfelle + dialog-semantikk** på lightbox — §11.
3. **Bildeperformance:** `loading="lazy"`, eksplisitte dimensjoner, vurder responsive varianter — §09.
4. Toppnivå **try/catch** rundt config-lasting med synlig feilmelding — §07.
5. Grunnleggende **SEO-hygiene:** robots.txt, sitemap.xml, canonical, Open Graph/Twitter Card, JSON-LD — §12.

Hvorfor nå: dette er ting en reell gjest eller søkemotor møter allerede ved lansering av property #1 — ingen av dem krever at property #2 finnes ennå.

### Fase 2 — Forbered faktisk gjenbruk (fortsatt uten backend)

*Frontend-only*

1. Skriv en **"ny property"-sjekkliste**: hvilke felt i `site-data.js` må endres, bildekrav, hva som IKKE skal røres i HTML — samler opp §02, §15.
2. Flytt **locale/valuta** ut av `NUMBER_LOCALES` og inn i config — §02.
3. Legg til **lette unit-tester** for dato-/prislogikken før den kopieres til flere repoer — §06.
4. Rydd opp **`||` vs `??`**-inkonsekvensen og det døde `locationBody2`-feltet — §01, §06.
5. Vurder å formalisere et **JSON Schema** for `propertyConfig` — forberedelse til dashboard, ikke dashboardet selv — §01, §18.

Hvorfor nå og ikke senere: dette er akkurat den typen arbeid som er billig med én property og kostbart å gjøre retroaktivt på fem.

### Fase 3 — Første steg mot backend — først når fase 0–2 er stabile på minst én reell property

*Backend starter her*

1. Erstatt hånd-redigert `blockedDates` med en **delt datakilde** + reservasjons-lås ved innsending — den reelle fiksen for dobbeltbooking — §03, §17.
2. Server-side **lagring og varsling** av bestillingsforespørsler.
3. Vurder **iCal/kanalhåndterings-sync** — integrasjonspunktene er allerede forberedt i `site-data.js` og venter kun på å bli koblet til.

Hvorfor ikke før: å bygge dette før frontend-grunnmuren er ferdig løser et problem (dobbeltbooking) dere ikke har testet i praksis ennå, på bekostning av ting som allerede er kjente hull.

### Fase 4 — Admin-dashboard

*Etter backend*

1. Bygg dashboard-UI for feltene listet i §18 — innhold, priser, kalender, kontaktinfo.
2. Hold SEO-metadata, analytics-ID-er og layout-detaljer **utenfor** første dashboard-versjon — de bør allerede være riktige kodefelt fra fase 0.

Sist fordi et dashboard uten et stabilt, testet, skjema-validert config-lag under seg bare gir dere et penere UI for å produsere de samme feilene raskere.

---

Ingen kode er endret som del av denne gjennomgangen. Alle linjereferanser peker til filenes tilstand per commit `23921bd` (20.08.2026). Kontrastberegningen i §11 er utført manuelt etter WCAG 2.1-formelen for relativ luminans; verifiser med et automatisk verktøy (f.eks. axe eller Lighthouse) før endring.

---

## Implementation Status

*Sist oppdatert: 2026-08-20, basert på `git log 23921bd..HEAD` og en direkte gjennomgang av dagens kode i denne økten (inkl. config loading/error handling i `script.js`, en målt srcset/sizes-kost/gevinst-analyse, og §10 sitt touch-mål-funn fikset og verifisert i nettleser på desktop + mobil). Alle linjereferanser i audit-en over er fra commit `23921bd` og kan ha flyttet seg siden — dette punktet dokumenterer kun *hvorvidt* et funn er adressert, ikke oppdaterte linjenumre. Et punkt er kun merket ferdig når det er verifisert direkte mot koden slik den står nå, ikke antatt fra commit-meldinger alene.*

Commits siden audit-punktet (`23921bd`), eldst først:

- `7c347e9` — Add Formspree booking submission
- `00d86be` — Make analytics property-configurable
- `a0daf7e` — Make SEO property-configurable
- `4bf7ee3` — Fix top 6 accessibility issues from audit
- `c281c71` — Fix accessibility issues 7-12 from audit
- `a9b98bf` — docs: add senior code audit and implementation status
- `514b97c` — Improve image loading performance
- `b40e2d9` — Wire Facebook links to data-property-contact-link, sync audit status
- `ebe8899` — Add robots.txt and sitemap.xml for SEO hygiene
- `934b6c5` — Add config loading error handling for site-data.js
- `141e3da` — Expand guest-btn/cal-nav touch targets to 44x44px
- *(uncommitted, tidligere denne økten)* — Ingen kodeendring: kost/gevinst-analyse av `srcset`/`sizes` (Fase 1, gjenstående del av punkt 3), konklusjon dokumentert under, punktet bevisst utsatt
- *(uncommitted, denne økten)* — **Fase 2, punkt 1: [PROPERTY-CHECKLIST.md](../PROPERTY-CHECKLIST.md) opprettet.** Ren analyse-/dokumentasjonsbatch, ingen kodeendring. Hele repoet ble kartlagt på nytt felt for felt (site-data.js, index.html, script.js, scripts/sync-seo.js, style.css, translations.js, assets/images, robots.txt, sitemap.xml) og sammenlignet direkte mot koden slik den står i dag — ikke mot audit-ens opprinnelige linjereferanser. Se "Fase 2" og "Nye funn denne økten" under.
- *(uncommitted, denne økten)* — **Fase 2, punkt 2: `NUMBER_LOCALES` flyttet fra `script.js` til `booking.numberLocales` i `site-data.js`.** `formatMoney()` leser nå config med et treleddet fallback-kjede (manglende objekt → manglende språknøkkel → hardkodet `DEFAULT_NUMBER_LOCALE = "en-US"`, med try/catch rundt selve `toLocaleString()`-kallet for en ugyldig locale-streng). Verifisert i nettleser: EN/TH prisvisning, booking price/request/success-sammendrag og fallback-scenarioene (manglende config, manglende språknøkkel, ugyldig locale-streng) — se "Fase 2" under for full detalj.

### Fase 0 — Gjør produktet reelt

1. ✅ **`submitBookingRequest()` koblet til ekte tjeneste** (`7c347e9`) — sender nå til Formspree (`FORMSPREE_ENDPOINT` i script.js), inkludert CC til eierens kontakt-e-post fra `site-data.js` (`booking.contact.email`). §03 er lukket.
2. ✅ **GA4/Clarity-ID flyttet til config** (`00d86be`) — `site-data.js` har nå `analytics.ga4MeasurementId` / `analytics.clarityProjectId`, lastet dynamisk av `initAnalytics()` i script.js med formatvalidering. index.html har ikke lenger noen ID-er i `<head>`. §02 (analytics-delen) er lukket.
3. ✅ **Tittel/meta description koblet til config + oppdateres ved språkbytte** (`a0daf7e`) — `site-data.js` har et `seo`-block; `scripts/sync-seo.js` genererer den statiske HTML-en (for lenke-forhåndsvisnings-roboter), og `applySeoMeta()` i script.js oppdaterer `document.title`/meta description dynamisk hver gang `setLanguage()` kjører. Verifisert: `renderStaticContent()` kaller `applySeoMeta()`, og `setLanguage()` kaller `renderStaticContent()`. §02 (SEO-delen) og §12 sitt kritiske funn er begge lukket.
4. ✅ **Facebook-lenkene koblet til `data-property-contact-link`** — "Contact Owner"-knappen ([index.html:363](../index.html)) og footer "Social"-lenken ([index.html:391](../index.html)) er nå `href="#" data-property-contact-link`, satt til `config.contactUrl` av den eksisterende `script.js:177`-handleren. Footer-kontaktlenken ([index.html:382–383](../index.html), `data-property-email`) var allerede korrekt config-drevet fra før (faller tilbake til `config.contactUrl` når `config.email` er tom) og ble bevisst ikke rørt, for ikke å ødelegge fallback til ekte e-post når en property får en. Verifisert i nettleser: begge nye lenkene, den eksisterende e-post-fallback-lenken og telefonlenken resolver alle korrekt fra `site-data.js`, ingen konsollfeil. §02 sitt 🟠-funn er lukket.

### Fase 1 — Produksjonsherding for property #1

1. ✅ **Honeypot/anti-spam** (kom med `7c347e9`) — skjult `_gotcha`-felt i skjemaet (`reqCompany`), og `submitBookingRequest()` returnerer stille suksess uten å sende noe hvis feltet er utfylt.
2. ✅ **Kontrastforhold på `--muted`** (`4bf7ee3`) — verifisert i style.css: `--muted: #5c6b63` (var `#718078` i audit-en), akkurat verdien audit-en foreslo.
   ✅ **Lightbox fokusfelle + dialog-semantikk** (`4bf7ee3`) — verifisert: `role="dialog"`, `aria-modal="true"` og `aria-labelledby` på lightbox-elementet, Tab-fokusfelle og fokus-gjenoppretting til triggerelementet i script.js.
3. 🟡 **Delvis, resten bevisst utsatt** (`514b97c`) — galleri- og about-bilder har nå `loading="lazy"`, `decoding="async"` og eksplisitte `width`/`height` (fra nye `width`/`height`-felt på hvert `gallery`-objekt i `site-data.js`, brukt av `renderGallery()` i script.js). Hero-bildet har fått `<link rel="preload">` + `fetchpriority="high"` for raskere LCP. De 8 galleri-WebP-filene er også rekomprimert (~19 % mindre totalt, samme dimensjoner). Verifisert direkte i index.html, script.js og site-data.js.

   **`srcset`/`sizes`: analysert denne økten, bevisst utsatt.** Se full begrunnelse under "Bevisst utsatt" i oppsummeringen nederst. Kort versjon: målte faktiske pikseldimensjoner (WebP-header, ikke config) mot faktisk visningsbredde i style.css sitt grid — hero (LCP-kritisk) er allerede nær ideelt dimensjonert (~1080px fil vs. ~1.3-1.4x visningsbredde på vanlig desktop), så gevinsten der er tilnærmet null. Gallery-thumbnails er oversamplet på mobil (opp mot 4x visningsbredde i én-kolonne-layout ved ≤560px), men er allerede `loading="lazy"` — kostnaden av oversamplingen rammer kun brukere som faktisk scroller gjennom hele galleriet, ikke LCP/FCP/CLS. Å hente ut den gevinsten uten build/image-pipeline krever manuell generering og vedlikehold av 2-3 ekstra filstørrelser per bilde (16-24 ekstra filer for denne ene propertyen), et arbeid som må gjentas for hver fremtidig property — direkte i konflikt med §15/§19/Fase 2 punkt 1 sitt allerede identifiserte, uløste gap rundt manuell bildehåndtering uten sjekkliste/pipeline. Punktet blir stående på roadmapen (se "Neste naturlige steg").
4. ✅ **Config loading/error handling implementert og testet** (denne økten, `script.js`) — en liten, avgrenset løsning uten skjema/framework/nye filer:
   - `reportConfigError(message, error)` ([script.js:24-44](../script.js)): logger et tydelig, prefikset `console.error("[site-data.js] ...")` og viser/utvider én synlig banner øverst på siden (`role="alert"`, ren inline-styling, ingen dismiss-knapp). Én banner-instans gjenbrukes — flere feil legges til som egne linjer i stedet for flere bannere.
   - `renderFacts()`, `renderGallery()`, `renderAmenities()`, `renderLocationHighlights()` har hver fått en `Array.isArray(config.X)`-guard ([script.js:98-171](../script.js)) i samme stil som den eksisterende valideringen i `expandBlockedDates()`. Et manglende/feilformet felt rapporteres med feltnavn, den ene seksjonen lar grid stå tom, og resten av siden (inkl. de tre andre seksjonene og booking) påvirkes ikke.
   - `renderStaticContent()` har fått et try/catch-sikkerhetsnett rundt hele kroppen (etter den eksisterende `if (!config) return`) ([script.js:200-243](../script.js)) som fanger alt de fire guard'ene ikke dekker, uten å kaste videre — det er nettopp det som tidligere kunne stoppe `setLanguage()` midt i og dermed hindre `initBooking()` i å kjøre i det hele tatt.
   - Init-sekvensen nederst ([script.js:1333-1350](../script.js)): eksplisitt sjekk av manglende `window.propertyConfig` (én tydelig melding), `setLanguage(currentLanguage)` pakket i try/catch, og `initBooking()` byttet til `initBooking().catch(...)` siden en synkron feil før første `await` i en async-funksjon blir en unhandled promise rejection, ikke en fangbar exception ved kallstedet.
   - `initAnalytics()` og `applySeoMeta()` er **ikke rørt** — de fungerte allerede korrekt (egen try/catch, fallback til `{}`/tomme verdier) og er bevisst latt være som de er.
   
   **Testet i nettleser** (lokal preview, `python -m http.server`), seks scenarioer, alle bekreftet:
   - Normal config: alt rendres korrekt (5 facts, 8 gallery, 10 amenities, 4 location highlights, 31 kalenderdager), ingen banner, ingen konsollfeil.
   - Manglende `window.propertyConfig` (testet med en midlertidig kopi av `index.html` uten `site-data.js`-scripttaggen, slettet etter test): banner + `console.error` vises, booking-seksjon og nav-lenke skjules som før (`display: none`), siden krasjer ikke, resten av layouten er intakt.
   - Manglende/ugyldig content-felt (`amenities` slettet, `gallery` satt til en streng): nøyaktig to `console.error`-linjer med feltnavn, `amenitiesGrid`/`galleryGrid` tomme, mens `facts` (5) og `locationHighlights` (4) fortsatt rendres normalt.
   - Booking-flow med gyldig config: kalendervalg → "Check Availability" → riktig tilgjengelighets-/prissammendrag (10 000 THB × 1 natt), fungerer identisk med før endringen.
   - Samme booking-flow kjørt på nytt **med** ødelagt `amenities`/`gallery` samtidig: booking fullføres helt uendret — bekrefter at et content-feltfeil ikke stopper booking.
   - Uventet feil injisert direkte i `config.booking` (en getter som kaster): banner + `console.error` med stack trace vises, men facts/gallery/amenities/SEO-tittel rendres fullstendig uendret — bekrefter isolasjon også den andre veien.
   - Ugyldig `analytics` (tall i stedet for objekt) og `seo: null`: ingen krasj, ingen banner (fordi eksisterende fallback-logikk i `initAnalytics()`/`applySeoMeta()` allerede håndterer dette uten feil), `document.title`/meta description falt korrekt tilbake til `config.name`/`heroDescription`, booking upåvirket.
   - Normal side: verifisert på nytt i en helt fersk fane etter alle testene — fortsatt ingen konsollfeil.
   
   §07 sitt 🟠-funn ("Ingen toppnivå try/catch rundt config-bruk") og Fase 1 punkt 4 er dermed lukket.
5. 🟡 **Delvis** — Open Graph og Twitter Card-metadata er på plass (generert av `scripts/sync-seo.js`, verifisert i index.html). **Nytt denne økten:** `robots.txt` (statisk, `Allow: /`, med kommentar om å legge til `Sitemap:`-linje når domene er satt) og `sitemap.xml` (generert av `scripts/sync-seo.js`, valid tomt `<urlset>` så lenge `seo.siteUrl` er tom — fylles automatisk med `<url><loc>` for forsiden neste gang scriptet kjøres etter at `siteUrl` er satt). Begge verifisert: servert korrekt fra lokal preview (`/robots.txt`, `/sitemap.xml`), XML validert som velformet (Chrome sin innebygde XML-parser), og manuelt testet at `buildSitemapXml()` produserer riktig `<loc>` når `siteUrl` er satt. Canonical-tag og JSON-LD strukturert data finnes fortsatt ikke — canonical er allerede kodeferdig i `sync-seo.js` og aktiveres automatisk når `siteUrl` settes; JSON-LD er bevisst utsatt til domenet er reelt (se vurdering under).

### Fase 2 — Forbered faktisk gjenbruk

1. ✅ **"Ny property"-sjekkliste skrevet** — [PROPERTY-CHECKLIST.md](../PROPERTY-CHECKLIST.md), denne økten. Dekker alle 11 punkter bedt om (identity/branding, tekst, bilder, lokasjon/kart, kontakt/social, booking/pris, analytics, SEO, språk, deployment/verifisering, samt en samlet liste over alt som fortsatt krever manuell kodeendring). Hvert punkt er verifisert direkte mot koden slik den står i dag, med fil:linje-referanser — ikke antatt. Ingen kode er endret, ingen JSON Schema/testsystem/refaktorering er påbegynt (bevisst, se oppdragsbeskrivelse for denne batchen).
2. ✅ **`NUMBER_LOCALES` flyttet til config** (denne økten) — analysert først: konstanten brukes utelukkende av `formatMoney()` (script.js) for tallformatering (gruppe-/desimalskilletegn), ikke for valutasymbol (kommer fra `booking.currency`, ren streng) og ikke for kalenderens måneds-/ukedagsnavn eller dato-strenger som "24 August 2026" (de kommer fra `translations.js` via `formatDisplayDate()`/`calendarMonths`, uavhengig av `NUMBER_LOCALES`) — så endringen har ingen sideeffekt på datoformatering.
   - **Plassering:** lagt til som `booking.numberLocales: { en: "en-US", th: "th-TH" }` i [site-data.js](../site-data.js), rett ved siden av `currency` — den eksisterende config-strukturen den faktisk hører sammen med (audit-ens egen §02-tekst kobler «valuta/locale-mapping» sammen). Ingen ny toppnivå-struktur, intet generelt i18n-rammeverk, `translations.js` ikke rørt, språkvelgeren ikke rørt, ingen nye språk lagt til — i tråd med scope for denne batchen.
   - **script.js:** `formatMoney()` leser nå `window.propertyConfig.booking.numberLocales` i stedet for den hardkodede konstanten, med tre lag fallback: manglende `numberLocales`-objekt → `{}`, manglende språknøkkel → `numberLocales.en`, og til slutt en ny konstant `DEFAULT_NUMBER_LOCALE = "en-US"`. En ugyldig locale-streng (som ville kastet `RangeError` fra `toLocaleString`) fanges i try/catch og faller tilbake til `DEFAULT_NUMBER_LOCALE` med én `console.warn` — samme stil som den eksisterende analytics-ID-valideringen i `initAnalytics()`. Dette var nødvendig fordi feltet nå er hånd-redigerbart per property og en tastefeil i en locale-streng tidligere ikke var mulig (konstanten var alltid gyldig).
   - **Testet i nettleser** (samme lokale preview-instans som resten av økten), alle scenarioer bekreftet direkte mot DOM/`window.propertyConfig`, ikke antatt:
     - Normal config, EN: rate-note viser "10,000 THB / night", ingen konsollfeil.
     - Normal config, TH: rate-note viser "10,000 THB / คืน", identisk tallformat som EN (begge locales bruker komma som tusenskilletegn) — bekrefter at TH fortsatt fungerer uendret.
     - Booking price summary (`bookingPriceEstimate`, resultatpanelet etter "Check Availability"): "10,000 THB × 2 nights → 20,000 THB → Estimated total 20,000 THB" — korrekt for et 2-netters opphold.
     - Booking request-sammendrag (`bookingRequestSummary`, vist etter "Request to Book"): identisk prissammendrag som over.
     - Booking success-sammendrag (`bookingSuccessSummary`, vist etter innsending): identisk prissammendrag, testet ved å trigge honeypot-feltet (`reqCompany`) slik at hele innsendings-/render-koden kjører uten å faktisk sende noe til det ekte Formspree-endepunktet (§03/§07 sin eksisterende anti-spam-mekanisme brukt bevisst som en trygg testvei).
     - Kalender/datoformat (`formatDisplayDate`, kalendermåneder/-ukedager): verifisert kildekode-nivå at disse aldri leser `NUMBER_LOCALES`/`booking.numberLocales` i det hele tatt — ingen endring å teste i praksis, bekreftet uendret ved at "24 August 2026"/"24 สิงหาคม 2026"-strengene så identiske ut i alle summeringene over.
     - **Fallback-scenarioer** (kjørt direkte mot `formatMoney()` i konsollen, config midlertidig manipulert og gjenopprettet etterpå): manglende `booking.numberLocales` helt → `"12,345.6 THB"` (riktig, ingen krasj); `numberLocales` uten `th`-nøkkel mens siden var på thai → falt korrekt tilbake til `en`-verdien; ugyldig locale-streng (`"not-a-locale!!"`) → fanget, én `console.warn` logget, falt tilbake til `en-US`-formatering, ingen `console.error`, ingen krasj. Config gjenopprettet til original verdi etterpå, verifisert med en fersk sideinnlasting at `booking.numberLocales` fortsatt var `{ en: "en-US", th: "th-TH" }` og at rate-noten viste korrekt pris — ingen varig testforurensning.
     - Ingen nye `console.error` i noen av testene; det eneste konsoll-varselet som forekom var det bevisst fremprovoserte fallback-varselet fra ugyldig-locale-testen.
   
   §02 sitt 🟡-funn ("Valuta/locale-mapping er kode, ikke config") og Fase 2 punkt 2 er dermed lukket. `FORMSPREE_ENDPOINT` (script.js, se "Nye funn denne økten" under) er **ikke** rørt i denne batchen — det var eksplisitt utenfor scope for denne locale-fokuserte batchen og bør tas i en egen runde.
3. ❌ Ingen testfiler, testrammeverk eller `package.json` funnet i repoet — ingen unit-tester er lagt til for dato-/prislogikken.
4. ❌ `getText()` bruker fortsatt `||`, `t()` bruker fortsatt `??` — inkonsekvensen består. `locationBody2` finnes fortsatt i `site-data.js` uten noe tilhørende `[data-property-location-body-2]`-element i index.html — feltet er fortsatt dødt.
5. ❌ Ingen JSON Schema for `propertyConfig` funnet.

### Nye funn denne økten (fra PROPERTY-CHECKLIST.md-arbeidet, ikke i original-audit-en)

Disse dukket opp under felt-for-felt-kartleggingen for sjekklisten og var ikke eksplisitt navngitt i §02 av original-audit-en. Ingen av dem er fikset i denne økten — ren dokumentasjon, se [PROPERTY-CHECKLIST.md](../PROPERTY-CHECKLIST.md) seksjon 6, 3, 1 og 5 for detaljer.

- **🔴 `FORMSPREE_ENDPOINT` er hardkodet i `script.js:1128`, ikke i config.** Dette er det mest kritiske funnet: klones malen til property #2 uten at denne konstanten byttes, går alle bestillingsforespørsler fra den nye propertyen til property #1 sin Formspree-innboks — helt usynlig med mindre noen tester end-to-end. Bør trolig prioriteres sammen med analytics-ID-ene i en fremtidig "flytt til config"-runde, ettersom mønsteret (`analytics.ga4MeasurementId` osv.) allerede finnes å kopiere fra.
- **⚠️ About-seksjonens bilde (`index.html:147–150`) er 100 % utenfor config-systemet** — verken `src` eller `alt` er koblet til noe `data-property-*`-attributt eller config-felt, i motsetning til alle andre bilder på siden.
- **⚠️ `google-site-verification`-taggen (`index.html:7`) er domene-spesifikk og fullstendig hardkodet**, utenfor både `seo`-blokken i site-data.js og `scripts/sync-seo.js`. Krever en ny token fra Google Search Console per nytt domene.
- **⚠️ `photosUrl` (`site-data.js:108`) er et dødt config-felt**, samme situasjon som det allerede kjente `locationBody2` — `script.js:230` leser `[data-property-photos-link]`, men ingen HTML-element har det attributtet.
- **⚠️ Hero preload-lenken (`index.html:34`) synkroniseres ikke automatisk med `config.heroImage`** — må oppdateres manuelt i HTML hvis hero-bildets filnavn endres.

### Fase 3 — Backend

Ikke startet. Repoet inneholder fortsatt ingen server-/backend-kode — kun statiske filer (pluss en lokal `python -m http.server` for forhåndsvisning i `.claude/launch.json`). `blockedDates` er fortsatt en hånd-redigert liste i `site-data.js` uten reservasjons-lås.

### Fase 4 — Admin-dashboard

Ikke startet.

### Utover roadmapen: accessibility-arbeid i to omganger

Commit `4bf7ee3` og `c281c71` dekker til sammen mesteparten av §11 sitt "Diverse manglende ARIA-tilstander"-funn, samt noen touch-target- og fokus-relaterte forbedringer audit-en ikke eksplisitt ba om:

- ✅ Språkbytte-knapper har nå `aria-pressed`, synkronisert i `setLanguage()` (`c281c71`).
- ✅ Hamburgermeny har nå `aria-expanded`/`aria-controls` og korrekt label (`c281c71`).
- ✅ Hamburgerknappens touch-mål ble utvidet til 44×44px (`4bf7ee3`) — men det var *ikke* de samme elementene audit-en pekte på i §10 (`guest-btn` 32px, `cal-nav` 34px). §10 sitt funn er nå adressert separat, denne økten (uncommitted): begge var fortsatt uendret i style.css ved verifisering — og `.cal-nav` viste seg faktisk å være verre enn audit-en dokumenterte, siden en egen mobil-override (`@media max-width: 560px`) krymper den ytterligere til 30×30px, altså minst treffflate nettopp på de smaleste skjermene.

  **Fiks:** lagt til en usynlig `44×44px` `::before`-pseudo-element sentrert over hver `.guest-btn`/`.cal-nav`-knapp (`position: relative` på knappen + `position: absolute` pseudo-element), i stedet for å endre selve `width`/`height`. Dette gir full 44×44px treffflate uten å endre knappenes synlige piksel-størrelse i det hele tatt — samme prinsipp som allerede brukt for `.menu-toggle` (`min-width/min-height: 44px` rundt en visuelt mindre glyph, style.css:200-209), men her som en fullstendig usynlig hitbox siden knappene er sirkulære og skal se identiske ut.

  **Verifisert i nettleser** (desktop 1280px og mobil 375px, live DOM-målinger, ikke antatt):
  - Synlig boks uendret: `guest-btn` ~31.5×31.5px, `cal-nav` 30×30px på mobil / ~33.5×33.5px på desktop — innenfor sub-piksel avrunding av originalverdiene (32px / 30px / 34px).
  - Usynlig treffflate bekreftet 44×44px via `getComputedStyle(el, '::before')` på begge elementer, begge breakpoints.
  - Ingen overlapp: gap mellom guest-minus/plus sin 44px-hitbox og gjeste-input er ~7.5px på både desktop og mobil; gap mellom cal-prev/next sin 44px-hitbox og månedslabelen er ~172px (desktop) / ~38.6px (mobil, smaleste kalender-container) — begge trygt positive.
  - Funksjonelt testet: gjeste-stepper (+/−) endrer verdi korrekt, kalendernavigasjon (‹/›) bytter måned korrekt, full booking-flyt (velg datoer → sjekk tilgjengelighet → resultat vises) fungerer uendret, på både 1280px og 375px viewport.
  - Ingen nye konsollfeil i noen av testene.
  - `.cal-day` (selve kalenderdatoene) ble også målt: ~33px på 375px mobilbredde, altså også under 44px — men å øke denne krever å regne om hele 7-kolonners kalendergrid-bredden, som ville krysse inn i kalender-redesign. Bevisst latt urørt; dokumentert som kjent, lavt-prioritert gap, ikke et nytt funn utover det §10 allerede dekket.
- ❌ Kalenderdatoer har fortsatt kun ISO-datostrengen som `aria-label` — ingen forklaring på *hvorfor* en dato er deaktivert. Denne spesifikke delen av §11-funnet er ikke adressert.
- **Ny funksjonalitet utover audit-scope:** `aria-live`-region for kalenderens månedsnavigasjon, fokushåndtering på anker-navigasjon (inkl. skip-to-main-content-lenke) og støtte for `prefers-reduced-motion` ble lagt til i `c281c71`. Ingen av disse var eksplisitte funn i denne audit-en, men styrker samme accessibility-område.

### Kort oppsummert

**Ferdig:** hele Fase 0 (inkl. Facebook-lenkene), honeypot + kontrast + lightbox-fokusfelle fra Fase 1, bildeperformance sin lazy-loading/dimensjons-del (`514b97c`), deler av §11 accessibility utover roadmapen, SEO-hygiene-batchen (`robots.txt` + `sitemap.xml`), config loading/error handling (`reportConfigError()` + array-guards + try/catch-sikkerhetsnett + async-riktig init-sekvens), §10 sitt touch-mål-funn (`guest-btn`/`cal-nav` opp til 44×44px reell treffflate via usynlig hitbox, `141e3da`) — dermed er hele Fase 1 fullført bortsett fra `srcset`/`sizes`, som er bevisst utsatt (se under), ikke gjenstående. **Fase 2, punkt 1** ([PROPERTY-CHECKLIST.md](../PROPERTY-CHECKLIST.md)) og **punkt 2** (`NUMBER_LOCALES` → `booking.numberLocales` i config, denne økten, uncommitted) er også ferdig — se "Nye funn denne økten" over for det som dukket opp underveis.

**Bevisst utsatt** (ikke gjenstående arbeid, men vurderinger gjort med fullt kost/gevinst-grunnlag):

- **Canonical-tag og JSON-LD strukturert data.** Canonical er allerede kodeferdig i `sync-seo.js` og trenger ingen ny kode — kun at `seo.siteUrl` fylles inn med et ekte domene. JSON-LD ble vurdert og bevisst holdt utenfor: et `LodgingBusiness`-skjema med feil/manglende felt (pris, adresse, bilder som endrer seg per property) er nettopp den typen "bygd fordi det var mulig" audit-en advarer mot i §19, og gir ingen reell verdi før siden faktisk er indekserbar på et ekte domene. Begge bør tas i samme omgang som §12 sitt gjenværende 🟠-funn (separate URL-er/hreflang for thai) — når domenet er satt.

- **`srcset`/`sizes` for responsive galleribilder (§09, Fase 1 punkt 3, rest).** Analysert denne økten med faktiske tall, ikke antagelser: WebP-headerne ble parset direkte for ekte pikseldimensjoner (bekreftet at `width`/`height` i config/HTML stemmer med filene), og disse ble holdt opp mot faktisk visningsbredde per breakpoint i style.css sitt gallery-grid (`is-large`/`is-medium`/`is-tall`, 12-kolonners grid, breakpoints ved 1100/800/560px).

  **Funn:** Hero — det eneste LCP-kritiske bildet — er allerede nær ideelt dimensjonert (1080px fil vs. ~1.3-1.4x faktisk visningsbredde på en vanlig 1920px desktop-skjerm), så `srcset` ville gitt tilnærmet null gevinst akkurat der ytelse teller mest. Gallery-thumbnails (1360px filer, 60-241 KB) er moderat oversamplet på desktop (~2.5x visningsbredde for `is-medium`-fliser) og tydelig oversamplet på mobil (~4x visningsbredde i én-kolonne-layout ved ≤560px). Lightbox viser samme fil som thumbnailen i opptil 1100px med `object-fit: contain`, så den trenger uansett hele originalfilen uansett hvilken thumbnail-størrelse som velges.

  **Hvorfor vi likevel utsetter:** (1) gevinsten sitter kun i galleriet, ikke i hero/LCP, og galleribildene er allerede `loading="lazy"` — oversamplingen koster båndbredde bare for besøkende som faktisk scroller gjennom hele galleriet, den påvirker ikke LCP/FCP/CLS. (2) Uten build/image-pipeline (eksplisitt uønsket nå) må 2-3 ekstra filstørrelser per bilde genereres og vedlikeholdes for hånd — 16-24 ekstra filer for denne ene propertyen, et arbeid som må gjentas identisk for hver fremtidig property. (3) Det kolliderer direkte med et allerede kjent, uløst gap: §15/§19 peker selv på manuell bildehåndtering uten sjekkliste/pipeline som voksende teknisk gjeld — å legge `srcset` oppå det nå gjør det gapet større, ikke mindre.

  **Forventet gevinst når det gjennomføres:** redusert datamengde for mobilbrukere som scroller gjennom galleriet (grovt anslått 40-70 % mindre pixel-data per synlig thumbnail på mobil, basert på ~4x → ~2x oversampling-reduksjon), ingen målbar endring i LCP siden hero ikke er target.

  **Hva må være på plass først:** enten (a) property #2 finnes og en delt "resize disse 3 størrelsene"-rutine faktisk er verdt å bygge/dokumentere for flere eiendommer samtidig, eller (b) et enkelt, lokalt engangs-script (f.eks. et `sharp`/`cwebp`-kall kjørt manuelt ved asset-forberedelse, ikke del av build/runtime) som genererer variantene — kombinert med den fortsatt manglende "ny property"-sjekklisten fra Fase 2 punkt 1, som `srcset` bør bakes inn i fra dag én i stedet for å legges på senere.

  Ikke en glemt revisjon — en bevisst prioritering: kost (evigvarende manuell multiplikator per bilde per property) vurdert høyere enn gevinst (moderat, mobil-only, ikke-LCP, allerede delvis dempet av lazy loading) med kun én property i drift.

**Neste naturlige steg** (i prioritert rekkefølge, følger roadmapens egen logikk):
1. Resten av Fase 2 (punkt 3–5) — punkt 1 (sjekkliste) og punkt 2 (`NUMBER_LOCALES`) er nå ferdig. De tre gjenstående (unit-tester, `||`/`??`-inkonsekvens + dødt `locationBody2`-felt, JSON Schema) er fortsatt ikke startet, og flere av dem er eksplisitt merket "billig å rette nå, dyrt å utsette" i audit-ens §19. Sjekklist-arbeidet avdekket også at `FORMSPREE_ENDPOINT` (script.js) bør vurderes flyttet til config i en egen runde — se "Nye funn denne økten" over. Det ble bevisst **ikke** gjort som del av `NUMBER_LOCALES`-batchen, siden de to har forskjellig alvorlighetsgrad (🟡 config-fleksibilitet vs. 🔴 feilsendte bestillinger) og ikke ble bedt om sammen.
2. Når `siteUrl` settes til et ekte domene: kjør `node scripts/sync-seo.js` på nytt (aktiverer canonical + fyller `sitemap.xml`), vurder JSON-LD og hreflang/separate URL-er for thai på nytt.
3. Når property #2 er reell, eller et enkelt lokalt resize-script er verdt å innføre: gjenåpne `srcset`/`sizes`-vurderingen over — grunnlaget (mål, breakpoints, filstørrelser) er allerede dokumentert her og trenger ikke gjøres på nytt.
