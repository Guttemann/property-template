---
name: property-web-development
description: Route property-website work to the right project context, role, and specialist workflow. Use for ambiguous, multi-part, or general property website tasks.
---

# Property Web Development

Use this as the orchestration layer for property-website work. It coordinates context and specialist skills; `AGENTS.md` remains the source of truth for project rules, roles, approvals, and quality gates.

## Route the task

1. Follow the task-start context in `AGENTS.md`. Read only the relevant project memory and prior decisions before revisiting a choice.
2. Select the primary role and required review lens using `AGENTS.md`.
3. Choose one primary delivery path:
   - Property facts, images, guest-facing copy, or `site-data.js` content → `property-content-configuration`.
   - HTML, CSS, JavaScript, accessibility, responsive behaviour, or booking behaviour → `property-frontend`.
   - Search visibility, social previews, analytics, or enquiry conversion → `property-seo-conversion`.
   - Validation, regression investigation, deployment, domain, or release readiness → `property-quality-release`.
4. For a new product idea or a request spanning several paths, frame the outcome and scope first. Use the relevant specialist only for the implementation phase that follows.

## Keep the layers separate

- Treat `AGENTS.md` as policy, `agent-memory/` as project state and decisions, and specialist skills as narrow workflow guidance.
- Do not duplicate those documents, invent a new approval process, or load every specialist skill for ordinary work.
- Inspect the smallest relevant implementation and documentation surface for the selected path, then use the quality gate specified by `AGENTS.md`.
