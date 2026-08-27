// Tests for schema/property-config.schema.json, driven through
// scripts/validate-config.js (which shells out to `npx ajv-cli@5.0.0` — a
// real, standard Draft-07 validator, not a hand-rolled one).
//
// Each test loads the REAL site-data.js config, deep-clones it, and mutates
// exactly one thing before writing it to a temp file and validating —
// so a failure can only be caused by the one intentional violation, not by
// some unrelated field the fixture forgot to fill in.
//
// These tests need npm/npx + network access to fetch ajv-cli (cached after
// the first run). If that's unavailable, scripts/validate-config.js exits 2
// ("could not validate"), not 0 or 1 — these tests fail loudly rather than
// silently passing, exactly as scripts/validate-config.js is designed to.
//
// Run with: node --test
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..");
const SITE_DATA_PATH = path.join(ROOT, "site-data.js");
const VALIDATE_SCRIPT = path.join(ROOT, "scripts", "validate-config.js");

function loadRealConfig() {
    const source = fs.readFileSync(SITE_DATA_PATH, "utf8");
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: SITE_DATA_PATH });
    return JSON.parse(JSON.stringify(sandbox.window.propertyConfig)); // deep clone, JSON-safe
}

// Runs scripts/validate-config.js against a given config object and returns
// { status, stdout, stderr }. status 0 = valid, 1 = invalid, 2 = could not
// validate (npm/network unavailable, etc — never treat this as a pass).
function validate(configObject) {
    const tmpFile = path.join(
        os.tmpdir(),
        `schema-test-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}.json`
    );
    fs.writeFileSync(tmpFile, JSON.stringify(configObject, null, 2), "utf8");
    try {
        return spawnSync(process.execPath, [VALIDATE_SCRIPT, "--input", tmpFile], { encoding: "utf8" });
    } finally {
        fs.rmSync(tmpFile, { force: true });
    }
}

function assertSchemaViolation(result) {
    assert.notEqual(
        result.status, 2,
        `validate-config.js could not run the validator at all (exit 2) — npm/network may be unavailable. ` +
        `stderr:\n${result.stderr}`
    );
    assert.equal(
        result.status, 1,
        `expected exit 1 (schema violation), got ${result.status}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
}

// --- Positive case ----------------------------------------------------------

test("current site-data.js passes schema validation unchanged", () => {
    const result = spawnSync(process.execPath, [VALIDATE_SCRIPT], { encoding: "utf8" });
    assert.notEqual(
        result.status, 2,
        `validate-config.js could not run the validator at all (exit 2) — npm/network may be unavailable. ` +
        `stderr:\n${result.stderr}`
    );
    assert.equal(
        result.status, 0,
        `expected exit 0 (valid), got ${result.status}.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`
    );
});

// --- Negative cases -----------------------------------------------------------

test("negative: missing required field (name) fails schema validation", () => {
    const config = loadRealConfig();
    delete config.name;
    assertSchemaViolation(validate(config));
});

test("negative: wrong datatype (gallery as a string, not an array) fails schema validation", () => {
    const config = loadRealConfig();
    config.gallery = "not-an-array";
    assertSchemaViolation(validate(config));
});

test("negative: malformed gallery item (missing width) fails schema validation", () => {
    const config = loadRealConfig();
    config.gallery = [
        { src: "assets/images/hero.webp", alt: { en: "Hero", th: "Hero" }, height: 600 }
        // width intentionally omitted — required by galleryItem
    ];
    assertSchemaViolation(validate(config));
});

test("negative: booking.minimumStay = 0 fails schema validation", () => {
    const config = loadRealConfig();
    config.booking.minimumStay = 0;
    assertSchemaViolation(validate(config));
});

test("negative: booking.enabled = true with empty formspreeEndpoint fails schema validation", () => {
    const config = loadRealConfig();
    config.booking.enabled = true;
    config.booking.formspreeEndpoint = "";
    assertSchemaViolation(validate(config));
});
