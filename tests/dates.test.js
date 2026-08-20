// Unit tests for the date/blocked-dates logic in booking-logic.js.
// Run with: node --test
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
    formatISODate,
    parseISODate,
    addDays,
    startOfDay,
    isSameDate,
    diffInNights,
    isValidISODateString,
    expandBlockedDates,
    computeMaxCheckInDate,
    isRangeClear
} = require("../booking-logic.js");

// --- Basic date helpers ----------------------------------------------------

test("formatISODate/parseISODate round-trip", () => {
    const date = new Date(2026, 7, 20); // Aug 20 2026 (month is 0-indexed)
    assert.equal(formatISODate(date), "2026-08-20");
    assert.deepEqual(parseISODate("2026-08-20"), date);
});

test("addDays adds/subtracts calendar days, including across month boundaries", () => {
    assert.equal(formatISODate(addDays(parseISODate("2026-08-30"), 1)), "2026-08-31");
    assert.equal(formatISODate(addDays(parseISODate("2026-08-31"), 1)), "2026-09-01");
    assert.equal(formatISODate(addDays(parseISODate("2026-09-01"), -1)), "2026-08-31");
});

test("startOfDay zeroes the time component", () => {
    const withTime = new Date(2026, 7, 20, 23, 59, 59);
    const zeroed = startOfDay(withTime);
    assert.equal(zeroed.getHours(), 0);
    assert.equal(zeroed.getMinutes(), 0);
    assert.equal(zeroed.getSeconds(), 0);
    assert.equal(formatISODate(zeroed), "2026-08-20");
});

test("isSameDate ignores time-of-day, compares calendar date only", () => {
    assert.ok(isSameDate(new Date(2026, 7, 20, 1, 0), new Date(2026, 7, 20, 23, 0)));
    assert.ok(!isSameDate(new Date(2026, 7, 20), new Date(2026, 7, 21)));
});

test("diffInNights counts nights between two dates", () => {
    assert.equal(diffInNights(parseISODate("2026-08-20"), parseISODate("2026-08-22")), 2);
    assert.equal(diffInNights(parseISODate("2026-08-20"), parseISODate("2026-08-21")), 1);
    assert.equal(diffInNights(parseISODate("2026-08-20"), parseISODate("2026-08-20")), 0);
});

// --- isValidISODateString ---------------------------------------------------

test("isValidISODateString accepts real calendar dates in YYYY-MM-DD form", () => {
    assert.ok(isValidISODateString("2026-08-20"));
    assert.ok(isValidISODateString("2026-02-28"));
    assert.ok(isValidISODateString("2024-02-29")); // 2024 is a leap year
});

test("isValidISODateString rejects dates that don't really exist", () => {
    // These pass the regex but the Date constructor would silently roll
    // them over to a real date (e.g. Feb 30 -> Mar 2) — that rollover is
    // exactly what this function exists to catch.
    assert.ok(!isValidISODateString("2026-02-30"));
    assert.ok(!isValidISODateString("2026-13-01"));
    assert.ok(!isValidISODateString("2023-02-29")); // 2023 is not a leap year
});

test("isValidISODateString rejects malformed input", () => {
    assert.ok(!isValidISODateString("20-08-2026"));
    assert.ok(!isValidISODateString("2026/08/20"));
    assert.ok(!isValidISODateString(""));
    assert.ok(!isValidISODateString(null));
    assert.ok(!isValidISODateString(undefined));
    assert.ok(!isValidISODateString(20260820));
});

// --- expandBlockedDates ------------------------------------------------------

test("expandBlockedDates expands a single valid date string", () => {
    const result = expandBlockedDates(["2026-08-20"]);
    assert.deepEqual([...result], ["2026-08-20"]);
});

test("expandBlockedDates expands a { from, to } range inclusively, excluding the day after", () => {
    const result = expandBlockedDates([{ from: "2026-08-20", to: "2026-08-22" }]);
    assert.deepEqual([...result].sort(), ["2026-08-20", "2026-08-21", "2026-08-22"]);
    assert.ok(!result.has("2026-08-23"), "the day after `to` must stay open for the next guest's check-in");
    assert.ok(!result.has("2026-08-19"));
});

test("expandBlockedDates mixes single dates and ranges", () => {
    const result = expandBlockedDates(["2026-09-05", { from: "2026-08-20", to: "2026-08-21" }]);
    assert.deepEqual([...result].sort(), ["2026-08-20", "2026-08-21", "2026-09-05"]);
});

