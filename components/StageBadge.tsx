type StageBadgeProps = {
  stage: string;
};

export function StageBadge({ stage }: StageBadgeProps) {
  return (
    <span className="inline-flex items-center whitespace-nowrap rounded-sm border border-border bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
      {stage}
    </span>
  );
}
