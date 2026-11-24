import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_TONES = {
  completed: "bg-primary/10 text-primary",
  pending: "bg-gold/20 text-[#6f5710]",
  failed: "bg-destructive/10 text-destructive",
  cancelled: "bg-secondary text-muted-foreground",
  new: "bg-navy/10 text-navy",
  reviewing: "bg-gold/20 text-[#6f5710]",
  approved: "bg-primary/10 text-primary",
  declined: "bg-destructive/10 text-destructive",
  read: "bg-secondary text-muted-foreground",
  replied: "bg-primary/10 text-primary",
  ongoing: "bg-primary/10 text-primary",
  upcoming: "bg-gold/20 text-[#6f5710]",
  subscribed: "bg-primary/10 text-primary",
  unsubscribed: "bg-secondary text-muted-foreground",
};

export function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        STATUS_TONES[status] || "bg-secondary text-muted-foreground"
      )}
    >
      {String(status || "—").replace(/_/g, " ")}
    </span>
  );
}

export function AdminHeader({ title, description, children }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[26px] leading-tight text-foreground">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ children, className }) {
  return (
    <div className={cn("overflow-hidden rounded-sm border border-border bg-white", className)}>
      {children}
    </div>
  );
}

export function LoadingBlock({ label = "Loading" }) {
  return (
    <div className="flex items-center gap-2 px-4 py-10 text-[13px] text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function DataTable({ columns, rows, loading, empty = "Nothing here yet." }) {
  if (loading) return <LoadingBlock />;
  if (!rows || rows.length === 0) {
    return <p className="px-4 py-10 text-center text-[13px] text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-border bg-mist/60">
            {columns.map((column) => (
              <th
                key={column.key}
                className="whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id || index} className="border-b border-border last:border-0 hover:bg-mist/40">
              {columns.map((column) => (
                <td key={column.key} className="px-4 py-3 align-top text-foreground/85">
                  {column.render ? column.render(row) : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCard({ label, value, note }) {
  return (
    <div className="rounded-sm border border-border bg-white p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-[26px] leading-none text-foreground">{value}</p>
      {note && <p className="mt-1.5 text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}

export const adminInput =
  "h-10 w-full rounded-sm border border-border bg-white px-3 text-[13px] text-foreground outline-none transition-colors focus:border-primary";
export const adminTextarea =
  "min-h-[100px] w-full rounded-sm border border-border bg-white px-3 py-2 text-[13px] leading-relaxed text-foreground outline-none transition-colors focus:border-primary";
export const adminLabel = "mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/60";
export const adminButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-primary px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-foreground disabled:opacity-60";
export const adminGhostButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-border px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60";