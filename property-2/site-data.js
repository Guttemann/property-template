// ============================================================================
// PROPERTY #2 -- "The Sand and I Private Pool Villa Huahin near Beach"
// ============================================================================
// This file now uses the REAL identity/location/facts/amenities data
// supplied for this property (2026-08-21). It is still NOT launch-ready --
// see the explicit TODOs below, all of which are business-critical values
// (price, phone, email, Facebook, Formspree, GA4, Clarity) that were
// deliberately NOT invented, per instruction. Do not fill these with
// guessed/"reasonable" values -- get the real ones or leave them as-is.
//
// Status of each section:
//   - Identity, location, facts, amenities, distances, address: REAL data,
//     supplied directly. Structural placeholders from the earlier
//     template-proof draft have been replaced.
//   - Images (hero/about/gallery): STILL PLACEHOLDER. Byte-identical copies
//     of Property #1's photos, renamed with a property-2- prefix, per
//     explicit instruction not to pull in Booking.com (or any other)
//     images without being asked. Alt text still honestly describes them
//     as placeholders, not as real photos of this property -- see the
//     gallery/hero/about comments below.
//   - Thai (th) text: standard vocabulary/place names (facts labels,
//     amenities labels, location-highlight labels, "Hua Hin, Thailand")
//     have been translated -- these are well-established terms, not
//     invented copy. Free-form marketing prose (hero/about/location body
//     paragraphs) has NOT been translated -- no professional Thai
//     translation was supplied, and writing new Thai marketing copy
//     myself would be inventing content, not reporting given facts. Those
//     fields are marked "TODO: professional Thai translation needed."
//     The property name/heroTitle/footerCopy reuse the same Latin-script
//     brand name in both languages -- boutique villa names in Thailand are
//     commonly kept unTranslated/unTransliterated in local marketing too,
//     but this should still be confirmed with the owner before launch.
//   - booking.enabled: false and both analytics IDs: "" -- unchanged, per
//     explicit instruction to keep booking/analytics disabled until real
//     pricing/tracking data exists.
//   - mapUrl/mapEmbedUrl: built from the real supplied address as a keyless
//     Google Maps search query (same mechanism Property #1's own comment
//     documents: "swap the q= query text for the new address"). Not
//     independently verified as pointing at the exact correct pin --
//     open the link and confirm before launch.
//
// Known TODOs that live OUTSIDE this file (see PROPERTY-CHECKLIST.md):
//   - favicon.ico / apple-touch-icon.png -- still Property #1's icons,
//     visually identical placeholder binaries. Replace before real use.
//   - assets/images/property-2-*.webp -- still Property #1's photos,
//     renamed. NOT photos of this property. Replace before any real use.
//   - style.css :root palette / font stack -- still Property #1's
//     branding, see the TODO comment at the top of property-2/style.css.
// ============================================================================
window.propertyConfig = {
    // Brand name kept identical in en/th -- see note above. Confirm with
    // the owner whether a Thai-script name is wanted before launch.
    name: {
        en: "The Sand and I Private Pool Villa Huahin near Beach",
        th: "The Sand and I Private Pool Villa Huahin near Beach"
    },
    location: { en: "Hua Hin, Thailand", th: "หัวหิน ประเทศไทย" },
    heroTitle: {
        en: "The Sand and I Private Pool Villa Huahin near Beach",
        th: "The Sand and I Private Pool Villa Huahin near Beach"
    },
    // Composed directly from the supplied facts (bedrooms/bathrooms/guests/
    // saltwater pool/beach distance) -- no amenities, claims or adjectives
    // added beyond what was given. TODO: professional Thai translation.
    heroDescription: {
        en: "A private pool villa in Hua Hin, Thailand, with 4 bedrooms, 5 bathrooms and space for up to 16 guests, about 200m from Hua Hin Beach.",
        th: "TODO: professional Thai translation needed."
    },
    heroDetails: {
        en: "Private Saltwater Pool · 4 Bedrooms · Up to 16 Guests",
        th: "TODO: professional Thai translation needed."
    },
    heroImage: "assets/images/property-2-hero.webp",
    // Placeholder photo: byte-identical copy of Property #1's hero image,
    // renamed. Not a real photo of this property -- see file banner above.
    heroImageAlt: {
        en: "Placeholder photo -- reused from Property #1 for template testing",
        th: ""
    },
    aboutTitle: {
        en: "A private pool villa near Hua Hin Beach.",
        th: "TODO: professional Thai translation needed."
    },
    // Facts used: bedrooms, bathrooms, saltwater pool, jacuzzi -- all
    // directly from the supplied list.
    aboutBody: {
        en: "The Sand and I is a private pool villa in Hua Hin with 4 bedrooms and 5 bathrooms, built around a private saltwater pool and jacuzzi.",
        th: "TODO: professional Thai translation needed."
    },
    // Facts used: kitchen, air conditioning, private parking, terrace/
    // balcony, billiards, karaoke, distance to beach + Market Village.
    aboutBody2: {
        en: "The property also has a kitchen, air conditioning, private parking, a terrace/balcony, and on-site billiards and karaoke -- with Hua Hin Beach and Market Village both about 200m away.",
        th: "TODO: professional Thai translation needed."
    },
    aboutImage: {
        src: "assets/images/property-2-villa-main.webp",
        alt: {
            en: "Placeholder photo -- reused from Property #1 for template testing",
            th: ""
        }
    },
    // Real facts, directly from the supplied list. "value" strings follow
    // Property #1's existing two-digit / "Nm" formatting convention.
    facts: [
        { key: "bedrooms", value: "04", label: { en: "Bedrooms", th: "ห้องนอน" }, icon: "bed" },
        { key: "bathrooms", value: "05", label: { en: "Bathrooms", th: "ห้องน้ำ" }, icon: "bath" },
        { key: "guests", value: "16", label: { en: "Guests", th: "ผู้เข้าพัก" }, icon: "users" },
        { key: "pool", value: "01", label: { en: "Private Saltwater Pool", th: "สระว่ายน้ำเกลือส่วนตัว" }, icon: "pool" },
        { key: "location", value: "200m", label: { en: "To Hua Hin Beach", th: "ถึงหาดหัวหิน" }, icon: "pin" }
    ],
    // PLACEHOLDER IMAGES -- unchanged from the earlier template-proof draft.
    // Byte-identical copies of Property #1's photos, renamed with a
    // property-2- prefix. Per explicit instruction, no Booking.com (or any
    // other) images were pulled in for this update. Alt text intentionally
    // still describes them as placeholders, NOT as real photos of this
    // villa's saltwater pool/rooms/etc -- an alt text claiming to show this
    // property's actual saltwater pool on a photo that isn't it would be
    // misleading to screen-reader users, independent of the rest of the
    // config now being real. Replace every file (and then this alt text)
    // before any real use.
    gallery: [
        { src: "assets/images/property-2-hero.webp", alt: { en: "Placeholder exterior photo", th: "Placeholder exterior photo" }, span: "is-large", width: 1080, height: 609 },
        { src: "assets/images/property-2-villa-main.webp", alt: { en: "Placeholder exterior photo", th: "Placeholder exterior photo" }, span: "is-medium", width: 1360, height: 626 },
        { src: "assets/images/property-2-pool.webp", alt: { en: "Placeholder pool photo", th: "Placeholder pool photo" }, span: "is-tall", width: 1360, height: 1020 },
        { src: "assets/images/property-2-living.webp", alt: { en: "Placeholder living area photo", th: "Placeholder living area photo" }, span: "is-medium", width: 1360, height: 1020 },
        { src: "assets/images/property-2-bedroom.webp", alt: { en: "Placeholder bedroom photo", th: "Placeholder bedroom photo" }, span: "is-medium", width: 1357, height: 1020 },
        { src: "assets/images/property-2-garden.webp", alt: { en: "Placeholder outdoor photo", th: "Placeholder outdoor photo" }, span: "is-medium", width: 1360, height: 1020 },
        { src: "assets/images/property-2-location.webp", alt: { en: "Placeholder surroundings photo", th: "Placeholder surroundings photo" }, span: "is-medium", width: 765, height: 1020 },
        { src: "assets/images/property-2-sunset.webp", alt: { en: "Placeholder sunset photo", th: "Placeholder sunset photo" }, span: "is-medium", width: 1360, height: 1020 }
    ],
    // Real amenity list, directly from the supplied 10 items. Icon keys are
    // chosen from the fixed 13-key enum in schema/property-config.schema.json
    // (script.js's iconSvg() has no dedicated icon for billiards/karaoke, so
    // "table"/"tv" are the closest available approximations, not a claim
    // that those exact icons are "correct" -- fine to swap for something
    // better if the icon set is ever extended).
    amenities: [
        { key: "privatePool", icon: "pool", label: { en: "Private Saltwater Pool", th: "สระว่ายน้ำเกลือส่วนตัว" } },
        { key: "jacuzzi", icon: "pool", label: { en: "Jacuzzi", th: "จากุซซี่" } },
        { key: "kitchen", icon: "kitchen", label: { en: "Kitchen", th: "ครัว" } },
        { key: "wifi", icon: "wifi", label: { en: "Wi-Fi", th: "ไวไฟ" } },
        { key: "aircon", icon: "snow", label: { en: "Air Conditioning", th: "เครื่องปรับอากาศ" } },
        { key: "bbq", icon: "grill", label: { en: "BBQ", th: "บาร์บีคิว" } },
        { key: "parking", icon: "car", label: { en: "Private Parking", th: "ที่จอดรถส่วนตัว" } },
        { key: "terrace", icon: "table", label: { en: "Terrace / Balcony", th: "ระเบียง" } },
        { key: "billiards", icon: "table", label: { en: "Billiards", th: "บิลเลียด" } },
        { key: "karaoke", icon: "tv", label: { en: "Karaoke", th: "คาราโอเกะ" } }
    ],
    // Address + closest two distances from the supplied list.
    // TODO: professional Thai translation needed for the prose.
    locationBody: {
        en: "The villa is located at 252/44 Soi Huahin 94/1, Hua Hin 77110, Thailand, about 200m from Hua Hin Beach and Market Village, and 500m from Bluport.",
        th: "TODO: professional Thai translation needed."
    },
    // Dead field in current template (script.js reads it but no HTML element
    // renders it -- see full-audit.md). Kept intentionally, same convention
    // Property #1 uses: real content, further-out travel distances that
    // don't fit the 4-item locationHighlights grid below.
    locationBody2: {
        en: "Hua Hin Airport is about 9km away, Royal Hua Hin Golf Course about 2.2km, and Seapine Golf Course about 10km from the property.",
        th: ""
    },
    // 4 closest distances from the supplied list (matches Property #1's
    // 4-item convention for this grid). Remaining distances (airport, both
    // golf courses) are in locationBody2 above instead.
    locationHighlights: [
        { value: "200 m", label: { en: "Hua Hin Beach", th: "หาดหัวหิน" } },
        { value: "200 m", label: { en: "Market Village", th: "มาร์เก็ต วิลเลจ" } },
        { value: "500 m", label: { en: "Bluport", th: "บลูพอร์ต" } },
        { value: "2 km", label: { en: "Railway Station", th: "สถานีรถไฟ" } }
    ],
    seo: {
        // title/description intentionally omitted -- applySeoMeta() and
        // scripts/sync-seo.js both fall back to name/location/heroDescription
        // above, which now contain the real name/description.
        ogImage: "",
        siteUrl: "", // TODO: real domain unknown -- leave "" until this property has one
        twitterHandle: "",
        googleSiteVerification: "" // TODO: domain-specific token, generate after siteUrl is set
    },
    // Real address, as supplied. th reuses the same Latin-script text --
    // NOT an attempted Thai-script transliteration (a wrong transliteration
    // of a precise street address is a real-world wayfinding/mail risk, not
    // just a copy-quality issue, so it was deliberately not guessed at).
    // Verify/replace with an owner-confirmed Thai address before launch.
    mapAddress: {
        en: "252/44 Soi Huahin 94/1, Hua Hin 77110, Thailand",
        th: "252/44 Soi Huahin 94/1, Hua Hin 77110, Thailand"
    },
    // Keyless Google Maps query built from the real supplied address --
    // same mechanism as Property #1's own mapUrl/mapEmbedUrl (see that
    // file's comment: "swap the q= query text for the new address"). Not
    // independently verified against the exact pin -- open and confirm.
    mapUrl: "https://www.google.com/maps/search/?api=1&query=252%2F44+Soi+Huahin+94%2F1%2C+Hua+Hin+77110%2C+Thailand",
    mapEmbedUrl: "https://www.google.com/maps?q=252%2F44+Soi+Huahin+94%2F1%2C+Hua+Hin+77110%2C+Thailand&z=15&output=embed",
    email: "", // TODO: real contact email unknown -- not invented, per instruction
    phone: "TODO: phone number", // TODO: real phone unknown -- not invented, per instruction
    contactUrl: "", // TODO: real contact/Facebook URL unknown -- not invented, per instruction
    photosUrl: "", // dead field in current template (see full-audit.md) -- left empty, nothing to migrate
    footerCopy: {
        en: "© 2026 The Sand and I Private Pool Villa Huahin near Beach",
        th: "© 2026 The Sand and I Private Pool Villa Huahin near Beach"
    },

    // ANALYTICS -- left disabled per explicit instruction. Both empty
    // strings are schema-valid and mean "tracking disabled".
    analytics: {
        ga4MeasurementId: "", // TODO: not invented, per instruction
        clarityProjectId: ""  // TODO: not invented, per instruction
    },

    // BOOKING -- left disabled per explicit instruction. booking.enabled:
    // false hides the entire booking section + nav link (see initBooking()
    // in script.js), so no guest ever sees a missing/placeholder price.
    // maximumGuests is filled in (16, real, matches the "guests" fact above)
    // since it isn't a price/contact field and was directly supplied.
    // minimumStay/maximumStay/bookingHorizonMonths/blockedDates remain
    // omitted -- no real stay-rule or availability data was supplied, and
    // booking-logic.js already has documented fallbacks for all of them
    // when absent.
    booking: {
        enabled: false, // TODO: set true once real pricing/dates/formspreeEndpoint below are filled in

        formspreeEndpoint: "", // TODO: create a NEW Formspree form for this property -- never reuse Property #1's

        currency: "", // TODO: real currency unknown -- not invented, per instruction
        pricePerNight: 0, // TODO: real nightly rate unknown -- not invented, per instruction. 0 hides price display, which is correct while this is a TODO
        cleaningFee: 0,
        serviceFee: 0,

        numberLocales: { en: "en-US", th: "th-TH" }, // safe default, not property-specific (see full-audit.md §02)

        maximumGuests: 16, // real, supplied ("up to 16 guests") -- matches the "guests" fact above

        integrations: {
            airbnb: { enabled: false, calendarUrl: "" },
            bookingCom: { enabled: false, calendarUrl: "" }
        },

        contact: {
            email: "", // TODO: not invented, per instruction
            phone: "TODO: phone number", // TODO: not invented, per instruction
            line: ""
        }
    }
};
