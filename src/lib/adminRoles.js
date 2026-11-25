// Administrator roles for the dashboard UI. The authoritative permission checks
// live on the server in src/lib/admin-guard.js.
export const ADMIN_ROLE_OPTIONS = [
  {
    value: "super_admin",
    label: "Super Admin",
    hint: "Full access to the website, dashboard, payments, users and administrator accounts.",
  },
  {
    value: "administrator",
    label: "Administrator",
    hint: "General website administration. Cannot create or promote administrators.",
  },
  {
    value: "finance_manager",
    label: "Finance Manager",
    hint: "Donations, payment verification, bank transfers, financial reports and gateway settings.",
  },
  {
    value: "project_manager",
    label: "Project Manager",
    hint: "Projects, programs, project updates and related content.",
  },
];

export const ADMIN_ROLE_LABELS = ADMIN_ROLE_OPTIONS.reduce((acc, role) => {
  acc[role.value] = role.label;
  return acc;
}, {});

export const ADMIN_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Deactivated" },
];