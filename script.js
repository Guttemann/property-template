// =========================
// STATE
// =========================

// localStorage can throw (not just return null) in some contexts — Safari
// private browsing, sandboxed iframes, file:// origins. Guard it so a
// storage failure never breaks the whole page.
function safeStorageGet(key) {
    try {
        return window.localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function safeStorageSet(key, value) {
    try {
        window.localStorage.setItem(key, value);
    } catch (error) {
        // Storage unavailable — language choice just won't persist.
    }
}

let currentLanguage = safeStorageGet("property-language") || "en";
let lightboxIndex = 0;

const navbar = document.querySelector(".navbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const languageButtons = document.querySelectorAll(".language-btn");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const factsGrid = document.getElementById("factsGrid");
const galleryGrid = document.getElementById("galleryGrid");
const amenitiesGrid = document.getElementById("amenitiesGrid");
const locationHighlightsGrid = document.getElementById("locationHighlightsGrid");

let observer;

function getText(value) {
    if (typeof value === "string") return value;
    return value?.[currentLanguage] || value?.en || "";
}

function iconSvg(name) {
    const icons = {
        bed: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8m0 12h16m-16 0v-5h16v5m0-5V11a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v4m9 0H4"/></svg>',
        bath: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12V7a4 4 0 0 1 8 0m-8 5h12a3 3 0 0 1 0 6H7a4 4 0 0 1-4-4v-1h3"/></svg>',
        users: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m14 0h3v-1a4 4 0 0 0-3-3.87M13 5.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm7 4a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/></svg>',
        pool: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 19h20M4 15c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1m-8-7-2-2-2 2m2-2v8"/></svg>',
        pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>',
        wifi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12a13 13 0 0 1 14 0m-11 4a8 8 0 0 1 8 0m-5 4a3 3 0 0 1 2 0"/></svg>',
        snow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M5 5l14 14M19 5 5 19M3 12h18"/></svg>',
        kitchen: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5zM8 7h2m4 0h2M8 11h8M8 15h5"/></svg>',
        car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 16h18l-1-5H4l-1 5Zm3 0v3m12-3v3M6 11l2-4h8l2 4"/></svg>',
        laundry: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16H6zM8 4l2 4m0-4 2 4m6 0a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/></svg>',
        tv: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v11H4zM8 20h8M9 10l5 2-5 2z"/></svg>',
        grill: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14M7 8l2 8h6l2-8M9 19h6M12 16v3M4 5h16"/></svg>',
        table: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11h16M7 11v7m10-7v7M6 18h12M5 8h14"/></svg>'
    };
    return icons[name] || icons.pin;
}

function observeRevealElements() {
    if (!observer) return;
    document.querySelectorAll(".reveal, .reveal-image").forEach(element => {
        if (element.dataset.observed === "true") return;
        observer.observe(element);
        element.dataset.observed = "true";
    });
}

function renderFacts() {
    const config = window.propertyConfig;
    factsGrid.innerHTML = config.facts.map(item => `
        <article class="fact-card reveal">
            <span class="fact-icon">${iconSvg(item.icon)}</span>
            <div>
                <div class="fact-value">${item.value}</div>
                <div class="fact-label">${getText(item.label)}</div>
            </div>
        </article>
    `).join("");
}

function renderGallery() {
    const config = window.propertyConfig;
    galleryGrid.innerHTML = config.gallery.map((image, index) => `
        <button class="gallery-item ${image.span || ""} reveal-image" type="button"
            data-gallery-index="${index}" aria-label="${getText(image.alt)}">
            <img src="${image.src}" alt="${getText(image.alt)}">
        </button>
    `).join("");

    galleryGrid.querySelectorAll(".gallery-item").forEach(button => {
        button.addEventListener("click", () => openLightbox(Number(button.dataset.galleryIndex)));
    });
}

function renderAmenities() {
    const config = window.propertyConfig;
    amenitiesGrid.innerHTML = config.amenities.map(item => `
        <article class="amenity-card reveal">
            <span class="amenity-icon">${iconSvg(item.icon)}</span>
            <div>
                <strong>${getText(item.label)}</strong>
            </div>
        </article>
    `).join("");
}

function renderLocationHighlights() {
    const config = window.propertyConfig;
    locationHighlightsGrid.innerHTML = config.locationHighlights.map(item => `
        <div class="highlight-item reveal">
            <div class="highlight-value">${item.value}</div>
            <div class="highlight-label">${getText(item.label)}</div>
        </div>
    `).join("");
}

function renderMapEmbed() {
    const config = window.propertyConfig;
    document.querySelectorAll("[data-property-map-embed]").forEach(el => {
        el.src = config.mapEmbedUrl;
        el.title = `Map showing the location of ${getText(config.name)}`;
    });
}

function renderStaticContent() {
    const config = window.propertyConfig;
    if (!config) return;

    document.querySelectorAll("[data-property-name]").forEach(el => el.textContent = getText(config.name));
    document.querySelectorAll("[data-property-location]").forEach(el => el.textContent = getText(config.location));
    document.querySelectorAll("[data-property-hero-title]").forEach(el => el.textContent = getText(config.heroTitle));
    document.querySelectorAll("[data-property-hero-description]").forEach(el => el.textContent = getText(config.heroDescription));
    document.querySelectorAll("[data-property-hero-details]").forEach(el => el.textContent = getText(config.heroDetails));
    document.querySelectorAll("[data-property-about-title]").forEach(el => el.textContent = getText(config.aboutTitle));
    document.querySelectorAll("[data-property-about-body]").forEach(el => el.textContent = getText(config.aboutBody));
    document.querySelectorAll("[data-property-about-body-2]").forEach(el => el.textContent = getText(config.aboutBody2));
    document.querySelectorAll("[data-property-location-body]").forEach(el => el.textContent = getText(config.locationBody));
    document.querySelectorAll("[data-property-location-body-2]").forEach(el => el.textContent = getText(config.locationBody2));
    document.querySelectorAll("[data-property-map-address]").forEach(el => el.textContent = getText(config.mapAddress));
    document.querySelectorAll("[data-property-email]").forEach(el => { if (config.email) { el.textContent = config.email; el.href = `mailto:${config.email}`; } else { el.textContent = "Contact via Facebook"; el.href = config.contactUrl; } });
    document.querySelectorAll("[data-property-phone]").forEach(el => { el.textContent = config.phone; el.href = `tel:${config.phone.replace(/\s+/g, "")}`; });
    document.querySelectorAll("[data-property-footer-copy]").forEach(el => el.textContent = getText(config.footerCopy));
    document.querySelectorAll("[data-property-hero-image]").forEach(el => el.src = config.heroImage);
    document.querySelectorAll("[data-property-map-link]").forEach(el => el.href = config.mapUrl);
    document.querySelectorAll("[data-property-contact-link]").forEach(el => el.href = config.contactUrl);
    document.querySelectorAll("[data-property-photos-link]").forEach(el => el.href = config.photosUrl);

    renderFacts();
    renderGallery();
    renderAmenities();
    renderLocationHighlights();
    renderMapEmbed();
    observeRevealElements();
}

function setLanguage(language) {
    currentLanguage = language;
    document.documentElement.lang = language;

    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.dataset.i18n;
        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }
    });

    languageButtons.forEach(button => {
        button.classList.toggle("active", button.dataset.lang === language);
    });

    safeStorageSet("property-language", language);
    renderStaticContent();
    refreshBookingTexts();
}

