"use client";

import { useEffect, useId, useRef, useState } from "react";

type EfficacySelectionDetailsProps = {
  unitName: string;
  rationale: string[];
  facts: { label: string; value: string }[];
};

/**
 * Auxiliary disclosure for one comparison row.
 *
 * Deliberately **not** the only path to anything it shows: the row already renders
 * every fact needed to read its numbers, and links to the Study. This adds the
 * selection rationale and repeats the analysis detail in one place. If it fails to
 * open — no JavaScript, an unsupported browser — the page stays fully usable.
 *
 * Opens on hover **and** on focus, and toggles on click/Enter/Space, so pointer,
 * keyboard, and touch all reach it. The native `title` attribute used elsewhere in
 * this repo would not: it is invisible to keyboard focus and to touch.
 */
export function EfficacySelectionDetails({
  unitName,
  rationale,
  facts,
}: EfficacySelectionDetailsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        onFocus={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <span aria-hidden="true">ⓘ</span>
        Why this study
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={`How the representative result was selected for ${unitName}`}
          className="absolute right-0 z-20 mt-2 w-[min(26rem,calc(100vw-2.5rem))] rounded-md border border-border bg-card p-3 text-left shadow-soft"
        >
          <p className="text-sm font-semibold text-card-foreground">
            Selection rationale
          </p>
          <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
            {rationale.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" className="text-border">
                  •
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
          <dl className="mt-3 space-y-1 border-t border-border pt-2 text-xs">
            {facts.map((fact) => (
              <div key={fact.label} className="flex gap-2">
                <dt className="shrink-0 font-medium text-foreground">
                  {fact.label}
                </dt>
                <dd className="text-muted-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </div>
  );
}
