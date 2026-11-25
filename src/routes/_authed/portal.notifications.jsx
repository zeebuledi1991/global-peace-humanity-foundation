import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Bell, Check, Loader2 } from "lucide-react";
import {
  getPortalNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/portal-fns";
import { formatDateTime } from "@/lib/format";
import { adminButton, adminGhostButton } from "@/components/admin/adminUi";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/portal/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = () => getPortalNotifications().then(setRows);

  useEffect(() => {
    load();
  }, []);

  const readOne = async (id) => {
    await markNotificationRead({ data: { id } });
    await load();
  };

  const readAll = async () => {
    setBusy(true);
    try {
      await markAllNotificationsRead();
      toast.success("All notifications marked as read.");
      await load();
    } finally {
      setBusy(false);
    }
  };

  const unread = (rows || []).filter((row) => !row.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[26px] leading-tight text-foreground">Notifications</h1>
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            Donation confirmations, project updates and account activity.
          </p>
        </div>
        <button type="button" onClick={readAll} disabled={busy || !unread} className={adminGhostButton}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Check className="h-3.5 w-3.5" aria-hidden="true" />}
          Mark all as read
        </button>
      </div>

      {!rows ? (
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading notifications
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-sm border border-border bg-white px-6 py-14 text-center">
          <Bell className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            You have no notifications yet. We will let you know as soon as a donation is confirmed or a project you
            support has news.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-border bg-white">
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li
                key={row.id}
                className={cn("flex items-start gap-3 px-4 py-4", !row.is_read && "bg-primary/[0.04]")}
              >
                <span
                  className={cn(
                    "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                    row.is_read ? "bg-border" : "bg-primary"
                  )}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold text-foreground">{row.title}</p>
                    <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {row.type}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{row.message}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{formatDateTime(row.created_date)}</p>
                  {row.link && (
                    <Link
                      to={row.link}
                      className="mt-2 inline-flex text-[11px] font-semibold uppercase tracking-[0.12em] text-primary hover:text-foreground"
                    >
                      Open
                    </Link>
                  )}
                </div>
                {!row.is_read && (
                  <button
                    type="button"
                    onClick={() => readOne(row.id)}
                    className="shrink-0 rounded-sm border border-border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}