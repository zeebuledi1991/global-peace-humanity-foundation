import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminButton, adminGhostButton, adminInput, adminLabel, adminTextarea } from "@/components/admin/adminUi";

const EMPTY = {
  bank_name: "",
  account_title: "",
  account_number: "",
  iban: "",
  swift_code: "",
  branch_name: "",
  branch_code: "",
  bank_address: "",
  currency: "PKR",
  instructions: "",
  is_active: true,
  display_order: 0,
};

export default function BankAccountDialog({ account, open, busy, onClose, onSave }) {
  const [values, setValues] = useState(EMPTY);

  useEffect(() => {
    if (!open) return;
    setValues(account ? { ...EMPTY, ...account } : EMPTY);
  }, [open, account]);

  const update = (field) => (event) =>
    setValues((prev) => ({
      ...prev,
      [field]: field === "is_active" ? event.target.checked : event.target.value,
    }));

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{account ? "Edit bank account" : "Add bank account"}</DialogTitle>
          <DialogDescription>
            Active accounts appear immediately on the public donation checkout with these details.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave({ ...values, id: account?.id });
          }}
          className="grid gap-4 sm:grid-cols-2"
        >
          {[
            ["bank_name", "Bank name *"],
            ["account_title", "Account title *"],
            ["account_number", "Account number"],
            ["iban", "IBAN"],
            ["swift_code", "SWIFT / BIC code"],
            ["branch_name", "Branch name"],
            ["branch_code", "Branch code"],
          ].map(([field, label]) => (
            <div key={field}>
              <label className={adminLabel} htmlFor={`bank-${field}`}>
                {label}
              </label>
              <input
                id={`bank-${field}`}
                value={values[field] || ""}
                onChange={update(field)}
                className={adminInput}
              />
            </div>
          ))}

          <div>
            <label className={adminLabel} htmlFor="bank-currency">
              Account currency
            </label>
            <input
              id="bank-currency"
              value={values.currency || ""}
              onChange={update("currency")}
              placeholder="PKR"
              className={adminInput}
            />
          </div>
          <div>
            <label className={adminLabel} htmlFor="bank-order">
              Display order
            </label>
            <input
              id="bank-order"
              type="number"
              value={values.display_order ?? 0}
              onChange={update("display_order")}
              className={adminInput}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={adminLabel} htmlFor="bank-address">
              Bank address
            </label>
            <input
              id="bank-address"
              value={values.bank_address || ""}
              onChange={update("bank_address")}
              className={adminInput}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={adminLabel} htmlFor="bank-instructions">
              Payment instructions
            </label>
            <textarea
              id="bank-instructions"
              value={values.instructions || ""}
              onChange={update("instructions")}
              className={adminTextarea}
              placeholder="Include your donation reference in the transfer narration."
            />
          </div>

          <label className="flex items-center gap-2 text-[12px] text-foreground/80 sm:col-span-2">
            <input
              type="checkbox"
              checked={Boolean(values.is_active)}
              onChange={update("is_active")}
              className="h-4 w-4 accent-[#174D38]"
            />
            Active — show this account on the donation checkout
          </label>

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className={adminButton} disabled={busy}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              Save account
            </button>
            <button type="button" className={adminGhostButton} onClick={onClose} disabled={busy}>
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}