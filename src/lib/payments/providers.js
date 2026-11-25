// Provider catalogue shared by the admin UI and the server. Contains no secrets:
// only the credential fields each provider requires and the capabilities its
// documentation states, so the checkout never promises more than the provider allows.
export const PROVIDERS = [
  {
    key: "safepay",
    name: "Safepay",
    international: "Supported, subject to merchant approval",
    local: "Supported, subject to merchant approval",
    recurring: "Available, subject to product and account eligibility",
    supportsRecurring: true,
    currencies: ["PKR", "USD"],
    methods: ["Visa", "Mastercard", "Pakistani debit & credit cards"],
    hosts: { sandbox: "https://sandbox.api.getsafepay.com", live: "https://api.getsafepay.com" },
    fields: [
      { key: "api_key", label: "API Key", required: true, secret: false },
      { key: "secret_key", label: "API Secret", required: true, secret: true },
      { key: "webhook_secret", label: "Webhook Secret", required: true, secret: true },
      { key: "merchant_account_id", label: "Merchant Account ID", required: false, secret: false },
    ],
    note: "Payment sessions are created with Safepay's documented /order/v1/init endpoint and the donor is redirected to the Safepay hosted checkout.",
  },
  {
    key: "payfast",
    name: "PayFast Pakistan",
    international: "Supported, subject to merchant approval",
    local: "Supported",
    recurring: "Requires provider confirmation",
    supportsRecurring: false,
    currencies: ["PKR"],
    methods: ["Visa", "Mastercard", "Pakistani debit cards", "Local wallet & bank options enabled on the merchant account"],
    hosts: { sandbox: "https://ipguat.apps.net.pk", live: "https://ipg1.apps.net.pk" },
    fields: [
      { key: "merchant_id", label: "Merchant ID", required: true, secret: false },
      { key: "merchant_name", label: "Merchant Name", required: true, secret: false },
      { key: "secured_key", label: "Secured Key", required: true, secret: true },
      { key: "webhook_secret", label: "Webhook Secret", required: true, secret: true },
    ],
    note: "Uses PayFast's GetAccessToken and PostTransaction hosted checkout endpoints. Recurring billing is only enabled once PayFast confirms it for your merchant account.",
  },
  {
    key: "bank_alfalah",
    name: "Bank Alfalah",
    international: "Supported, subject to merchant approval",
    local: "Supported",
    recurring: "Supported where enabled for merchant account",
    supportsRecurring: true,
    currencies: ["PKR", "USD"],
    methods: ["Visa", "Mastercard", "Pakistani debit & credit cards"],
    hosts: {},
    fields: [
      { key: "merchant_id", label: "Merchant ID", required: true, secret: false },
      { key: "merchant_account_id", label: "Merchant Account ID", required: true, secret: false },
      { key: "api_key", label: "API Key", required: true, secret: false },
      { key: "api_secret", label: "API Secret", required: true, secret: true },
      { key: "webhook_secret", label: "Webhook Secret", required: true, secret: true },
      { key: "checkout_endpoint", label: "Hosted Checkout Endpoint", required: true, secret: false },
    ],
    note: "Bank Alfalah issues credentials and the hosted checkout endpoint only after merchant onboarding. Paste the values from your onboarding pack — the gateway stays inactive until a connection test passes.",
  },
  {
    key: "ubl",
    name: "UBL E-commerce",
    international: "Supported, subject to merchant approval",
    local: "Supported",
    recurring: "Supported where enabled for merchant account",
    supportsRecurring: true,
    currencies: ["PKR", "USD"],
    methods: ["Visa", "Mastercard", "Pakistani debit & credit cards"],
    hosts: {},
    fields: [
      { key: "merchant_id", label: "Merchant ID", required: true, secret: false },
      { key: "merchant_account_id", label: "Merchant Account ID", required: true, secret: false },
      { key: "api_key", label: "API Key", required: true, secret: false },
      { key: "api_secret", label: "API Secret", required: true, secret: true },
      { key: "webhook_secret", label: "Webhook Secret", required: true, secret: true },
      { key: "checkout_endpoint", label: "Hosted Checkout Endpoint", required: true, secret: false },
    ],
    note: "UBL issues credentials and the hosted checkout endpoint only after merchant onboarding. Paste the values from your onboarding pack — the gateway stays inactive until a connection test passes.",
  },
];

export const providerByKey = (key) => PROVIDERS.find((provider) => provider.key === key) || null;

export const PROVIDER_KEYS = PROVIDERS.map((provider) => provider.key);