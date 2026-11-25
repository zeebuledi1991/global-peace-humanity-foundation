import { createFileRoute } from "@tanstack/react-router";
import { handleGatewayWebhook } from "@/lib/payments/webhook.server";

export const Route = createFileRoute("/api/webhooks/bank-alfalah")({
  server: {
    handlers: {
      POST: async ({ request, context }) => {
        const result = await handleGatewayWebhook({
          db: context.getBase44().asServiceRole,
          providerKey: "bank_alfalah",
          request,
        });
        return Response.json(result.body, { status: result.status });
      },
    },
  },
});