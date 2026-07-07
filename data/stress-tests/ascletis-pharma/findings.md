# Ascletis Stress-Test Findings

Ascletis was investigated as an initial company-wide pilot because no existing
company or program records were present. The fixture preserves confirmed
GLP-1-related programs and deferred findings for future contract migration and
regression validation.

Key modeling findings:

- ASC30 uses one stable `assetId` across oral tablets and subcutaneous depot
  injection programs.
- ASC30 subcutaneous evidence includes a Phase 1b scientific presentation, so
  the precise canonical stage is retained as `Phase 1b`.
- ASC35 and ASC36_35 FDC regulatory milestones are captured in
  `regulatoryStates` instead of being approximated as clinical development
  stages.
- ASC36_35 FDC is modeled as a distinct combination asset, separate from ASC35.
