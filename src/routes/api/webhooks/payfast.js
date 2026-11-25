import { createFileRoute } from "@tanstack/react-router";
import { handleGatewayWebhook } from "@/lib/payments/webhook.server";

export const Route = createFileRoute("/api/webhooks/payfast")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const result = await handleGatewayWebhook({
          db: context.getBase44().asServiceRole,
          providerKey: "payfast",
          request,
        });
        return Response.json(result.body, { status: result.status });
      },
    },
  },
});