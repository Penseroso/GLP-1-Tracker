# Agent Entry Instructions

This file routes natural-language requests to the correct workflow. It is a
router only — it does not restate the research protocol.

## Company research router

Any natural-language request whose intent is to **research, investigate,
review, refresh, or update** a named company must execute the complete
workflow in [`prompts/research-company.md`](prompts/research-company.md).

This applies to variations such as:

- `Research Zealand Pharma.`
- `Investigate Zealand Pharma.`
- `Update Zealand Pharma.`
- equivalent natural-language requests in other languages.

When such a request is received:

- The company name is the only required input. Do not ask for or expect any
  other parameter.
- The agent decides automatically whether to perform an initial investigation
  or a refresh, based on the existing data — not on the request wording.
- Executing the workflow includes external research, operating-record creation
  or update, aggregate regeneration, the required validation, and final
  reporting.
- The detailed rules remain authoritative in
  [`prompts/research-company.md`](prompts/research-company.md) and its
  referenced documents ([`docs/data-protocol/README.md`](docs/data-protocol/README.md)
  and [`docs/research-workflow.md`](docs/research-workflow.md)). Follow those; do
  not reimplement the workflow from this router.
