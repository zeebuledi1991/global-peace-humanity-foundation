import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, Search } from "lucide-react";
import {
  AdminHeader,
  DataTable,
  LoadingBlock,
  Panel,
  StatusBadge,
  adminGhostButton,
  adminInput,
} from "@/components/admin/adminUi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAdminDonors, getDonorDetail } from "@/lib/admin-fns";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/admin/donors")({
  component: AdminDonorsPage,
});

const TYPES = [
  { value: "", label: "All donors" },
  { value: "registered", label: "Registered users" },
  { value: "guest", label: "Guest donors" },
];

const totalLabel = (totals) => {
  const entries = Object.entries(totals || {});
  return entries.length ? entries.map(([currency, total]) => formatCurrency(total, currency)).join(" · ") : "—";
};

function AdminDonorsPage() {
  const [rows, setRows] = useState(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    getAdminDonors({ data: { search, type } }).then((result) => {
      if (!cancelled) setRows(result);
    });
    return () => {
      cancelled = true;
    };
  }, [search, type]);

  const openDetail = async (row) => {
    setDetail({ donor: row, donations: [], projects: [] });
    setDetailLoading(true);
    try {
      const result = await getDonorDetail({ data: { email: row.email } });
      setDetail({ donor: row, ...result });
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      key: "donor",
      header: "Donor",
      render: (row) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-[11px] text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <span
          className={cn(
            "inline-flex whitespace-nowrap rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]",
            row.type === "registered" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
          )}
        >
          {row.type === "registered" ? "Registered user" : "Guest donor"}
        </span>
      ),
    },
    { key: "country", header: "Country", render: (row) => <span className="text-[12px] text-muted-foreground">{row.country || "—"}</span> },
    { key: "phone", header: "Phone", render: (row) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{row.phone || "—"}</span> },
    {
      key: "count",
      header: "Donations",
      render: (row) => (
        <span className="text-[12px] text-foreground">
          {row.count}
          <span className="text-muted-foreground"> · {row.verified_count} verified</span>
        </span>
      ),
    },
    {
      key: "total",
      header: "Total donated",
      render: (row) => <span className="whitespace-nowrap text-[12px] font-semibold text-foreground">{totalLabel(row.totals)}</span>,
    },
    {
      key: "last",
      header: "Last donation",
      render: (row) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{formatDate(row.last_donation) || "—"}</span>,
    },
    {
      key: "status",
      header: "Account",
      render: (row) => <StatusBadge status={row.account_status || (row.type === "registered" ? "active" : "draft")} />,
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <button
          type="button"
          onClick={() => openDetail(row)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          aria-label={`View ${row.name}`}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Donors"
        description="Registered accounts and guest donors in one directory. Guest donations are linked to an account only after the donor verifies that email address."
      >
        <button
          type="button"
          onClick={() =>
            downloadCsv(
              "gphf-donors.csv",
              rows || [],
              [
                { header: "Name", value: (row) => row.name },
                { header: "Email", value: (row) => row.email },
                { header: "Type", value: (row) => row.type },
                { header: "Country", value: (row) => row.country },
                { header: "Phone", value: (row) => row.phone },
                { header: "Donations", value: (row) => row.count },
                { header: "Verified donations", value: (row) => row.verified_count },
                { header: "Totals", value: (row) => totalLabel(row.totals) },
                { header: "Last donation", value: (row) => row.last_donation },
              ]
            )
          }
          className={adminGhostButton}
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export CSV
        </button>
      </AdminHeader>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, country"
            className={`${adminInput} pl-9`}
            aria-label="Search donors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setType(option.value)}
              className={cn(
                "rounded-sm border px-3.5 py-2 text-[11.5px] font-medium transition-colors",
                type === option.value
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground/70 hover:border-primary hover:text-primary"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <Panel>
        {!rows ? <LoadingBlock label="Loading donors" /> : <DataTable columns={columns} rows={rows} empty="No donors match this search." />}
      </Panel>

      <Dialog open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-[22px] font-normal">{detail?.donor.name}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="mt-2 space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-sm border border-border p-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Type</p>
                  <p className="mt-1 text-[13px] font-medium text-foreground">
                    {detail.donor.type === "registered" ? "Registered user" : "Guest donor"}
                  </p>
                </div>
                <div className="rounded-sm border border-border p-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Total donated</p>
                  <p className="mt-1 text-[13px] font-medium text-foreground">{totalLabel(detail.donor.totals)}</p>
                </div>
                <div className="rounded-sm border border-border p-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Projects supported</p>
                  <p className="mt-1 text-[13px] font-medium text-foreground">{detail.donor.projects || 0}</p>
                </div>
              </div>

              <div>
                <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground">Donation history</h3>
                {detailLoading ? (
                  <LoadingBlock label="Loading history" />
                ) : detail.donations.length === 0 ? (
                  <p className="mt-2 text-[12px] text-muted-foreground">No donations recorded for this donor yet.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-border border border-border">
                    {detail.donations.map((donation) => (
                      <li key={donation.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] text-foreground">{donation.project_title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {donation.reference} · {formatDate(donation.created_date)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="whitespace-nowrap text-[12.5px] font-semibold text-foreground">
                            {formatCurrency(donation.amount, donation.currency)}
                          </span>
                          <StatusBadge status={donation.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {detail.projects.length > 0 && (
                <div>
                  <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-foreground">Supported projects</h3>
                  <ul className="mt-2 space-y-1.5">
                    {detail.projects.map((project) => (
                      <li key={project.id} className="flex items-center justify-between gap-3 text-[12.5px]">
                        <span className="text-foreground">{project.title}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(project.amount, project.currency)} · {project.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}