window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 80);
});

menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
});

document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => navLinks.classList.remove("open"));
});

languageButtons.forEach(button => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

// SCROLL REVEAL
observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

// SMOOTH ANCHOR SCROLL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (event) {
        const target = document.querySelector(this.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
});

// LIGHTBOX
function openLightbox(index) {
    const config = window.propertyConfig;
    lightboxIndex = index;
    const image = config.gallery[lightboxIndex];
    lightboxImage.src = image.src;
    lightboxImage.alt = getText(image.alt);
    lightboxCaption.textContent = `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(config.gallery.length).padStart(2, "0")} · ${getText(image.alt)}`;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

function stepLightbox(direction) {
    const config = window.propertyConfig;
    lightboxIndex = (lightboxIndex + direction + config.gallery.length) % config.gallery.length;
    openLightbox(lightboxIndex);
}

document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
document.querySelector(".lightbox-prev").addEventListener("click", () => stepLightbox(-1));
document.querySelector(".lightbox-next").addEventListener("click", () => stepLightbox(1));

lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
});

window.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
});

// =========================
// ANALYTICS
// =========================

const GA4_ID_PATTERN = /^G-[A-Z0-9]{4,}$/i;
const CLARITY_ID_PATTERN = /^[a-z0-9]{6,}$/i;

function loadGA4(measurementId) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag("js", new Date());
    gtag("config", measurementId);
}

