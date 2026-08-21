// =========================
// BOOKING LOGIC (pure, DOM-free)
// =========================
// Date/blocked-dates/price/validation helpers used by script.js, split out
// into their own file purely so they can be exercised directly in Node for
// unit tests (see tests/) without a browser/DOM. Loaded as a plain <script>
// before script.js — same pattern translations.js/site-data.js already use
// — so every function here is still just a shared global by the time
// script.js runs, and every existing call site behaves exactly as before.
// No module system or build step is introduced by this file; the
// module.exports guard at the bottom is inert in the browser (there is no
// `module` global there) and only used by the Node test files.

const BLOCKED_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BLOCKED_RANGE_NIGHTS = 730; // ~2 years; catches a typo'd year turning one range into a huge/frozen block
const DEFAULT_BOOKING_HORIZON_MONTHS = 12;

// Fallback locale for number formatting when booking.numberLocales in
// site-data.js is missing, missing an entry for the current language, or
// contains a locale string toLocaleString() rejects. Keeps price display
// from ever breaking over a config typo.
const DEFAULT_NUMBER_LOCALE = "en-US";

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

function isSameDate(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function diffInNights(checkIn, checkOut) {
    return Math.round((startOfDay(checkOut) - startOfDay(checkIn)) / 86400000);
}

// Last selectable check-in date, or null if there's no horizon. Uses the
// same setMonth() arithmetic as shiftMonth() in script.js, so a horizon
// crossing a short month (e.g. today = Jan 31, +1 month) rolls over
// consistently with how month navigation already behaves.
function computeMaxCheckInDate(bookingHorizonMonths) {
    if (bookingHorizonMonths == null) return null;
    const max = todayStart();
    max.setMonth(max.getMonth() + bookingHorizonMonths);
    return max;
}

// Rejects anything that isn't a real calendar date in "YYYY-MM-DD" form —
// including strings like "2026-02-30" that the regex lets through but that
// the Date constructor would otherwise silently normalize to March 2.
function isValidISODateString(value) {
    if (typeof value !== "string" || !BLOCKED_DATE_RE.test(value)) return false;
    return formatISODate(parseISODate(value)) === value;
}

// Blocked-date entries can be a single "YYYY-MM-DD" string or a
// { from, to } range (inclusive) — this expands both into one flat Set of
// ISO date strings that the calendar can check in O(1). Keeping this
// separate from getBlockedDates() (script.js) means a future iCal/API
// source can return either shape too, with no changes needed here.
//
// Each date in the returned Set means "the night starting on this date is
// occupied" — it does not mean the calendar day is fully closed. The day
// right after a range's `to` is deliberately left out, so it stays open as
// a check-in for the next guest, and renderCalendar() (script.js) separately
// allows a blocked date to still be picked as a check-out — together that's
// what makes back-to-back turnover days work. isRangeClear() below is the
// other half of that: it never checks the check-out date itself, only the
// nights strictly between check-in and check-out.
//
// site-data.js is hand-edited per property, so entries here can be
// malformed in ways nothing else catches: a typo'd date, a reversed range,
// the wrong shape entirely. A malformed entry that silently disappears is
// dangerous in the "open" direction — the calendar shows the night as
// available and a guest can double-book it — so every entry is validated
// and anything that doesn't check out is dropped with a console.warn
// (never guessed at, never left to throw).
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

// Whether every night from checkIn up to (but not including) checkOut is
// free. blockedDates is the Set produced by expandBlockedDates() — passed
// in explicitly (rather than read off bookingState in script.js) so this
// stays a pure function. checkOut itself is never checked, which is what
// lets a guest check out on a date that starts another guest's blocked
// stay (same-day turnover) — see the expandBlockedDates() comment above.
function isRangeClear(checkIn, checkOut, blockedDates) {
    let cursor = new Date(checkIn);
    while (cursor < checkOut) {
        if (blockedDates.has(formatISODate(cursor))) return false;
        cursor = addDays(cursor, 1);
    }
    return true;
}

// --- Booking rule config parsing ------------------------------------------
// Each of config.booking's numeric rules has its own, deliberately
// different fail-open/fail-closed behavior for an invalid value (see the
// comments on each function) — this is not a generic parser because the
// "safe" fallback direction differs per field.

// A deliberate 0 in config is indistinguishable from "not set" here (both
// fall back to 1) — a known, low-impact quirk (a 0-night minimum stay is
// meaningless anyway) rather than a bug fixed as part of this change.
function parseMinimumStay(rawValue) {
    return Math.max(1, Number(rawValue) || 1);
}

// Fails open to "no maximum" instead of clamping to minimumStay, which
// would silently reject nearly every booking under a typo'd config.
function parseMaximumStay(rawValue, minimumStay) {
    if (rawValue == null) return null;
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed < minimumStay) {
        console.warn(`Invalid booking.maximumStay (${JSON.stringify(rawValue)}); treating as no maximum.`);
        return null;
    }
    return parsed;
}

