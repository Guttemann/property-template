# Decision Log

Record decisions that change the product's long-term direction, architecture,
quality standard or customer-data handling. Keep temporary task choices in
`WORKING.md` instead.

| Date | Decision | Why | Status / evidence |
| --- | --- | --- | --- |
| 2026-08-29 | Use `template/` as the only clean starting point for new property websites. | Prevents accidental transfer of live customer data and history. | Established; `template/README.md` and `AGENTS.md`. |
| 2026-08-29 | Introduce role-based agent operation with durable, working and decision memory. | Lets one product agent shift lenses without losing project context or confusing short-lived notes with verified facts. | Established; `AGENTS.md` and `agent-memory/`. |
