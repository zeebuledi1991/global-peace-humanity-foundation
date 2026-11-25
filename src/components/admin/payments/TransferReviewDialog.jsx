import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminButton, adminGhostButton, adminLabel, adminTextarea } from "@/components/admin/adminUi";
import { formatCurrency } from "@/lib/format";

export default function TransferReviewDialog({ donation, open, busy, onClose, onDecide, onProof }) {
  const [notes, setNotes] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofError, setProofError] = useState("");

  if (!donation) return null;

  const openProof = async () => {
    setProofError("");
    try {
      const { url } = await onProof(donation.id);
      setProofUrl(url);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setProofError(error?.message || "The payment proof could not be opened");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Verify bank transfer</DialogTitle>
          <DialogDescription>
            {donation.donor_name} · {donation.reference}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-2 rounded-sm border border-border bg-mist p-4 text-[12.5px]">
          {[
            ["Amount", formatCurrency(donation.amount, donation.currency)],
            ["Bank", donation.bank_label],
            ["Transfer reference", donation.transfer_reference || "—"],
            ["Transfer date", donation.transfer_date || "—"],
            ["Project", donation.project_title],
            ["Donor email", donation.donor_email],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        {donation.proof_file_uri ? (
          <div>
            <button type="button" onClick={openProof} className={adminGhostButton}>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              View payment proof
            </button>
            {proofUrl && <p className="mt-2 break-all text-[10px] text-muted-foreground">Secure link valid for 10 minutes.</p>}
            {proofError && <p className="mt-2 text-[11px] text-destructive">{proofError}</p>}
          </div>
        ) : (
          <p className="text-[12px] text-muted-foreground">No proof was uploaded with this transfer notice.</p>
        )}

        <div>
          <label className={adminLabel} htmlFor="review-notes">
            Internal notes
          </label>
          <textarea
            id="review-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className={adminTextarea}
            placeholder="Matched against the bank statement on…"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={adminButton}
            disabled={busy}
            onClick={() => onDecide({ approve: true, notes })}
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            Verify payment
          </button>
          <button
            type="button"
            className={adminGhostButton}
            disabled={busy}
            onClick={() => onDecide({ approve: false, notes })}
          >
            Reject submission
          </button>
          <button type="button" className={adminGhostButton} onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}