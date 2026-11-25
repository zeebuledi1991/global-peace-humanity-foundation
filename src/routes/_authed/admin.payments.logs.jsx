import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { DataTable, LoadingBlock, Panel, StatusBadge, adminInput, adminLabel } from "@/components/admin/adminUi";
import { formatDateTime } from "@/lib/format";
import { getPaymentEvents } from "@/lib/payment-fns";

export const Route = createFileRoute("/_authed/admin/payments/logs")({
  component: PaymentLogsPage,
});

const TYPES = [
  "",
  "config_updated",
  "gateway_activated",
  "gateway_deactivated",
  "connection_tested",
  "checkout_initiated",
  "webhook_received",
  "webhook_rejected",
  "payment_settled",
  "payment_failed",
  "bank_transfer_verified",
  "bank_transfer_rejected",
];

function PaymentLogsPage() {
  const load = useServerFn(getPaymentEvents);
  const [events, setEvents] = useState(null);
  const [filters, setFilters] = useState({ search: "", type: "" });

  useEffect(() => {
    let alive = true;
    load({ data: filters })
      .then((result) => alive && setEvents(result))
      .catch((error) => toast.error(error?.message || "Could not load payment logs"));
    return () => {
      alive = false;
    };
  }, [load, filters]);

  return (
    <div className="space-y-5">
      <Panel className="grid gap-3 p-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label className={adminLabel} htmlFor="log-search">
            Search
          </label>
          <input
            id="log-search"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Provider, administrator, donation, provider event id"
            className={adminInput}
          />
        </div>
        <div>
          <label className={adminLabel} htmlFor="log-type">
            Event type
          </label>
          <select
            id="log-type"
            value={filters.type}
            onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
            className={adminInput}
          >
            {TYPES.map((type) => (
              <option key={type || "all"} value={type}>
                {type ? type.replace(/_/g, " ") : "All events"}
              </option>
            ))}
          </select>
        </div>
      </Panel>

      <Panel>
        {!events ? (
          <LoadingBlock label="Loading payment logs" />
        ) : (
          <DataTable
            columns={[
              { key: "type", header: "Event", render: (row) => <StatusBadge status={row.type} /> },
              { key: "provider", header: "Provider", render: (row) => row.provider || "—" },
              {
                key: "message",
                header: "Detail",
                render: (row) => <span className="text-[12px] text-foreground/85">{row.message}</span>,
              },
              { key: "actor_email", header: "Administrator", render: (row) => row.actor_email || "System" },
              {
                key: "created_date",
                header: "Timestamp",
                render: (row) => <span className="whitespace-nowrap text-[11.5px]">{formatDateTime(row.created_date)}</span>,
              },
            ]}
            rows={events}
            empty="No payment events recorded yet."
          />
        )}
      </Panel>
    </div>
  );
}