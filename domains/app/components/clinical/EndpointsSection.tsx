"use client";

import { useMemo, useState } from "react";
import { SourceList } from "@/domains/app/components/SourceList";
import { Badge, OutcomeResult } from "@/domains/app/components/clinical/OutcomeResult";
import type { EndpointGroupView } from "@/domains/app/lib/clinical-evidence/selectors";
import type { ClinicalEndpointRole } from "@/domains/clinical-evidence/lib/types";
import type { SourceReference } from "@/domains/company-pipeline/lib/types";

type RoleFilter = "All" | "Primary" | "Secondary" | "Safety";

const ROLE_FILTERS: RoleFilter[] = ["All", "Primary", "Secondary", "Safety"];

/**
 * Display filter over an endpoint's own recorded role — membership only, never
 * a regrouping of endpoints or outcomes. Roles outside these buckets
 * (`exploratory`, `other`) surface only under "All"; nothing is reordered.
 */
const roleFilterMembership: Record<
  Exclude<RoleFilter, "All">,
  ReadonlySet<ClinicalEndpointRole>
> = {
  Primary: new Set<ClinicalEndpointRole>(["primary", "co-primary"]),
  Secondary: new Set<ClinicalEndpointRole>(["key-secondary", "secondary"]),
  Safety: new Set<ClinicalEndpointRole>(["safety"]),
};

function matchesRoleFilter(role: ClinicalEndpointRole, filter: RoleFilter) {
  return filter === "All" || roleFilterMembership[filter].has(role);
}

/** Endpoints expanded on first render: primary and co-primary only. */
function isDefaultExpanded(role: ClinicalEndpointRole) {
  return role === "primary" || role === "co-primary";
}

/** Order-independent identity of a source set, used only to detect duplication. */
function sourceSetKey(sources: SourceReference[]): string {
  return sources
    .map((source) => source.url)
    .slice()
    .sort()
    .join("|");
}

/** The single value shared by every outcome, or undefined when any differ. */
function commonValue<T>(
  outcomes: EndpointGroupView["outcomes"],
  select: (outcome: EndpointGroupView["outcomes"][number]) => T,
): T | undefined {
  if (outcomes.length === 0) return undefined;
  const first = select(outcomes[0]);
  return outcomes.every((outcome) => select(outcome) === first)
    ? first
    : undefined;
}

function EndpointCard({
  group,
  expanded,
  onToggle,
}: {
  group: EndpointGroupView;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { endpoint, outcomes } = group;

  // Hoist maturity/source to the endpoint header only when every outcome in
  // this endpoint shares the exact same value — genuine differences between
  // outcomes must stay visible on their own row, never be hidden.
  const commonMaturity = commonValue(outcomes, (o) => o.outcome.maturity);
  const commonSourceKey = commonValue(outcomes, (o) =>
    sourceSetKey(o.outcome.metadata.sources),
  );
  const commonSources =
    commonSourceKey && commonSourceKey.length > 0
      ? outcomes[0].outcome.metadata.sources
      : undefined;

  const bodyId = `endpoint-body-${endpoint.id}`;

  return (
    <div className="rounded-md border border-border bg-card shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b border-border/70 bg-muted/30 px-4 py-3.5">
        {/* Accordion pattern: heading wraps the disclosure button. Source links
            stay outside the button so interactive content is never nested. */}
        <h3 className="m-0 min-w-0 flex-1">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={bodyId}
            className="flex w-full items-start gap-2 rounded-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span
              aria-hidden="true"
              className="mt-1 shrink-0 text-xs text-muted-foreground"
            >
              {expanded ? "▾" : "▸"}
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold text-card-foreground">
                  {endpoint.name}
                </span>
                <Badge tone="accent">{endpoint.role}</Badge>
                {commonMaturity ? <Badge>{commonMaturity}</Badge> : null}
              </span>
              <span className="mt-1 block text-sm font-medium text-muted-foreground">
                {[endpoint.domain, endpoint.assessmentTimepoint]
                  .filter(Boolean)
                  .join(" · ") || "N/A"}
              </span>
            </span>
          </button>
        </h3>
        {commonSources && commonSources.length > 0 ? (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Source</span>
            <SourceList sources={commonSources} variant="inline" />
          </p>
        ) : null}
      </div>
      {expanded ? (
        <div id={bodyId} className="px-4 py-1">
          {outcomes.length > 0 ? (
            <ul className="divide-y divide-border">
              {outcomes.map((outcome) => (
                <OutcomeResult
                  key={outcome.outcome.id}
                  outcome={outcome}
                  hideMaturity={Boolean(commonMaturity)}
                  hideSource={Boolean(commonSources)}
                />
              ))}
            </ul>
          ) : (
            <p className="py-3 text-sm text-muted-foreground">
              No recorded outcomes.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Interactive Endpoints & outcomes section: role filter (All / Primary /
 * Secondary / Safety) plus per-endpoint disclosure. This is the only client
 * boundary on the study page; the surrounding StudyDetail stays a server
 * component. Filtering hides non-matching endpoints and never reorders them —
 * the read-model order of `endpointGroups` and of each card's outcomes is
 * preserved exactly.
 */
export function EndpointsSection({
  endpointGroups,
}: {
  endpointGroups: EndpointGroupView[];
}) {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () =>
      new Set(
        endpointGroups
          .filter((group) => isDefaultExpanded(group.endpoint.role))
          .map((group) => group.endpoint.id),
      ),
  );

  const visibleGroups = useMemo(
    () =>
      endpointGroups.filter((group) =>
        matchesRoleFilter(group.endpoint.role, roleFilter),
      ),
    [endpointGroups, roleFilter],
  );

  const toggle = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const expandAllVisible = () =>
    setExpandedIds(
      (prev) =>
        new Set([...prev, ...visibleGroups.map((group) => group.endpoint.id)]),
    );

  const collapseAllVisible = () =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const group of visibleGroups) {
        next.delete(group.endpoint.id);
      }
      return next;
    });

  if (endpointGroups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No recorded outcomes.</p>
    );
  }

  const filterButtonClass = (active: boolean) =>
    `rounded-sm px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  const bulkButtonClass =
    "rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filter endpoints by role"
          className="flex flex-wrap gap-1 rounded-md border border-border bg-card p-1"
        >
          {ROLE_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={roleFilter === filter}
              onClick={() => setRoleFilter(filter)}
              className={filterButtonClass(roleFilter === filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={expandAllVisible}
            className={bulkButtonClass}
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAllVisible}
            className={bulkButtonClass}
          >
            Collapse all
          </button>
        </div>
      </div>

      {visibleGroups.length > 0 ? (
        <div className="space-y-4">
          {visibleGroups.map((group) => (
            <EndpointCard
              key={group.endpoint.id}
              group={group}
              expanded={expandedIds.has(group.endpoint.id)}
              onToggle={() => toggle(group.endpoint.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No {roleFilter.toLowerCase()} endpoints recorded.
        </p>
      )}
    </div>
  );
}
