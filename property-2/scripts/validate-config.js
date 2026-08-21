#!/usr/bin/env node
// Validates window.propertyConfig (site-data.js) against
// schema/property-config.schema.json.
//
// No project dependency is introduced for this: it shells out to the real,
// standard, spec-compliant validator via `npx ajv-cli@5.0.0` (pinned for
// reproducibility), which ajv-cli validates as JSON Schema Draft-07 by
// default (--spec=draft7). Nothing is installed into this repo — npx runs
// it from its own cache/registry fetch and nothing is written here besides
// a throwaway temp file with the extracted config.
//
// This is a development/quality tool only. It is never loaded by index.html
// and has no effect on the live site.
//
// Usage:
//   node scripts/validate-config.js                  Validates site-data.js
//   node scripts/validate-config.js --input <file>    Validates a given JSON
//                                                      file instead (used by
//                                                      tests/schema-validation.test.js
//                                                      to check negative cases)
//
// Exit codes:
//   0  valid — data matches the schema
//   1  invalid — ajv-cli found schema violations (see output)
//   2  could NOT validate at all (npm/npx unavailable, no network, schema
//      or input file missing, site-data.js failed to load, ...). This is
//      deliberately a different code than 1: a caller must never treat a
//      non-zero-but-not-1 exit as "passed". If you see exit 2, the schema
//      was NOT checked against the data — treat that as unverified, not green.

"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");
const { spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SCHEMA_PATH = path.join(ROOT, "schema", "property-config.schema.json");
const SITE_DATA_PATH = path.join(ROOT, "site-data.js");
const AJV_CLI_SPEC = "ajv-cli@5.0.0";

function fail(message) {
    console.error(`[validate-config] ${message}`);
    console.error("[validate-config] Schema validation NOT performed — this is not a pass.");
    process.exit(2);
}

// Same technique as loadPropertyConfig() in scripts/sync-seo.js: site-data.js
// assigns to `window.propertyConfig` for the browser, so it's run in a
// throwaway sandbox with a fake `window` rather than turned into a
// CommonJS module.
function loadPropertyConfigFromSiteData() {
    const source = fs.readFileSync(SITE_DATA_PATH, "utf8");
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    vm.runInContext(source, sandbox, { filename: SITE_DATA_PATH });
    if (!sandbox.window.propertyConfig) {
        throw new Error("site-data.js did not set window.propertyConfig");
    }
    return sandbox.window.propertyConfig;
}

function parseArgs(argv) {
    const args = { input: null };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--input") {
            args.input = argv[i + 1];
            i++;
        }
    }
    return args;
}

function main() {
    const args = parseArgs(process.argv.slice(2));

    if (!fs.existsSync(SCHEMA_PATH)) {
        fail(`Schema not found: ${SCHEMA_PATH}`);
    }

    let dataPath;
    let tmpFile = null;
    let sourceLabel;

    if (args.input) {
        dataPath = path.resolve(args.input);
        if (!fs.existsSync(dataPath)) {
            fail(`Input file not found: ${dataPath}`);
        }
        sourceLabel = path.relative(ROOT, dataPath);
    } else {
        let config;
        try {
            config = loadPropertyConfigFromSiteData();
        } catch (error) {
            fail(`Could not load propertyConfig from site-data.js: ${error.message}`);
        }
        tmpFile = path.join(os.tmpdir(), `property-config-${process.pid}-${Date.now()}.json`);
        fs.writeFileSync(tmpFile, JSON.stringify(config, null, 2), "utf8");
        dataPath = tmpFile;
        sourceLabel = "site-data.js (extracted propertyConfig)";
    }

    console.log(`[validate-config] Validating ${sourceLabel} against schema/property-config.schema.json`);
    console.log(`[validate-config] using: npx --yes ${AJV_CLI_SPEC} validate (Draft-07)`);

    const result = spawnSync(
        "npx",
        ["--yes", AJV_CLI_SPEC, "validate", "-s", SCHEMA_PATH, "-d", dataPath],
        { encoding: "utf8", shell: true }
    );

    if (tmpFile) fs.rmSync(tmpFile, { force: true });

    if (result.error) {
        fail(`Failed to run npx (${result.error.message}). Is npm/npx installed and on PATH?`);
    }

    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);

    if (result.status === 0) {
        console.log("[validate-config] VALID — data matches schema/property-config.schema.json.");
        process.exit(0);
    }

    if (result.status === 1) {
        console.error("[validate-config] INVALID — data does not match the schema (see ajv-cli output above).");
        process.exit(1);
    }

    // Anything other than 0 or 1 means ajv-cli itself didn't run to
    // completion (couldn't resolve the npm package, no network, corrupt
    // npx cache, ...) — never treat this as either a pass or a normal
    // schema failure.
    fail(`npx/ajv-cli exited with unexpected status ${JSON.stringify(result.status)} — could not confirm validity (likely no npm registry/network access).`);
}

main();
