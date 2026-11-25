import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminButton, adminGhostButton, adminInput, adminLabel } from "@/components/admin/adminUi";

export default function GatewayConfigDialog({ gateway, open, busy, onClose, onSave }) {
  const [environment, setEnvironment] = useState("sandbox");
  const [values, setValues] = useState({});

  useEffect(() => {
    if (!open) return;
    setEnvironment(gateway?.environment || "sandbox");
    setValues({});
  }, [open, gateway]);

  if (!gateway) return null;

  const submit = (event) => {
    event.preventDefault();
    onSave({ id: gateway.id, environment, values });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure {gateway.name}</DialogTitle>
          <DialogDescription>
            Credentials are encrypted before storage, never shown again in full, and never sent to a
            browser. {gateway.note}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={adminLabel} htmlFor="gateway-environment">
              Environment
            </label>
            <select
              id="gateway-environment"
              value={environment}
              onChange={(event) => setEnvironment(event.target.value)}
              className={adminInput}
            >
              <option value="sandbox">Sandbox / Test mode</option>
              <option value="live">Live / Production mode</option>
            </select>
          </div>

          {gateway.fields.map((field) => (
            <div key={field.key}>
              <label className={adminLabel} htmlFor={`field-${field.key}`}>
                {field.label} {field.required && <span className="text-destructive">*</span>}
              </label>
              <input
                id={`field-${field.key}`}
                type={field.secret ? "password" : "text"}
                autoComplete="off"
                value={values[field.key] ?? ""}
                onChange={(event) => setValues((prev) => ({ ...prev, [field.key]: event.target.value }))}
                placeholder={field.saved ? `Saved: ${field.hint}` : field.secret ? "Not set" : ""}
                className={adminInput}
              />
            </div>
          ))}

          <p className="flex items-start gap-2 rounded-sm border border-border bg-mist p-3 text-[11.5px] leading-relaxed text-muted-foreground">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            Leave a field blank to keep the value already saved. Saving new credentials requires a fresh
            connection test before the gateway can be activated.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button type="submit" className={adminButton} disabled={busy}>
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              Save configuration
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