// Fails open to the safe default rather than "no horizon" — unlike
// maximumStay, the open/unlimited direction here is the risky one (see the
// bookingHorizonMonths comment in site-data.js), so a typo'd config
// shouldn't silently remove the guardrail. null is a deliberate explicit
// opt-out and passes through as-is; undefined (field omitted) uses the
// default, same as an invalid value would.
function parseBookingHorizonMonths(rawValue) {
    if (rawValue === null) return null;
    if (rawValue === undefined) return DEFAULT_BOOKING_HORIZON_MONTHS;
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        console.warn(`Invalid booking.bookingHorizonMonths (${JSON.stringify(rawValue)}); using the default of ${DEFAULT_BOOKING_HORIZON_MONTHS} months.`);
        return DEFAULT_BOOKING_HORIZON_MONTHS;
    }
    return parsed;
}

function parseMaximumGuests(rawValue) {
    return Math.max(1, Number(rawValue) || 1);
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

// Locale used for number formatting, keyed by the site's own EN/TH toggle
// — not the visitor's browser/OS locale. That keeps grouping and decimal
// separators identical for every guest regardless of their device
// settings. Read from site-data.js (booking.numberLocales) so a property
// with a different language/locale pairing doesn't require a script.js
// change. `language` is passed in explicitly by callers in script.js
// (the shared currentLanguage state) rather than read as a global here, so
// this function stays pure and testable on its own.
function formatMoney(amount, currency, language) {
    const numberLocales = (window.propertyConfig && window.propertyConfig.booking && window.propertyConfig.booking.numberLocales) || {};
    const locale = numberLocales[language] || numberLocales.en || DEFAULT_NUMBER_LOCALE;

    let formatted;
    try {
        formatted = Number(amount).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    } catch (error) {
        console.warn(`Invalid booking.numberLocales value (${JSON.stringify(locale)}) for language "${language}"; falling back to "${DEFAULT_NUMBER_LOCALE}".`, error);
        formatted = Number(amount).toLocaleString(DEFAULT_NUMBER_LOCALE, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    return `${formatted}${currency ? " " + currency : ""}`;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Node test entry point only — a classic <script> has no `module` global,
// so this block never runs in the browser.
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        BLOCKED_DATE_RE,
        MAX_BLOCKED_RANGE_NIGHTS,
        DEFAULT_BOOKING_HORIZON_MONTHS,
        DEFAULT_NUMBER_LOCALE,
        startOfDay,
        todayStart,
        formatISODate,
        parseISODate,
        addDays,
        isSameDate,
        diffInNights,
        computeMaxCheckInDate,
        isValidISODateString,
        expandBlockedDates,
        isRangeClear,
        parseMinimumStay,
        parseMaximumStay,
        parseBookingHorizonMonths,
        parseMaximumGuests,
        calculateBookingPrice,
        formatMoney,
        isValidEmail
    };
}
