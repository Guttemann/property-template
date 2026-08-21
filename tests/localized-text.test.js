// Unit tests for resolveLocalizedText() in booking-logic.js — the shared
// fallback logic behind getText() in script.js.
//
// This exists to guard the getText()/t() fallback-consistency fix: an
// explicit empty string for the current language must be treated the same
// as a missing key (both fall through to fallbackLanguage), matching the
// documented localizedTextOptional behavior in
// schema/property-config.schema.json (e.g. seo.title.th: "").
//
// Run with: node --test
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveLocalizedText } = require("../booking-logic.js");

test("resolveLocalizedText returns a plain string unchanged", () => {
    assert.equal(resolveLocalizedText("Villa", "th", "en"), "Villa");
});

test("resolveLocalizedText returns the current language's value when present", () => {
    assert.equal(resolveLocalizedText({ en: "Villa", th: "วิลล่า" }, "th", "en"), "วิลล่า");
});

test("resolveLocalizedText falls back when the current language key is missing", () => {
    assert.equal(resolveLocalizedText({ en: "Villa" }, "th", "en"), "Villa");
});

test("resolveLocalizedText treats an explicit empty string as untranslated and falls back", () => {
    assert.equal(resolveLocalizedText({ en: "Villa", th: "" }, "th", "en"), "Villa");
});

test("resolveLocalizedText returns an empty string when both languages are empty/missing", () => {
    assert.equal(resolveLocalizedText({ en: "", th: "" }, "th", "en"), "");
    assert.equal(resolveLocalizedText({}, "th", "en"), "");
});

test("resolveLocalizedText returns an empty string for null/undefined input", () => {
    assert.equal(resolveLocalizedText(null, "th", "en"), "");
    assert.equal(resolveLocalizedText(undefined, "th", "en"), "");
});

test("resolveLocalizedText does not need the fallback language when the current one is set", () => {
    assert.equal(resolveLocalizedText({ en: "", th: "วิลล่า" }, "th", "en"), "วิลล่า");
});
