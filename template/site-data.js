// ============================================================================
// PROPERTY TEMPLATE — clean starting seed
// ============================================================================
// This file contains NO real property, customer, contact, analytics, booking
// or SEO data. Every value is a schema-valid placeholder that is obviously
// not real content. Booking and analytics are disabled.
//
// To create a new property: copy the contents of this /template/ folder into
// a brand-new, empty git repository — never clone an existing customer repo
// and never carry over .git history. Then replace every value below with the
// new property's real data. Full workflow: template/README.md.
//
// Must be replaced before launch (each MUST be newly created for the new
// property — never reuse another property's):
//   - every text field (en + th) — the schema requires both languages
//     non-empty on most fields
//   - assets/images/*  — placeholder images, not real photos
//   - favicon.ico / assets/images/favicon.png / apple-touch-icon.png
//   - analytics.ga4MeasurementId / analytics.clarityProjectId
//   - booking.formspreeEndpoint (a fresh Formspree form)
//   - seo.googleSiteVerification (a fresh, domain-specific token)
//   - seo.siteUrl (once the real domain is known)
//
// Validate after editing:  node scripts/validate-config.js
// Re-bake static SEO tags:  node scripts/sync-seo.js
// ============================================================================
window.propertyConfig = {
    name: { en: "TODO: Property name", th: "TODO: Property name" },
    location: { en: "TODO: City, Country", th: "TODO: City, Country" },
    heroTitle: { en: "TODO: Property name", th: "TODO: Property name" },
    heroDescription: {
        en: "TODO: one-sentence hero description of the property.",
        th: "TODO: professional Thai translation needed."
    },
    heroDetails: {
        en: "TODO: Pool · Bedrooms · Guests",
        th: "TODO: professional Thai translation needed."
    },
    heroImage: "assets/images/hero.png",
    // Optional. Empty th is allowed here (localizedTextOptional in the schema).
    heroImageAlt: { en: "TODO: hero photo alt text", th: "" },
    aboutTitle: {
        en: "TODO: about section heading.",
        th: "TODO: professional Thai translation needed."
    },
    aboutBody: {
        en: "TODO: first about paragraph.",
        th: "TODO: professional Thai translation needed."
    },
    aboutBody2: {
        en: "TODO: second about paragraph.",
        th: "TODO: professional Thai translation needed."
    },
    // Optional. If omitted entirely, the src/alt hardcoded in index.html stay.
    aboutImage: {
        src: "assets/images/about.png",
        alt: { en: "TODO: about photo alt text", th: "" }
    },
    // icon must be one of the fixed keys in schema/property-config.schema.json
    // (bed, bath, users, pool, pin, wifi, snow, kitchen, car, laundry, tv,
    // grill, table). An unknown key silently falls back to the "pin" icon.
    facts: [
        { key: "bedrooms", value: "00", label: { en: "Bedrooms", th: "ห้องนอน" }, icon: "bed" },
        { key: "bathrooms", value: "00", label: { en: "Bathrooms", th: "ห้องน้ำ" }, icon: "bath" },
        { key: "guests", value: "00", label: { en: "Guests", th: "ผู้เข้าพัก" }, icon: "users" },
        { key: "pool", value: "00", label: { en: "Pool", th: "สระว่ายน้ำ" }, icon: "pool" },
        { key: "distance", value: "0 m", label: { en: "To the beach", th: "ถึงชายหาด" }, icon: "pin" }
    ],
    // width/height must match each file's real pixel size (used as the <img>
    // width/height attributes for layout-shift prevention). The placeholder
    // PNGs shipped here are generated at exactly these dimensions.
    gallery: [
        { src: "assets/images/hero.png", alt: { en: "TODO: photo description", th: "TODO: photo description" }, span: "is-large", width: 1080, height: 609 },
        { src: "assets/images/about.png", alt: { en: "TODO: photo description", th: "TODO: photo description" }, span: "is-medium", width: 1360, height: 626 },
        { src: "assets/images/pool.png", alt: { en: "TODO: photo description", th: "TODO: photo description" }, span: "is-tall", width: 1360, height: 1020 },
        { src: "assets/images/living.png", alt: { en: "TODO: photo description", th: "TODO: photo description" }, span: "is-medium", width: 1360, height: 1020 },
        { src: "assets/images/bedroom.png", alt: { en: "TODO: photo description", th: "TODO: photo description" }, span: "is-medium", width: 1357, height: 1020 },
        { src: "assets/images/garden.png", alt: { en: "TODO: photo description", th: "TODO: photo description" }, span: "is-medium", width: 1360, height: 1020 },
        { src: "assets/images/location.png", alt: { en: "TODO: photo description", th: "TODO: photo description" }, span: "is-medium", width: 765, height: 1020 },
        { src: "assets/images/sunset.png", alt: { en: "TODO: photo description", th: "TODO: photo description" }, span: "is-medium", width: 1360, height: 1020 }
    ],
    amenities: [
        { key: "wifi", icon: "wifi", label: { en: "Wi-Fi", th: "ไวไฟ" } },
        { key: "aircon", icon: "snow", label: { en: "Air Conditioning", th: "เครื่องปรับอากาศ" } },
        { key: "kitchen", icon: "kitchen", label: { en: "Kitchen", th: "ครัว" } },
        { key: "parking", icon: "car", label: { en: "Parking", th: "ที่จอดรถ" } },
        { key: "pool", icon: "pool", label: { en: "Pool", th: "สระว่ายน้ำ" } },
        { key: "tv", icon: "tv", label: { en: "TV", th: "ทีวี" } }
    ],
    locationBody: {
        en: "TODO: paragraph describing the location and what is nearby.",
        th: "TODO: professional Thai translation needed."
    },
    locationHighlights: [
        { value: "0 min", label: { en: "Beach", th: "ชายหาด" } },
        { value: "0 min", label: { en: "Restaurants", th: "ร้านอาหาร" } },
        { value: "0 min", label: { en: "Shops", th: "ร้านค้า" } },
        { value: "0 min", label: { en: "Airport", th: "สนามบิน" } }
    ],
    // Optional. title/description are intentionally omitted — applySeoMeta()
    // (runtime) and scripts/sync-seo.js (static tags) both fall back to
    // name / location / heroDescription above.
    seo: {
        ogImage: "",
        siteUrl: "",
        twitterHandle: "",
        googleSiteVerification: ""
    },
    mapAddress: {
        en: "TODO: street address, City, Country",
        th: "TODO: street address, City, Country"
    },
    mapUrl: "",
    mapEmbedUrl: "",
    email: "",
    phone: "TODO: phone number",
    contactUrl: "",
    footerCopy: {
        en: "TODO: © Year Property name",
        th: "TODO: © Year Property name"
    },

    // Both empty = tracking disabled. Create new IDs per property — never
    // reuse another property's.
    analytics: {
        ga4MeasurementId: "",
        clarityProjectId: ""
    },

    // enabled: false hides the whole booking section and its nav link, so no
    // guest ever sees a placeholder price or a dead form. Set enabled: true
    // only once currency / pricePerNight / formspreeEndpoint below are real.
    booking: {
        enabled: false,

        // Each property MUST have its own Formspree form. Reusing another
        // property's endpoint sends its booking requests to the wrong
        // owner's inbox with no visible error.
        formspreeEndpoint: "",

        currency: "",
        pricePerNight: 0,
        cleaningFee: 0,
        serviceFee: 0,

        // Safe default — not property-specific. Only used for number
        // grouping/decimal separators in price display.
        numberLocales: { en: "en-US", th: "th-TH" },

        maximumGuests: 1,

        // Phase 3 placeholders — not read by any code yet.
        integrations: {
            airbnb: { enabled: false, calendarUrl: "" },
            bookingCom: { enabled: false, calendarUrl: "" }
        },

        contact: { email: "", phone: "", line: "" }
    }
};
