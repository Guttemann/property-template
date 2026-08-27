// Unit tests for the booking.* config parsing in booking-logic.js
// (minimumStay/maximumStay/bookingHorizonMonths/maximumGuests). Each field
// has its own deliberately different fail-open/fail-closed behavior for an
// invalid value — see the comments in booking-logic.js.
// Run with: node --test
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const {
    DEFAULT_BOOKING_HORIZON_MONTHS,
    parseMinimumStay,
    parseMaximumStay,
    parseBookingHorizonMonths,
    parseMaximumGuests
} = require("../booking-logic.js");

// --- parseMinimumStay --------------------------------------------------------

test("parseMinimumStay uses the configured value", () => {
    assert.equal(parseMinimumStay(3), 3);
    assert.equal(parseMinimumStay("5"), 5);
});

test("parseMinimumStay falls back to 1 when unset", () => {
    assert.equal(parseMinimumStay(undefined), 1);
});

test("parseMinimumStay floors an invalid or non-positive value to 1", () => {
    // Documented existing quirk (see audit §04, not fixed by this batch): a
    // deliberate 0 is indistinguishable from "not set" here, since both
    // fall back through `Number(rawValue) || 1`.
    assert.equal(parseMinimumStay(0), 1);
    assert.equal(parseMinimumStay(-5), 1);
    assert.equal(parseMinimumStay("not a number"), 1);
    assert.equal(parseMinimumStay(null), 1);
});

// --- parseMaximumStay --------------------------------------------------------

test("parseMaximumStay uses the configured value when valid", () => {
    assert.equal(parseMaximumStay(14, 1), 14);
    assert.equal(parseMaximumStay("30", 2), 30);
});

test("parseMaximumStay treats null/undefined as no maximum", () => {
    assert.equal(parseMaximumStay(null, 1), null);
    assert.equal(parseMaximumStay(undefined, 1), null);
});

test("parseMaximumStay fails open to no maximum on a non-finite value, and warns", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    assert.equal(parseMaximumStay("not a number", 1), null);
    assert.equal(parseMaximumStay(NaN, 1), null);
    assert.equal(parseMaximumStay(Infinity, 1), null);
    assert.equal(warnMock.mock.calls.length, 3);
});

test("parseMaximumStay fails open to no maximum when below minimumStay, and warns", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    assert.equal(parseMaximumStay(2, 5), null);
    assert.equal(warnMock.mock.calls.length, 1);
    assert.match(warnMock.mock.calls[0].arguments[0], /Invalid booking\.maximumStay/);
});

// --- parseBookingHorizonMonths ------------------------------------------------

test("parseBookingHorizonMonths uses the configured value when valid", () => {
    assert.equal(parseBookingHorizonMonths(6), 6);
    assert.equal(parseBookingHorizonMonths("18"), 18);
});

test("parseBookingHorizonMonths treats explicit null as an opt-out (no horizon)", () => {
    assert.equal(parseBookingHorizonMonths(null), null);
});

test("parseBookingHorizonMonths defaults an omitted field to the default horizon", () => {
    assert.equal(parseBookingHorizonMonths(undefined), DEFAULT_BOOKING_HORIZON_MONTHS);
});

test("parseBookingHorizonMonths fails closed to the default on an invalid value, and warns", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    assert.equal(parseBookingHorizonMonths(0), DEFAULT_BOOKING_HORIZON_MONTHS);
    assert.equal(parseBookingHorizonMonths(-3), DEFAULT_BOOKING_HORIZON_MONTHS);
    assert.equal(parseBookingHorizonMonths("not a number"), DEFAULT_BOOKING_HORIZON_MONTHS);
    assert.equal(warnMock.mock.calls.length, 3);
    assert.match(warnMock.mock.calls[0].arguments[0], /Invalid booking\.bookingHorizonMonths/);
});

// --- parseMaximumGuests -------------------------------------------------------

test("parseMaximumGuests uses the configured value", () => {
    assert.equal(parseMaximumGuests(15), 15);
    assert.equal(parseMaximumGuests("8"), 8);
});

test("parseMaximumGuests floors an unset/invalid/non-positive value to 1", () => {
    assert.equal(parseMaximumGuests(undefined), 1);
    assert.equal(parseMaximumGuests(0), 1);
    assert.equal(parseMaximumGuests(-2), 1);
    assert.equal(parseMaximumGuests("not a number"), 1);
});
