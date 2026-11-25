import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import BankAccountDialog from "@/components/admin/payments/BankAccountDialog";
import TransferReviewDialog from "@/components/admin/payments/TransferReviewDialog";
import { DataTable, LoadingBlock, Panel, StatusBadge, adminButton, adminGhostButton } from "@/components/admin/adminUi";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  deleteBankAccount,
  getBankTransferQueue,
  getPaymentProofUrl,
  listBankAccounts,
  saveBankAccount,
  verifyBankTransfer,
} from "@/lib/payment-fns";

export const Route = createFileRoute("/_authed/admin/payments/bank-transfers")({
  component: BankTransfersPage,
});

function BankTransfersPage() {
  const loadAccounts = useServerFn(listBankAccounts);
  const loadQueue = useServerFn(getBankTransferQueue);
  const save = useServerFn(saveBankAccount);
  const remove = useServerFn(deleteBankAccount);
  const decide = useServerFn(verifyBankTransfer);
  const proof = useServerFn(getPaymentProofUrl);

  const [accounts, setAccounts] = useState(null);
  const [queue, setQueue] = useState(null);
  const [editing, setEditing] = useState(undefined);
  const [reviewing, setReviewing] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = () =>
    Promise.all([loadAccounts(), loadQueue()])
      .then(([nextAccounts, nextQueue]) => {
        setAccounts(nextAccounts);
        setQueue(nextQueue);
      })
      .catch((error) => toast.error(error?.message || "Could not load bank transfer data"));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = (queue || []).filter((row) => ["pending", "processing"].includes(row.status));

  const submitAccount = async (values) => {
    setBusy(true);
    try {
      await save({ data: values });
      setEditing(undefined);
      toast.success("Bank account saved");
      await refresh();
    } catch (error) {
      toast.error(error?.message || "Could not save the bank account");
    } finally {
      setBusy(false);
    }
  };

  const decideTransfer = async ({ approve, notes }) => {
    setBusy(true);
    try {
      await decide({ data: { id: reviewing.id, approve, notes } });
      toast.success(approve ? "Transfer verified and receipt issued" : "Submission rejected and donor notified");
      setReviewing(null);
      await refresh();
    } catch (error) {
      toast.error(error?.message || "Could not record the decision");
    } finally {
      setBusy(false);
    }
  };

  if (!accounts || !queue) return <LoadingBlock label="Loading bank transfer settings" />;

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-[15px] font-semibold text-foreground">Bank accounts</h2>
            <p className="text-[11.5px] text-muted-foreground">
              Active accounts appear on the public donation checkout immediately.
            </p>
          </div>
          <button type="button" className={adminButton} onClick={() => setEditing(null)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add bank account
          </button>
        </div>
        <DataTable
          columns={[
            {
              key: "bank_name",
              header: "Bank",
              render: (row) => (
                <div>
                  <p className="font-medium text-foreground">{row.bank_name}</p>
                  <p className="text-[11px] text-muted-foreground">{row.account_title}</p>
                </div>
              ),
            },
            { key: "currency", header: "Currency" },
            {
              key: "account",
              header: "Account / IBAN",
              render: (row) => (
                <span className="text-[11.5px] text-foreground/80">{row.iban || row.account_number || "—"}</span>
              ),
            },
            { key: "swift_code", header: "SWIFT", render: (row) => row.swift_code || "—" },
            {
              key: "is_active",
              header: "Status",
              render: (row) => <StatusBadge status={row.is_active ? "active" : "draft"} />,
            },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <div className="flex justify-end gap-2">
                  <button type="button" className="text-primary" onClick={() => setEditing(row)} aria-label="Edit account">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="text-destructive"
                    aria-label="Delete account"
                    onClick={async () => {
                      try {
                        await remove({ data: { id: row.id } });
                        toast.success("Bank account removed");
                        await refresh();
                      } catch (error) {
                        toast.error(error?.message || "Could not remove the account");
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
          rows={accounts}
          empty="No bank accounts yet. Add one so donors can transfer directly."
        />
      </Panel>

      <Panel>
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-[15px] font-semibold text-foreground">Bank transfer verification queue</h2>
          <p className="text-[11.5px] text-muted-foreground">
            {pending.length} awaiting verification. A transfer is only marked successful once verified here.
          </p>
        </div>
        <DataTable
          columns={[
            {
              key: "donor_name",
              header: "Donor",
              render: (row) => (
                <div>
                  <p className="font-medium text-foreground">{row.donor_name}</p>
                  <p className="text-[11px] text-muted-foreground">{row.donor_email}</p>
                </div>
              ),
            },
            {
              key: "amount",
              header: "Amount",
              render: (row) => formatCurrency(row.amount, row.currency),
            },
            { key: "bank_label", header: "Account" },
            { key: "transfer_reference", header: "Transfer ref", render: (row) => row.transfer_reference || "—" },
            {
              key: "transfer_date",
              header: "Transfer date",
              render: (row) => (row.transfer_date ? formatDate(row.transfer_date) : "—"),
            },
            { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <button
                  type="button"
                  className={adminGhostButton}
                  onClick={() => setReviewing(row)}
                  disabled={!["pending", "processing"].includes(row.status)}
                >
                  Review
                </button>
              ),
            },
          ]}
          rows={queue}
          empty="No bank transfer notices submitted yet."
        />
      </Panel>

      <BankAccountDialog
        account={editing || null}
        open={editing !== undefined}
        busy={busy}
        onClose={() => setEditing(undefined)}
        onSave={submitAccount}
      />

      <TransferReviewDialog
        donation={reviewing}
        open={Boolean(reviewing)}
        busy={busy}
        onClose={() => setReviewing(null)}
        onDecide={decideTransfer}
        onProof={(id) => proof({ data: { id } })}
      />
    </div>
  );
}