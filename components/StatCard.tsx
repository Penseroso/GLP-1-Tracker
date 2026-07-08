type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <article className="rounded-md border border-border bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-card-foreground">
        {value}
      </p>
      {helper ? <p className="mt-2 text-sm text-muted-foreground">{helper}</p> : null}
    </article>
  );
}