test("expandBlockedDates drops a malformed single date and warns", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    const result = expandBlockedDates(["2026-02-30", "2026-08-20"]);
    assert.deepEqual([...result], ["2026-08-20"]);
    assert.equal(warnMock.mock.calls.length, 1);
    assert.match(warnMock.mock.calls[0].arguments[0], /Invalid blocked date/);
});

test("expandBlockedDates drops a reversed range (from after to) and warns", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    const result = expandBlockedDates([{ from: "2026-08-22", to: "2026-08-20" }]);
    assert.equal(result.size, 0);
    assert.equal(warnMock.mock.calls.length, 1);
    assert.match(warnMock.mock.calls[0].arguments[0], /"from" is after "to"/);
});

test("expandBlockedDates drops a range with an invalid from/to date and warns", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    const result = expandBlockedDates([{ from: "2026-02-30", to: "2026-08-20" }]);
    assert.equal(result.size, 0);
    assert.equal(warnMock.mock.calls.length, 1);
    assert.match(warnMock.mock.calls[0].arguments[0], /must both be real calendar dates/);
});

test("expandBlockedDates drops a range longer than the max and warns (typo'd year guard)", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    const result = expandBlockedDates([{ from: "2026-08-20", to: "2029-08-20" }]); // ~3 years
    assert.equal(result.size, 0);
    assert.equal(warnMock.mock.calls.length, 1);
    assert.match(warnMock.mock.calls[0].arguments[0], /over the 730-night limit/);
});

test("expandBlockedDates drops an entry of the wrong shape and warns", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    const result = expandBlockedDates([42, { foo: "bar" }]);
    assert.equal(result.size, 0);
    assert.equal(warnMock.mock.calls.length, 2);
});

test("expandBlockedDates treats non-array input as no blocked dates", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    assert.equal(expandBlockedDates(undefined).size, 0);
    assert.equal(expandBlockedDates(null).size, 0);
    assert.equal(warnMock.mock.calls.length, 0, "null/undefined is the documented empty case, not a config error");

    assert.equal(expandBlockedDates("not an array").size, 0);
    assert.equal(warnMock.mock.calls.length, 1, "a non-null non-array value is a real config mistake and should warn");
});

// --- computeMaxCheckInDate ---------------------------------------------------

test("computeMaxCheckInDate returns null when there is no horizon", () => {
    assert.equal(computeMaxCheckInDate(null), null);
});

test("computeMaxCheckInDate returns today + N months at midnight", () => {
    const result = computeMaxCheckInDate(12);
    const expected = new Date();
    expected.setHours(0, 0, 0, 0);
    expected.setMonth(expected.getMonth() + 12);
    assert.deepEqual(result, expected);
});

// --- isRangeClear (turnover / overlap) ---------------------------------------

test("isRangeClear allows a fully unblocked range", () => {
    const blocked = expandBlockedDates([]);
    assert.ok(isRangeClear(parseISODate("2026-08-18"), parseISODate("2026-08-20"), blocked));
});

test("isRangeClear allows checking out on the first night of another guest's blocked range (same-day turnover)", () => {
    // Nights of the 20th and 21st are occupied by another booking. A guest
    // checking out on the 20th only occupies the night of the 19th — the
    // 20th itself is never checked, so the departing guest's stay and the
    // next guest's stay share that calendar day with zero night overlap.
    const blocked = expandBlockedDates([{ from: "2026-08-20", to: "2026-08-21" }]);
    assert.ok(isRangeClear(parseISODate("2026-08-18"), parseISODate("2026-08-20"), blocked));
});

test("isRangeClear allows checking in on the day right after a blocked range ends", () => {
    const blocked = expandBlockedDates([{ from: "2026-08-20", to: "2026-08-21" }]);
    assert.ok(isRangeClear(parseISODate("2026-08-22"), parseISODate("2026-08-24"), blocked));
});

test("isRangeClear rejects a range whose check-in night is blocked", () => {
    const blocked = expandBlockedDates([{ from: "2026-08-20", to: "2026-08-21" }]);
    assert.ok(!isRangeClear(parseISODate("2026-08-20"), parseISODate("2026-08-22"), blocked));
});

test("isRangeClear rejects a range that overlaps a blocked night in the middle", () => {
    const blocked = expandBlockedDates([{ from: "2026-08-20", to: "2026-08-21" }]);
    assert.ok(!isRangeClear(parseISODate("2026-08-18"), parseISODate("2026-08-22"), blocked));
});
