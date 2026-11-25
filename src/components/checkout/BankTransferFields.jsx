import { useState } from "react";
import { Loader2, Paperclip } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { inputClass, labelClass, selectClass } from "@/components/site/formStyles";

export default function BankTransferFields({ banks, value, onChange, error }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const account = banks.find((bank) => bank.id === value.bank_account_id) || banks[0];

  const update = (field) => (event) => onChange({ [field]: event.target.value });

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError("");
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("Please upload a screenshot or PDF under 8 MB.");
      return;
    }
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      onChange({ proof_file_uri: file_uri, proof_name: file.name });
    } catch {
      setUploadError("The proof could not be uploaded. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4 space-y-4 rounded-sm border border-border bg-mist p-4">
      <div>
        <label className={labelClass} htmlFor="bank-account">
          Transfer to
        </label>
        <select
          id="bank-account"
          value={account?.id || ""}
          onChange={update("bank_account_id")}
          className={selectClass}
        >
          {banks.map((bank) => (
            <option key={bank.id} value={bank.id}>
              {bank.bank_name} · {bank.account_title} · {bank.currency}
            </option>
          ))}
        </select>
      </div>

      {account && (
        <dl className="grid gap-1.5 rounded-sm border border-border bg-white p-4 text-[12.5px]">
          {[
            ["Account title", account.account_title],
            ["Account number", account.account_number],
            ["IBAN", account.iban],
            ["SWIFT / BIC", account.swift_code],
            ["Branch", account.branch_name],
            ["Currency", account.currency],
          ]
            .filter(([, fieldValue]) => fieldValue)
            .map(([label, fieldValue]) => (
              <div key={label} className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium text-foreground">{fieldValue}</dd>
              </div>
            ))}
        </dl>
      )}

      {account?.instructions && (
        <p className="text-[12px] leading-relaxed text-muted-foreground">{account.instructions}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="transfer-reference">
            Your transfer reference *
          </label>
          <input
            id="transfer-reference"
            value={value.transfer_reference || ""}
            onChange={update("transfer_reference")}
            placeholder="Bank transaction / TT number"
            className={inputClass}
          />
          {error?.transfer_reference && (
            <p className="mt-1 text-[12px] text-destructive">{error.transfer_reference}</p>
          )}
        </div>
        <div>
          <label className={labelClass} htmlFor="transfer-date">
            Transfer date
          </label>
          <input
            id="transfer-date"
            type="date"
            value={value.transfer_date || ""}
            onChange={update("transfer_date")}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <span className={labelClass}>Payment proof (optional)</span>
        <label className="flex cursor-pointer items-center gap-2 rounded-sm border border-dashed border-border bg-white px-4 py-3 text-[12.5px] text-muted-foreground hover:border-primary">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
          ) : (
            <Paperclip className="h-4 w-4 text-primary" aria-hidden="true" />
          )}
          <span>{value.proof_name || "Attach a receipt or screenshot (PDF, JPG, PNG)"}</span>
          <input type="file" accept="image/*,.pdf" onChange={upload} className="hidden" disabled={uploading} />
        </label>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          Uploaded securely and stored privately — only our finance team can open it.
        </p>
        {uploadError && <p className="mt-1 text-[12px] text-destructive">{uploadError}</p>}
      </div>
    </div>
  );
}