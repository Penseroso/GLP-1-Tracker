# Clinical Evidence Source Data

Human-edited Clinical Evidence v3 source files live at:

```text
domains/clinical-evidence/data/clinical-evidence/<company-id>/<asset-id>/clinical-evidence.json
```

Each file declares `clinicalEvidenceSchemaVersion: "3.0"` and contains
`studies`, `arms`, `analysisGroups`, `endpoints`, and `outcomes` arrays. An
inventory Study may have no recorded Outcome.

Source files are authoritative. Generated aggregates and the reciprocal
asset-study projection under `data/generated/` must not be edited by hand.
Use the [Clinical Evidence contract](../../docs/README.md) for
semantics and the [research workflow](../../docs/workflow.md)
for execution.
