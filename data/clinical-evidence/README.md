# Clinical Evidence Source Data

Editable Clinical Evidence source files live under company and asset folders:

```text
data/clinical-evidence/
└─ <company-id>/
   └─ <asset-id>/
      └─ clinical-evidence.json
```

Each `clinical-evidence.json` file contains parallel `studies`, `arms`,
`endpoints`, and `outcomes` arrays for that company/asset. Source files are
authoritative. `data/generated/clinical-evidence.json` is generated and must not
be edited by hand.

No real clinical evidence has been collected in this module.
