import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Info } from "lucide-react";
import GatewayCard from "@/components/admin/payments/GatewayCard";
import GatewayConfigDialog from "@/components/admin/payments/GatewayConfigDialog";
import { LoadingBlock, Panel } from "@/components/admin/adminUi";
import { listGateways, saveGatewayCredentials, setGatewayEnabled, testGatewayConnection } from "@/lib/payment-fns";

export const Route = createFileRoute("/_authed/admin/payments/gateways")({
  component: GatewaysPage,
});

function GatewaysPage() {
  const load = useServerFn(listGateways);
  const save = useServerFn(saveGatewayCredentials);
  const test = useServerFn(testGatewayConnection);
  const toggle = useServerFn(setGatewayEnabled);

  const [gateways, setGateways] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [editing, setEditing] = useState(null);

  const refresh = () =>
    load()
      .then(setGateways)
      .catch((error) => toast.error(error?.message || "Could not load gateways"));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (id, action, successMessage) => {
    setBusyId(id);
    try {
      await action();
      if (successMessage) toast.success(successMessage);
      await refresh();
    } catch (error) {
      toast.error(error?.message || "The action could not be completed");
    } finally {
      setBusyId("");
    }
  };

  if (!gateways) return <LoadingBlock label="Loading payment gateways" />;

  return (
    <div className="space-y-5">
      <p className="flex items-start gap-2 rounded-sm border border-border bg-white p-4 text-[12px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        A gateway appears on the public donation page only after its credentials are saved, a connection
        test passes and the gateway is switched on. Turning a gateway off hides it from new checkouts
        immediately and never touches existing donation records.
      </p>

      <div className="grid gap-5 xl:grid-cols-2">
        {gateways.map((gateway) => (
          <GatewayCard
            key={gateway.id}
            gateway={gateway}
            busy={busyId === gateway.id}
            onConfigure={() => setEditing(gateway)}
            onTest={() =>
              run(gateway.id, async () => {
                const result = await test({ data: { id: gateway.id } });
                if (result.ok) toast.success(result.message);
                else toast.error(result.message);
              })
            }
            onToggle={(checked) =>
              run(
                gateway.id,
                () => toggle({ data: { id: gateway.id, enabled: checked } }),
                checked ? `${gateway.name} is now live on checkout` : `${gateway.name} was deactivated`
              )
            }
          />
        ))}
      </div>

      <GatewayConfigDialog
        gateway={editing}
        open={Boolean(editing)}
        busy={Boolean(editing) && busyId === editing?.id}
        onClose={() => setEditing(null)}
        onSave={(payload) =>
          run(
            payload.id,
            async () => {
              await save({ data: payload });
              setEditing(null);
            },
            "Configuration saved. Run a connection test to activate this gateway."
          )
        }
      />

      {!gateways.length && <Panel className="p-6 text-[13px] text-muted-foreground">No gateways available.</Panel>}
    </div>
  );
}