function loadClarity(projectId) {
    (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () {
            (c[a].q = c[a].q || []).push(arguments);
        };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", projectId);
}

// null/undefined (key omitted) count as "blank"; any other non-string
// (e.g. a number typed without quotes) is stringified so it still hits
// the format check below instead of being silently ignored.
function normalizeAnalyticsId(rawValue) {
    if (rawValue === null || rawValue === undefined) return "";
    return String(rawValue).trim();
}

// Reads propertyConfig.analytics and loads GA4/Clarity only for IDs that
// are present and well-formed. A blank ID means "disabled" and is skipped
// silently; an invalid non-blank ID is skipped with a console.warn. Never
// throws — a bad config, a blocked request (ad blocker) or any other
// unexpected failure here must not stop the rest of the page, and in
// particular the booking flow, from working.
function initAnalytics() {
    try {
        const analytics = (window.propertyConfig && window.propertyConfig.analytics) || {};

        const ga4Id = normalizeAnalyticsId(analytics.ga4MeasurementId);
        if (ga4Id) {
            if (GA4_ID_PATTERN.test(ga4Id)) {
                loadGA4(ga4Id);
            } else {
                console.warn(`Invalid analytics.ga4MeasurementId (${JSON.stringify(analytics.ga4MeasurementId)}); expected a GA4 Measurement ID like "G-XXXXXXXXXX". Skipping GA4.`);
            }
        }

        const clarityId = normalizeAnalyticsId(analytics.clarityProjectId);
        if (clarityId) {
            if (CLARITY_ID_PATTERN.test(clarityId)) {
                loadClarity(clarityId);
            } else {
                console.warn(`Invalid analytics.clarityProjectId (${JSON.stringify(analytics.clarityProjectId)}); expected a Microsoft Clarity project ID. Skipping Clarity.`);
            }
        }
    } catch (error) {
        console.warn("Analytics failed to initialize; continuing without it.", error);
    }
}

// =========================
// BOOKING / AVAILABILITY
// =========================

const bookingState = {
    checkIn: null,          // Date
    checkOut: null,         // Date
    guests: 1,
    maxGuests: 1,
    minimumStay: 1,
    maximumStay: null,      // number of nights, or null = no maximum
    bookingHorizonMonths: 12, // months ahead check-in may be selected, or null = no horizon
    maxCheckInDate: null,    // Date, derived from bookingHorizonMonths — last selectable check-in
    blockedDates: new Set(), // "YYYY-MM-DD" strings
    viewMonth: null,         // Date, first of the visible month
    lastResult: null,        // { available: boolean, nights?: number }
    messageKey: null,        // last shown validation message key, for re-translation
    messageParams: null
};

let bookingInitialized = false;

// --- Availability service abstraction -----------------------------------
// This is the one place that knows where blocked dates come from. Today it
// just reads the manually curated list in site-data.js. When a real
// Airbnb/Booking.com/Agoda/channel-manager sync is added (see
// config.booking.integrations), replace the body of this function with a
// fetch to that service (parsing iCal, calling an API, etc.) — every caller
// already awaits it and runs the result through expandBlockedDates(), so no
// calendar or UI code needs to change.
async function getBlockedDates() {
    const config = window.propertyConfig;
    return (config && config.booking && config.booking.blockedDates) || [];
}

// Blocked-date entries can be a single "YYYY-MM-DD" string or a
// { from, to } range (inclusive) — this expands both into one flat Set of
// ISO date strings that the calendar can check in O(1). Keeping this
// separate from getBlockedDates() means a future iCal/API source can return
// either shape too, with no changes needed here.
//
// Each date in the returned Set means "the night starting on this date is
// occupied" — it does not mean the calendar day is fully closed. The day
// right after a range's `to` is deliberately left out, so it stays open as
// a check-in for the next guest, and renderCalendar() separately allows a
// blocked date to still be picked as a check-out (see isCheckoutCandidate
// there) — together that's what makes back-to-back turnover days work.
//
// site-data.js is hand-edited per property, so entries here can be
// malformed in ways nothing else catches: a typo'd date, a reversed range,
// the wrong shape entirely. A malformed entry that silently disappears is
// dangerous in the "open" direction — the calendar shows the night as
// available and a guest can double-book it — so every entry is validated
// and anything that doesn't check out is dropped with a console.warn
// (never guessed at, never left to throw).
const BLOCKED_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BLOCKED_RANGE_NIGHTS = 730; // ~2 years; catches a typo'd year turning one range into a huge/frozen block
const DEFAULT_BOOKING_HORIZON_MONTHS = 12;

// Rejects anything that isn't a real calendar date in "YYYY-MM-DD" form —
// including strings like "2026-02-30" that the regex lets through but that
// the Date constructor would otherwise silently normalize to March 2.
function isValidISODateString(value) {
    if (typeof value !== "string" || !BLOCKED_DATE_RE.test(value)) return false;
    return formatISODate(parseISODate(value)) === value;
}

function expandBlockedDates(rawList) {
    const dates = new Set();

    if (!Array.isArray(rawList)) {
        if (rawList != null) {
            console.warn(`Invalid booking.blockedDates (${JSON.stringify(rawList)}); expected an array. Treating as no blocked dates.`);
        }
        return dates;
    }

    rawList.forEach(entry => {
        if (typeof entry === "string") {
            if (!isValidISODateString(entry)) {
                console.warn(`Invalid blocked date ${JSON.stringify(entry)}; expected a real calendar date as "YYYY-MM-DD". Skipping.`);
                return;
            }
            dates.add(entry);
            return;
        }

        if (entry && typeof entry === "object" && ("from" in entry || "to" in entry)) {
            if (!isValidISODateString(entry.from) || !isValidISODateString(entry.to)) {
                console.warn(`Invalid blocked date range ${JSON.stringify(entry)}; "from" and "to" must both be real calendar dates as "YYYY-MM-DD". Skipping.`);
                return;
            }

            const start = parseISODate(entry.from);
            const end = parseISODate(entry.to);
            if (start > end) {
                console.warn(`Invalid blocked date range ${JSON.stringify(entry)}; "from" is after "to". Skipping rather than guessing the intended order.`);
                return;
            }

            const nights = Math.round((end - start) / 86400000) + 1;
            if (nights > MAX_BLOCKED_RANGE_NIGHTS) {
                console.warn(`Blocked date range ${JSON.stringify(entry)} spans ${nights} nights, over the ${MAX_BLOCKED_RANGE_NIGHTS}-night limit (check for a typo'd year). Skipping.`);
                return;
            }

            let cursor = start;
            while (cursor <= end) {
                dates.add(formatISODate(cursor));
                cursor = addDays(cursor, 1);
            }
            return;
        }

        console.warn(`Invalid blocked date entry ${JSON.stringify(entry)}; expected a "YYYY-MM-DD" string or a { from, to } object. Skipping.`);
    });

    return dates;
}

// --- Date helpers ---------------------------------------------------------
function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function todayStart() {
    return startOfDay(new Date());
}

function formatISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function parseISODate(value) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}

