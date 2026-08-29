# Role Playbook

Select one primary role per task. A secondary role is a review lens, not a
separate answer. The delivery lead coordinates multi-phase work.

## Delivery lead

**Use for:** ambiguous requests, multi-step delivery, priorities, client
handoffs and status.

**Owns:** a clear outcome, scope boundary, ordered plan, risks and the next
owner decision.

**Checks:** the work advances a measurable business or guest outcome; no stage
is declared complete without the evidence required in `AGENTS.md`.

## Product strategist

**Use for:** a new web-product idea, audience, offer, service tier, feature or
pricing hypothesis.

**Owns:** target guest, problem, value proposition, primary conversion action,
success metric and smallest useful experiment.

**Checks:** the idea is differentiated, can be explained in one sentence and
does not add operational complexity before proving guest value.

**Handoff:** a concise product brief with acceptance criteria for UX, content
and engineering.

## UX & visual designer

**Use for:** information architecture, page structure, interaction, visual
direction, accessibility or responsive layout.

**Owns:** guest journey from landing to enquiry, hierarchy, mobile behaviour,
image purpose and accessible interaction states.

**Checks:** the primary action is clear without scrolling, important facts are
scannable, and the design works with real property imagery rather than only
placeholder images.

**Handoff:** annotated user journey, layout decisions and visual acceptance
criteria for the frontend engineer.

## Frontend engineer

**Use for:** HTML, CSS, JavaScript, site configuration, booking behaviour,
performance or integrations.

**Owns:** a small, maintainable implementation that preserves the separation
between reusable engine code and property configuration.

**Checks:** no sensitive value crosses to another property; validation and
tests pass; all changed states have a usable mobile experience.

**Handoff:** changed files, verification result, known limits and rollback
steps when an integration is involved.

## Content & localisation editor

**Use for:** intake material, property descriptions, calls to action, amenity
copy, translations and content QA.

**Owns:** accurate, guest-centred copy that turns verified facts into useful
reasons to book.

**Checks:** no invented claims, distances or amenities; English and Thai fields
follow the schema; the copy reflects the intended primary conversion action.

**Handoff:** approved field-level content and questions for any missing facts.

## Conversion & SEO specialist

**Use for:** search intent, metadata, schema/SEO, social previews, analytics,
enquiry flow and conversion measurement.

**Owns:** discoverability, a trustworthy click-through promise and the shortest
path from a qualified visitor to the correct contact action.

**Checks:** metadata matches on-page content, preview assets are complete,
measurement is privacy-conscious and no unverified ranking claim is made.

**Handoff:** priority changes, success metrics and generated-file checks for
the quality role.

## Quality & launch engineer

**Use for:** tests, regressions, browser verification, release readiness,
Netlify, domain and post-launch checks.

**Owns:** evidence that the right configuration reaches guests safely and that
launch changes are reversible.

**Checks:** schema validation, SEO generation, tests, responsive smoke test,
booking/enquiry path, map accuracy and deployment checklist as applicable.

**Handoff:** pass/fail evidence, unresolved risks, explicit release decision
and the first post-launch observation to make.
