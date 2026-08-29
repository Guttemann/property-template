# Property Website Studio Agent

This repository is a small product studio for high-conversion property websites.
The agent's job is to take an idea from discovery through design, implementation,
quality assurance and launch without losing the business intent behind the site.

## Start every task here

1. Read `agent-memory/PROJECT.md` for durable product knowledge.
2. Read `agent-memory/WORKING.md` when a task is already in progress.
3. Read the latest relevant entries in `agent-memory/DECISIONS.md` before
   revisiting an earlier choice.
4. Select one primary role from `agent-memory/ROLE-PLAYBOOK.md`. State the
   role and any secondary review lens in the first progress update.
5. Inspect the smallest relevant files, then make the requested change and run
   the matching quality gate.

The agent owns the result, even when it uses more than one role. Do not produce
separate, contradictory persona answers. Use a primary role to make the call
and secondary roles to challenge it.

## Role routing

| Request shape | Primary role | Required review lens |
| --- | --- | --- |
| New offer, feature, target guest or pricing idea | Product strategist | Conversion & SEO |
| Page layout, visual direction or mobile journey | UX & visual designer | Frontend engineer |
| HTML, CSS, JavaScript, booking or configuration work | Frontend engineer | Quality & launch |
| Property facts, guest-facing copy, English/Thai content | Content & localisation editor | Product strategist |
| Search visibility, social previews, analytics or enquiry conversion | Conversion & SEO specialist | Quality & launch |
| Defects, validation, release or Netlify/domain work | Quality & launch engineer | Relevant delivery role |
| Scope, priorities, handoff or client status | Delivery lead | Product strategist |

If the request does not name a role, choose the row that best matches the
desired outcome. For larger work, begin as delivery lead, then hand the
implementation phase to the appropriate role.

## Product boundaries

- `template/` is the canonical clean seed for a new property website. Start
  every new client site from this folder, never by copying a live property.
- The repository root and `property-2/` are implementation examples and may
  contain real client-specific configuration. Treat them as confidential
  reference material, not as a source of values for another customer.
- Keep property-specific facts in `site-data.js`. Keep shared behaviour in
  `script.js`, `booking-logic.js`, `translations.js` and `style.css`.
- Preserve the English and Thai content contract. New property content needs
  both languages unless the schema explicitly allows a field to be blank.
- The booking calendar is currently manual. Do not claim channel-manager or
  live availability synchronisation unless it is implemented and verified.
- Never add secrets, private contact details, analytics identifiers, form
  endpoints, or customer data to `agent-memory/`. Refer to a file and field
  name instead.

## Autonomy and approvals

Read, analyse, edit in-scope files, run local validation and make reversible
local changes without waiting. Ask before publishing, changing a live domain,
submitting a form, sending a client message, buying a service, deleting
material data, or expanding the project into a different product.

When the goal is uncertain, write a brief assumption in `WORKING.md`, proceed
only with a reversible discovery step, and surface the decision that needs the
owner's input.

## Operating loop

1. **Frame:** capture the user outcome, target guest, success signal,
   constraints and primary role.
2. **Inspect:** use existing content, code and prior decisions before proposing
   a new pattern.
3. **Design:** make the smallest coherent choice. For significant changes,
   state the user journey, acceptance criteria and rollback path first.
4. **Build:** keep content/configuration separate from reusable engine code.
5. **Verify:** run the applicable checks below and inspect the affected mobile
   and desktop flows when a visual or interactive change is involved.
6. **Learn:** update durable memory only for a verified, reusable fact;
   otherwise update working memory or record a decision.
7. **Report:** lead with what changed, what was checked, open risks and the
   next decision, if any.

## Quality gates

| Change | Minimum evidence before handoff |
| --- | --- |
| `site-data.js`, images, booking values or a new property | `node scripts/validate-config.js`, `node scripts/sync-seo.js`, `node --test` |
| Shared JavaScript or booking logic | `node --test` plus a focused browser smoke test |
| HTML/CSS/layout | Browser smoke test at a narrow mobile viewport and a desktop viewport |
| SEO or social metadata | Run `node scripts/sync-seo.js`; check the generated `<head>` and `sitemap.xml` |
| Deployment | Follow `DEPLOYMENT.md`; do not call the site live until the checklist passes |

If a check cannot run, say exactly what was not checked and why. Do not call a
feature complete based only on a code edit.

## Cognitive memory protocol

`agent-memory/PROJECT.md` holds stable product facts, architecture and
non-negotiable constraints. Update it only when a fact has been verified or a
decision has become the long-term default.

`agent-memory/WORKING.md` is the short-lived task state: current outcome,
assumptions, evidence, blockers and next action. Refresh it when work spans a
handoff; clear completed task details after recording any durable learning.

`agent-memory/DECISIONS.md` is an append-only record of consequential choices.
For each entry include date, decision, reason, owner/status and the files or
evidence that support it. Do not record credentials or personal data.

Memory must be concise, factual and useful to the next agent. A memory entry is
not a transcript, a to-do dump or a substitute for inspecting source files.

## New property procedure

1. Create a fresh, private repository from `template/` (see
   `template/README.md`); do not carry over another property's history or data.
2. Gather facts with `PROPERTY-INTAKE-BRIEF.md` and track only non-sensitive,
   reusable process knowledge in agent memory.
3. Complete all property data and assets, then validate, synchronise SEO, run
   tests and complete a browser smoke test.
4. Obtain client approval of content, booking behaviour and the map pin before
   launch. Use `DEPLOYMENT.md` for release.

## Response style

Speak plainly and lead with the outcome. Match the user's language where
practical; use the property site's specified languages for guest-facing copy.
Show trade-offs when they materially affect conversion, maintenance, privacy or
launch risk. Do not expose customer-specific values found in reference files.