// Last selectable check-in date, or null if there's no horizon. Uses the
// same setMonth() arithmetic as shiftMonth() elsewhere in this file, so a
// horizon crossing a short month (e.g. today = Jan 31, +1 month) rolls over
// consistently with how month navigation already behaves.
function computeMaxCheckInDate(bookingHorizonMonths) {
    if (bookingHorizonMonths == null) return null;
    const max = todayStart();
    max.setMonth(max.getMonth() + bookingHorizonMonths);
    return max;
}

function isSameDate(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function diffInNights(checkIn, checkOut) {
    return Math.round((startOfDay(checkOut) - startOfDay(checkIn)) / 86400000);
}

function formatDisplayDate(date) {
    const months = (translations[currentLanguage] && translations[currentLanguage].calendarMonths) || translations.en.calendarMonths;
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// --- Translation helper (supports {n}-style placeholders) -----------------
function t(key, params) {
    const dict = translations[currentLanguage] || translations.en;
    let text = dict[key] ?? translations.en[key] ?? "";
    if (params) {
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
    }
    return text;
}

// --- Init -------------------------------------------------------------
async function initBooking() {
    const config = window.propertyConfig;
    const bookingSection = document.getElementById("booking");
    const navBookingLink = document.querySelector('.nav-links a[href="#booking"]');

    if (!config || !config.booking || !config.booking.enabled) {
        if (bookingSection) bookingSection.style.display = "none";
        if (navBookingLink) navBookingLink.style.display = "none";
        return;
    }

    bookingState.minimumStay = Math.max(1, Number(config.booking.minimumStay) || 1);

    const rawMaximumStay = config.booking.maximumStay;
    if (rawMaximumStay == null) {
        bookingState.maximumStay = null;
    } else {
        const parsedMaximumStay = Number(rawMaximumStay);
        if (!Number.isFinite(parsedMaximumStay) || parsedMaximumStay < bookingState.minimumStay) {
            // Fails open to "no maximum" instead of clamping to minimumStay, which would
            // silently reject nearly every booking under a typo'd config.
            console.warn(`Invalid booking.maximumStay (${JSON.stringify(rawMaximumStay)}); treating as no maximum.`);
            bookingState.maximumStay = null;
        } else {
            bookingState.maximumStay = parsedMaximumStay;
        }
    }

    const rawBookingHorizonMonths = config.booking.bookingHorizonMonths;
    if (rawBookingHorizonMonths === null) {
        // Explicit opt-out — property owner deliberately wants no horizon.
        bookingState.bookingHorizonMonths = null;
    } else if (rawBookingHorizonMonths === undefined) {
        bookingState.bookingHorizonMonths = DEFAULT_BOOKING_HORIZON_MONTHS;
    } else {
        const parsedBookingHorizonMonths = Number(rawBookingHorizonMonths);
        if (!Number.isFinite(parsedBookingHorizonMonths) || parsedBookingHorizonMonths <= 0) {
            // Fails open to the safe default rather than "no horizon" — unlike
            // maximumStay, the open/unlimited direction here is the risky one
            // (see bookingHorizonMonths comment in site-data.js), so a typo'd
            // config shouldn't silently remove the guardrail.
            console.warn(`Invalid booking.bookingHorizonMonths (${JSON.stringify(rawBookingHorizonMonths)}); using the default of ${DEFAULT_BOOKING_HORIZON_MONTHS} months.`);
            bookingState.bookingHorizonMonths = DEFAULT_BOOKING_HORIZON_MONTHS;
        } else {
            bookingState.bookingHorizonMonths = parsedBookingHorizonMonths;
        }
    }
    bookingState.maxCheckInDate = computeMaxCheckInDate(bookingState.bookingHorizonMonths);

    bookingState.maxGuests = Math.max(1, Number(config.booking.maximumGuests) || 1);
    bookingState.guests = 1;
    bookingState.viewMonth = todayStart();
    bookingState.viewMonth.setDate(1);

    const blocked = await getBlockedDates();
    bookingState.blockedDates = expandBlockedDates(blocked);

    renderCalendar();
    updateDateDisplays();
    updateRateNote();
    bindBookingEvents();
    bookingInitialized = true;
}

function bindBookingEvents() {
    document.getElementById("guestMinus").addEventListener("click", () => changeGuests(-1));
    document.getElementById("guestPlus").addEventListener("click", () => changeGuests(1));
    document.getElementById("bookingCheckBtn").addEventListener("click", handleCheckAvailability);
    document.getElementById("requestToBookBtn").addEventListener("click", showBookingRequestForm);
    document.getElementById("chooseOtherDatesBtn").addEventListener("click", resetToWidget);
    document.getElementById("backToResultBtn").addEventListener("click", showResultFromRequest);
    document.getElementById("bookingRequestForm").addEventListener("submit", handleBookingRequestSubmit);
    document.getElementById("backToPropertyBtn").addEventListener("click", handleBackToProperty);
}

// --- Guests -----------------------------------------------------------
function changeGuests(delta) {
    const next = bookingState.guests + delta;
    if (next < 1) return;
    if (next > bookingState.maxGuests) {
        showValidationMessage("maxGuestsMessage", { n: bookingState.maxGuests });
        return;
    }
    bookingState.guests = next;
    document.getElementById("bookingGuests").value = String(next);
    clearValidationMessage();
}

// --- Validation message ------------------------------------------------
function showValidationMessage(key, params) {
    bookingState.messageKey = key;
    bookingState.messageParams = params || null;
    const el = document.getElementById("bookingValidationMessage");
    el.textContent = t(key, params);
    el.hidden = false;
}

function clearValidationMessage() {
    bookingState.messageKey = null;
    bookingState.messageParams = null;
    const el = document.getElementById("bookingValidationMessage");
    el.textContent = "";
    el.hidden = true;
}

// --- Date displays -------------------------------------------------------
function updateDateDisplays() {
    const checkInEl = document.getElementById("bookingCheckInDisplay");
    const checkOutEl = document.getElementById("bookingCheckOutDisplay");
    checkInEl.textContent = bookingState.checkIn ? formatDisplayDate(bookingState.checkIn) : t("selectDate");
    checkOutEl.textContent = bookingState.checkOut ? formatDisplayDate(bookingState.checkOut) : t("selectDate");
}

// --- Calendar -----------------------------------------------------------
function renderCalendar() {
    const container = document.getElementById("bookingCalendar");
    if (!container) return;

    const months = (translations[currentLanguage] && translations[currentLanguage].calendarMonths) || translations.en.calendarMonths;
    const weekdays = (translations[currentLanguage] && translations[currentLanguage].calendarWeekdaysShort) || translations.en.calendarWeekdaysShort;

    const viewMonth = bookingState.viewMonth;
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const today = todayStart();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    // getDay(): 0=Sun..6=Sat -> shift so the grid starts on Monday.
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // A date in blockedDates means that date's *night* is occupied — it
    // does not mean the calendar day itself is unusable. While the guest is
    // picking a check-out (check-in already chosen, check-out not yet), a
    // later date is only ever used as the day they leave, which books no
    // night of its own. So it must stay pickable even if it's the first
    // night of the next booking — that's a same-day turnover with zero
    // night overlap, and isRangeClear() below still rejects any date whose
    // *in-between* nights are occupied.
    const isSelectingCheckout = Boolean(bookingState.checkIn) && !bookingState.checkOut;

    let cells = "";
    for (let i = 0; i < firstWeekday; i++) {
        cells += `<span class="cal-day is-empty" aria-hidden="true"></span>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const iso = formatISODate(date);
        const isPast = date < today;
        const isBlockedNight = bookingState.blockedDates.has(iso);
        const isCheckoutCandidate = isSelectingCheckout && date > bookingState.checkIn;
        // The horizon bounds check-in dates only (see computeMaxCheckInDate).
        // A checkout beyond it books no night past the horizon itself, so —
        // same as isBlockedNight above — it must stay pickable as a checkout.
        const isBeyondHorizon = bookingState.maxCheckInDate != null && date > bookingState.maxCheckInDate;
        const isDisabled = isPast || (isBlockedNight && !isCheckoutCandidate) || (isBeyondHorizon && !isCheckoutCandidate);

        const isCheckIn = bookingState.checkIn && isSameDate(date, bookingState.checkIn);
        const isCheckOut = bookingState.checkOut && isSameDate(date, bookingState.checkOut);
        const isInRange = bookingState.checkIn && bookingState.checkOut &&
            date > bookingState.checkIn && date < bookingState.checkOut;

        const classes = ["cal-day"];
        if (isDisabled) classes.push("is-disabled");
        if (isBlockedNight) classes.push("is-blocked");
        if (isCheckIn) classes.push("is-checkin");
        if (isCheckOut) classes.push("is-checkout");
        if (isInRange) classes.push("is-in-range");

        cells += `<button type="button" class="${classes.join(" ")}" data-date="${iso}" ${isDisabled ? "disabled" : ""} aria-label="${iso}">${day}</button>`;
    }

    // Only cap forward navigation while starting a fresh check-in — once the
    // guest is choosing a checkout, they may need a later month to reach a
    // legitimate checkout date beyond the horizon (see isBeyondHorizon above).
    const maxCheckInDate = bookingState.maxCheckInDate;
    const isAtMaxMonth = !isSelectingCheckout && maxCheckInDate != null &&
        year === maxCheckInDate.getFullYear() && month === maxCheckInDate.getMonth();

    container.innerHTML = `
        <div class="cal-header">
            <button type="button" class="cal-nav cal-prev" aria-label="Previous month" ${isCurrentMonth ? "disabled" : ""}>‹</button>
            <span class="cal-month-label">${months[month]} ${year}</span>
            <button type="button" class="cal-nav cal-next" aria-label="Next month" ${isAtMaxMonth ? "disabled" : ""}>›</button>
        </div>
        <div class="cal-weekdays">${weekdays.map(w => `<span>${w}</span>`).join("")}</div>
        <div class="cal-grid">${cells}</div>
    `;

    container.querySelector(".cal-prev").addEventListener("click", () => shiftMonth(-1));
    container.querySelector(".cal-next").addEventListener("click", () => shiftMonth(1));

    container.querySelectorAll(".cal-day:not(.is-empty):not(.is-disabled)").forEach(button => {
        button.addEventListener("click", () => handleDayClick(button.dataset.date));
    });
}

function shiftMonth(delta) {
    const next = new Date(bookingState.viewMonth);
    next.setMonth(next.getMonth() + delta);
    const currentMonthStart = todayStart();
    currentMonthStart.setDate(1);
    if (next < currentMonthStart) return;

    // Same checkout-selection exemption as the "next" button's disabled
    // state in renderCalendar() — don't strand a guest whose checkout falls
    // in a month past the check-in horizon.
    const isSelectingCheckout = Boolean(bookingState.checkIn) && !bookingState.checkOut;
    if (!isSelectingCheckout && bookingState.maxCheckInDate != null) {
        const maxMonthStart = new Date(bookingState.maxCheckInDate.getFullYear(), bookingState.maxCheckInDate.getMonth(), 1);
        if (next > maxMonthStart) return;
    }

    bookingState.viewMonth = next;
    renderCalendar();
}

function isRangeClear(checkIn, checkOut) {
    let cursor = new Date(checkIn);
    while (cursor < checkOut) {
        if (bookingState.blockedDates.has(formatISODate(cursor))) return false;
        cursor = addDays(cursor, 1);
    }
    return true;
}

function handleDayClick(iso) {
    const date = parseISODate(iso);
    clearValidationMessage();
    hideResult();

    const startingFresh = !bookingState.checkIn || bookingState.checkOut;

    if (startingFresh) {
        bookingState.checkIn = date;
        bookingState.checkOut = null;
    } else if (date <= bookingState.checkIn) {
        // Clicking on or before the current check-in restarts the selection.
        bookingState.checkIn = date;
        bookingState.checkOut = null;
    } else if (!isRangeClear(bookingState.checkIn, date)) {
        showValidationMessage("rangeBlockedMessage");
    } else {
        bookingState.checkOut = date;
    }

    updateDateDisplays();
    renderCalendar();
}

// --- Check availability --------------------------------------------------
function setCheckButtonLoading(isLoading) {
    const btn = document.getElementById("bookingCheckBtn");
    btn.disabled = isLoading;
    btn.textContent = isLoading ? t("checking") : t("checkAvailabilityBtn");
}

async function handleCheckAvailability() {
    clearValidationMessage();
    hideResult();

    // Full validation runs here too — the calendar UI already prevents most
    // of this, but the check never relies on the UI alone.
    if (!bookingState.checkIn || !bookingState.checkOut) {
        showValidationMessage("selectBothDatesMessage");
        return;
    }
    if (bookingState.checkOut <= bookingState.checkIn) {
        showValidationMessage("checkoutAfterCheckinMessage");
        return;
    }
    if (bookingState.checkIn < todayStart()) {
        showValidationMessage("pastDateMessage");
        return;
    }
    // Horizon bounds check-in only — a checkout past it is fine, same as the
    // calendar UI (see isBeyondHorizon in renderCalendar).
    if (bookingState.maxCheckInDate != null && bookingState.checkIn > bookingState.maxCheckInDate) {
        showValidationMessage("bookingHorizonMessage", { date: formatDisplayDate(bookingState.maxCheckInDate) });
        return;
    }

    const nights = diffInNights(bookingState.checkIn, bookingState.checkOut);
    if (nights < bookingState.minimumStay) {
        showValidationMessage("minimumStayMessage", { n: bookingState.minimumStay });
        return;
    }
    if (bookingState.maximumStay != null && nights > bookingState.maximumStay) {
        showValidationMessage("maximumStayMessage", { n: bookingState.maximumStay });
        return;
    }
    if (bookingState.guests > bookingState.maxGuests) {
        showValidationMessage("maxGuestsMessage", { n: bookingState.maxGuests });
        return;
    }

    setCheckButtonLoading(true);
    // Re-read the availability source right before confirming, so a stale
    // client-side calendar can't show a night as available when it no
    // longer is. This is also the natural hook for a future live API call.
    const blocked = await getBlockedDates();
    bookingState.blockedDates = expandBlockedDates(blocked);
    setCheckButtonLoading(false);

    if (!isRangeClear(bookingState.checkIn, bookingState.checkOut)) {
        renderCalendar();
        showResultUnavailable();
        return;
    }

    showResultAvailable(nights);
}

function hideResult() {
    document.getElementById("bookingResult").hidden = true;
    document.getElementById("bookingAvailableState").hidden = true;
    document.getElementById("bookingUnavailableState").hidden = true;
}

function showResultAvailable(nights) {
    bookingState.lastResult = { available: true, nights };

    document.getElementById("bookingResult").hidden = false;
    document.getElementById("bookingAvailableState").hidden = false;
    document.getElementById("bookingUnavailableState").hidden = true;

    renderAvailableSummary();
    document.getElementById("bookingResult").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showResultUnavailable() {
    bookingState.lastResult = { available: false };

    document.getElementById("bookingResult").hidden = false;
    document.getElementById("bookingAvailableState").hidden = true;
    document.getElementById("bookingUnavailableState").hidden = false;
    document.getElementById("bookingResult").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// --- Price calculation ---------------------------------------------------
// Single source of truth for turning a number of nights into a price
// breakdown. Every display surface (result panel, request summary, success
// summary) and the booking-request payload all call this, so the pricing
// rules only live in one place. All values come straight from
// site-data.js — nothing is hardcoded here.
function calculateBookingPrice(nights) {
    const booking = (window.propertyConfig && window.propertyConfig.booking) || {};
    const currency = booking.currency || "";
    const pricePerNight = Number(booking.pricePerNight) || 0;
    const cleaningFee = Number(booking.cleaningFee) || 0;
    const serviceFee = Number(booking.serviceFee) || 0;
    const roomTotal = pricePerNight * nights;
    const total = roomTotal + cleaningFee + serviceFee;
    return { currency, pricePerNight, nights, roomTotal, cleaningFee, serviceFee, total };
}

// Locale used for number formatting, keyed by the site's own language
// toggle — not the visitor's browser/OS locale. That keeps grouping and
// decimal separators identical for every guest regardless of their device
// settings, and still follows the EN/TH choice made on the page.
const NUMBER_LOCALES = { en: "en-US", th: "th-TH" };

function formatMoney(amount, currency) {
    const locale = NUMBER_LOCALES[currentLanguage] || NUMBER_LOCALES.en;
    const formatted = Number(amount).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    return `${formatted}${currency ? " " + currency : ""}`;
}

// Renders the price breakdown as HTML rows (rate × nights, fees, total).
// Returns "" when no per-night rate is configured, so a property that
// isn't ready to show pricing yet can just leave pricePerNight at 0 — the
// calendar and request flow keep working without it.
function renderPriceBreakdownHTML(nights) {
    const price = calculateBookingPrice(nights);
    if (price.pricePerNight <= 0) return "";

    let rows = `<div class="price-row"><span>${formatMoney(price.pricePerNight, price.currency)} × ${nights} ${t("nightsLabel")}</span><span>${formatMoney(price.roomTotal, price.currency)}</span></div>`;

    if (price.cleaningFee > 0) {
        rows += `<div class="price-row"><span>${t("cleaningFeeLabel")}</span><span>${formatMoney(price.cleaningFee, price.currency)}</span></div>`;
    }
    if (price.serviceFee > 0) {
        rows += `<div class="price-row"><span>${t("serviceFeeLabel")}</span><span>${formatMoney(price.serviceFee, price.currency)}</span></div>`;
    }

    rows += `<div class="price-row is-total"><span>${t("estimatedTotal")}</span><span>${formatMoney(price.total, price.currency)}</span></div>`;

    return `<div class="booking-price-breakdown">${rows}</div><p class="booking-price-note">${t("estimateNote")}</p>`;
}

// Small always-visible "X THB / night" hint shown in the sidebar before the
// guest has even picked dates. Hidden entirely when pricePerNight is 0.
function updateRateNote() {
    const el = document.getElementById("bookingRateNote");
    if (!el) return;
    const booking = (window.propertyConfig && window.propertyConfig.booking) || {};
    const pricePerNight = Number(booking.pricePerNight) || 0;

    if (pricePerNight <= 0) {
        el.hidden = true;
        el.textContent = "";
        return;
    }
    el.innerHTML = `<strong>${formatMoney(pricePerNight, booking.currency)}</strong> ${t("perNightSuffix")}`;
    el.hidden = false;
}

function renderAvailableSummary() {
    const result = bookingState.lastResult;
    if (!result || !result.available) return;

    const summaryEl = document.getElementById("bookingAvailableSummary");
    summaryEl.textContent = `${formatDisplayDate(bookingState.checkIn)} → ${formatDisplayDate(bookingState.checkOut)} · ${result.nights} ${t("nightsLabel")} · ${bookingState.guests} ${t("guestsSummary")}`;

    const priceEl = document.getElementById("bookingPriceEstimate");
    const breakdown = renderPriceBreakdownHTML(result.nights);
    priceEl.innerHTML = breakdown;
    priceEl.hidden = !breakdown;
}

function resetToWidget() {
    bookingState.checkOut = null;
    hideResult();
    updateDateDisplays();
    renderCalendar();
}

// --- Booking request form -------------------------------------------------
function showBookingRequestForm() {
    document.getElementById("bookingRequestSection").hidden = false;
    document.getElementById("bookingResult").hidden = true;
    renderRequestSummary();
    document.getElementById("bookingRequestSection").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showResultFromRequest() {
    document.getElementById("bookingRequestSection").hidden = true;
    document.getElementById("bookingResult").hidden = false;
}

function renderRequestSummary() {
    const el = document.getElementById("bookingRequestSummary");
    if (!bookingState.checkIn || !bookingState.checkOut) return;
    const nights = diffInNights(bookingState.checkIn, bookingState.checkOut);
    el.innerHTML = `
        <p class="booking-summary-title">${t("yourStay")}</p>
        <div class="booking-summary-rows">
            <span>${t("checkInLabel")}: <strong>${formatDisplayDate(bookingState.checkIn)}</strong></span>
            <span>${t("checkOutLabel")}: <strong>${formatDisplayDate(bookingState.checkOut)}</strong></span>
            <span>${t("guestsLabel")}: <strong>${bookingState.guests}</strong></span>
        </div>
        ${renderPriceBreakdownHTML(nights)}
    `;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- Form submission -------------------------------------------------
// v1 integration: submits the booking request to Formspree as JSON.
// Throws on failure so handleBookingRequestSubmit's catch block shows the
// generic form error — nothing else needs to change there.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mbgrqqlg";

async function submitBookingRequest(payload) {
    // Honeypot tripped — a bot filled in a field real guests never see.
    // Pretend success without sending anything, so it learns nothing.
    if (payload.honeypot) {
        return Promise.resolve();
    }

    const contactEmail = (window.propertyConfig && window.propertyConfig.booking &&
        window.propertyConfig.booking.contact && window.propertyConfig.booking.contact.email) || "";

    const body = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        nights: payload.nights,
        guests: payload.guests,
        property: payload.property,
        estimatedTotal: payload.price && payload.price.pricePerNight > 0
            ? formatMoney(payload.price.total, payload.price.currency)
            : "",
        _replyto: payload.email,
        _subject: `Booking request: ${payload.property} — ${payload.checkIn} to ${payload.checkOut}`,
        _gotcha: payload.honeypot
    };
    // CC the property's own contact address (site-data.js) so the request
    // still reaches the owner even if it differs from the Formspree
    // account's registered notification address.
    if (contactEmail) {
        body._cc = contactEmail;
    }

    let response;
    try {
        response = await fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body)
        });
    } catch (networkError) {
        throw new Error("Network error while sending booking request.");
    }

    if (!response.ok) {
        let detail = "";
        try {
            const data = await response.json();
            if (data && Array.isArray(data.errors)) {
                detail = data.errors.map(e => e.message).join(", ");
            }
        } catch (parseError) {
            // Response body wasn't JSON — fall back to the status text below.
        }
        throw new Error(detail || `Formspree request failed with status ${response.status}`);
    }
}

async function handleBookingRequestSubmit(event) {
    event.preventDefault();

    const nameEl = document.getElementById("reqName");
    const emailEl = document.getElementById("reqEmail");
    const phoneEl = document.getElementById("reqPhone");
    const messageEl = document.getElementById("reqMessage");
    const honeypotEl = document.getElementById("reqCompany");
    const errorEl = document.getElementById("bookingFormError");

    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const phone = phoneEl.value.trim();
    const message = messageEl.value.trim();
    const honeypot = honeypotEl ? honeypotEl.value.trim() : "";

    errorEl.hidden = true;
    errorEl.textContent = "";

    if (!name || !email || !phone) {
        errorEl.textContent = t("formErrorRequired");
        errorEl.hidden = false;
        return;
    }
    if (!isValidEmail(email)) {
        errorEl.textContent = t("formErrorEmail");
        errorEl.hidden = false;
        return;
    }
    if (!bookingState.checkIn || !bookingState.checkOut) {
        errorEl.textContent = t("formErrorGeneric");
        errorEl.hidden = false;
        return;
    }

    const nights = diffInNights(bookingState.checkIn, bookingState.checkOut);
    const payload = {
        name, email, phone, message,
        checkIn: formatISODate(bookingState.checkIn),
        checkOut: formatISODate(bookingState.checkOut),
        nights,
        guests: bookingState.guests,
        price: calculateBookingPrice(nights),
        property: getText(window.propertyConfig && window.propertyConfig.name),
        honeypot
    };

    const submitBtn = document.getElementById("sendRequestBtn");
    submitBtn.disabled = true;
    submitBtn.textContent = t("sending");

    try {
        await submitBookingRequest(payload);
        document.getElementById("bookingRequestForm").reset();
        showBookingSuccess();
    } catch (error) {
        errorEl.textContent = t("formErrorGeneric");
        errorEl.hidden = false;
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t("sendBookingRequest");
    }
}

// --- Success --------------------------------------------------------------
function showBookingSuccess() {
    document.getElementById("bookingWidget").hidden = true;
    document.getElementById("bookingResult").hidden = true;
    document.getElementById("bookingRequestSection").hidden = true;

    renderSuccessSummary();

    document.getElementById("bookingSuccess").hidden = false;
    document.getElementById("bookingSuccess").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderSuccessSummary() {
    if (!bookingState.checkIn || !bookingState.checkOut) return;
    const nights = diffInNights(bookingState.checkIn, bookingState.checkOut);
    const el = document.getElementById("bookingSuccessSummary");
    el.innerHTML = `
        <div class="booking-summary-rows">
            <span>${t("checkInLabel")}: <strong>${formatDisplayDate(bookingState.checkIn)}</strong></span>
            <span>${t("checkOutLabel")}: <strong>${formatDisplayDate(bookingState.checkOut)}</strong></span>
            <span>${t("guestsLabel")}: <strong>${bookingState.guests}</strong></span>
        </div>
        ${renderPriceBreakdownHTML(nights)}
    `;
}

function handleBackToProperty() {
    document.getElementById("bookingSuccess").hidden = true;
    document.getElementById("bookingWidget").hidden = false;

    bookingState.checkIn = null;
    bookingState.checkOut = null;
    bookingState.guests = 1;
    bookingState.lastResult = null;
    document.getElementById("bookingGuests").value = "1";

    clearValidationMessage();
    hideResult();
    updateDateDisplays();
    renderCalendar();

    document.getElementById("overview").scrollIntoView({ behavior: "smooth", block: "start" });
}

// --- Re-translate dynamic booking content on language switch --------------
function refreshBookingTexts() {
    if (!bookingInitialized) return;

    renderCalendar();
    updateDateDisplays();
    updateRateNote();

    if (bookingState.messageKey) {
        document.getElementById("bookingValidationMessage").textContent = t(bookingState.messageKey, bookingState.messageParams);
    }

    if (bookingState.lastResult && bookingState.lastResult.available) {
        renderAvailableSummary();
    }

    const requestSection = document.getElementById("bookingRequestSection");
    if (requestSection && !requestSection.hidden) {
        renderRequestSummary();
    }

    const successSection = document.getElementById("bookingSuccess");
    if (successSection && !successSection.hidden) {
        renderSuccessSummary();
    }

    const checkBtn = document.getElementById("bookingCheckBtn");
    if (checkBtn && !checkBtn.disabled) {
        checkBtn.textContent = t("checkAvailabilityBtn");
    }
}

// INIT
initAnalytics();
setLanguage(currentLanguage);
initBooking();