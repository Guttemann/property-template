---
name: property-quality-release
description: Verify property-site changes and assess release readiness. Use for validation, regressions, browser smoke tests, Netlify or domain work, and launch decisions.
---

# Property Quality and Release

Use this skill to gather release evidence and make a clear pass, fail, or owner-decision assessment. It does not replace the delivery specialist that fixes a defect.

## Inspect before verification

- Start with the relevant `AGENTS.md` quality gate, then read `DEPLOYMENT.md` and the matching checklist section.
- Inspect the changed files and the guest journey they affect. Use `scripts/`, `schema/`, and `tests/` as the source for local validation behaviour.
- Run tests from the actual property directory being assessed. This repository's root discovers the nested `property-2/tests/` suite, so its aggregate test count is not an isolated property result.

## Assess evidence

- Separate configuration validation, generated SEO output, automated tests, and browser smoke evidence; a passing command does not replace an untested guest flow.
- Treat a validation tool's inability to run as unverified, not passed. Confirm the manual calendar/enquiry path only where booking is enabled.
- Keep deployment, domain changes, form submissions, and other external actions within the permissions in `AGENTS.md`.

## Handoff

Report pass/fail evidence, open risks, and the next owner decision. Route the repair to `property-content-configuration`, `property-frontend`, or `property-seo-conversion` instead of broadening this skill into an implementation playbook.
