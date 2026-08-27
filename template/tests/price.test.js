// Unit tests for calculateBookingPrice(), formatMoney() and isValidEmail()
// in booking-logic.js.
//
// calculateBookingPrice()/formatMoney() read window.propertyConfig, which
// only exists in a browser. There's no DOM involved in either function —
// just a plain object property lookup — so each test stubs `global.window`
// with a plain object literal (not jsdom/a DOM shim) before calling them,
// matching exactly what a real browser already provides.
//
// Run with: node --test
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateBookingPrice, formatMoney, isValidEmail } = require("../booking-logic.js");

function setBookingConfig(booking) {
    global.window = { propertyConfig: { booking } };
}

test.afterEach(() => {
    delete global.window;
});

// --- calculateBookingPrice ---------------------------------------------------

test("calculateBookingPrice computes a normal one-night price", () => {
    setBookingConfig({ currency: "THB", pricePerNight: 10000, cleaningFee: 0, serviceFee: 0 });
    const price = calculateBookingPrice(1);
    assert.deepEqual(price, {
        currency: "THB", pricePerNight: 10000, nights: 1,
        roomTotal: 10000, cleaningFee: 0, serviceFee: 0, total: 10000
    });
});

test("calculateBookingPrice scales the room total by number of nights", () => {
    setBookingConfig({ currency: "THB", pricePerNight: 10000, cleaningFee: 0, serviceFee: 0 });
    const price = calculateBookingPrice(5);
    assert.equal(price.roomTotal, 50000);
    assert.equal(price.total, 50000);
});

test("calculateBookingPrice adds cleaning and service fees to the total, not the room total", () => {
    setBookingConfig({ currency: "THB", pricePerNight: 10000, cleaningFee: 500, serviceFee: 200 });
    const price = calculateBookingPrice(2);
    assert.equal(price.roomTotal, 20000);
    assert.equal(price.total, 20700);
    assert.equal(price.cleaningFee, 500);
    assert.equal(price.serviceFee, 200);
});

test("calculateBookingPrice supports a 0 pricePerNight (price display hidden by callers, not by this function)", () => {
    setBookingConfig({ currency: "THB", pricePerNight: 0, cleaningFee: 0, serviceFee: 0 });
    const price = calculateBookingPrice(3);
    assert.equal(price.pricePerNight, 0);
    assert.equal(price.roomTotal, 0);
    assert.equal(price.total, 0);
});

test("calculateBookingPrice defaults missing/malformed booking config to zero instead of throwing", () => {
    setBookingConfig({}); // no currency/pricePerNight/fees at all
    const price = calculateBookingPrice(3);
    assert.deepEqual(price, {
        currency: "", pricePerNight: 0, nights: 3,
        roomTotal: 0, cleaningFee: 0, serviceFee: 0, total: 0
    });
});

test("calculateBookingPrice defaults to zero when window.propertyConfig itself is missing", () => {
    global.window = {};
    const price = calculateBookingPrice(2);
    assert.equal(price.pricePerNight, 0);
    assert.equal(price.total, 0);
});

// --- formatMoney --------------------------------------------------------------

test("formatMoney formats using the locale configured for the given language", () => {
    setBookingConfig({ numberLocales: { en: "en-US", th: "th-TH" } });
    assert.equal(formatMoney(10000, "THB", "en"), "10,000 THB");
    assert.equal(formatMoney(10000, "THB", "th"), "10,000 THB");
});

test("formatMoney respects maximumFractionDigits: 2", () => {
    setBookingConfig({ numberLocales: { en: "en-US" } });
    assert.equal(formatMoney(1234.5, "THB", "en"), "1,234.5 THB");
});

test("formatMoney omits the currency suffix when currency is falsy", () => {
    setBookingConfig({ numberLocales: { en: "en-US" } });
    assert.equal(formatMoney(1000, "", "en"), "1,000");
    assert.equal(formatMoney(1000, undefined, "en"), "1,000");
});

test("formatMoney falls back to en-US when booking.numberLocales is missing entirely", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    setBookingConfig({}); // no numberLocales field
    assert.equal(formatMoney(10000, "THB", "en"), "10,000 THB");
    assert.equal(warnMock.mock.calls.length, 0, "a missing config field is an expected case, not a warning-worthy error");
});

test("formatMoney falls back to the en entry when the requested language has no entry", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    setBookingConfig({ numberLocales: { en: "en-US" } }); // no "th"
    assert.equal(formatMoney(10000, "THB", "th"), "10,000 THB");
    assert.equal(warnMock.mock.calls.length, 0);
});

test("formatMoney falls back to en-US and warns once on an invalid locale string", (t) => {
    const warnMock = t.mock.method(console, "warn", () => {});
    setBookingConfig({ numberLocales: { en: "not-a-locale!!" } });
    assert.equal(formatMoney(10000, "THB", "en"), "10,000 THB");
    assert.equal(warnMock.mock.calls.length, 1);
    assert.match(warnMock.mock.calls[0].arguments[0], /Invalid booking\.numberLocales value/);
});

// --- isValidEmail ---------------------------------------------------------

test("isValidEmail accepts well-formed addresses", () => {
    assert.ok(isValidEmail("guest@example.com"));
    assert.ok(isValidEmail("first.last+tag@sub.example.co.uk"));
});

test("isValidEmail rejects malformed addresses", () => {
    assert.ok(!isValidEmail("not-an-email"));
    assert.ok(!isValidEmail("missing-domain@"));
    assert.ok(!isValidEmail("@missing-local.com"));
    assert.ok(!isValidEmail("has spaces@example.com"));
    assert.ok(!isValidEmail(""));
});
