import {
  Activity,
  Bell,
  CheckCircle2,
  CreditCard,
  FolderKanban,
  HandCoins,
  Layers,
  LayoutDashboard,
  ReceiptText,
  Settings,
  User,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const NAV = [
  { to: "/portal", label: "Overview", icon: LayoutDashboard },
  { to: "/portal/donations", label: "My Donations", icon: HandCoins },
  { to: "/portal/transactions", label: "My Transactions", icon: ReceiptText },
  { to: "/portal/payment-methods", label: "Payment Methods", icon: CreditCard },
  { to: "/portal/projects", label: "My Projects", icon: FolderKanban },
  { to: "/portal/projects/active", label: "Active Projects", icon: Activity },
  { to: "/portal/projects/completed", label: "Completed Projects", icon: CheckCircle2 },
  { to: "/portal/notifications", label: "Notifications", icon: Bell },
  { to: "/portal/profile", label: "My Profile", icon: User },
  { to: "/portal/settings", label: "Account Settings", icon: Settings },
  { to: "/projects", label: "All GPHF Projects", icon: Layers },
];

export default function PortalShell({ user }) {
  return (
    <DashboardLayout
      nav={NAV}
      user={user}
      brandLabel="Donor Portal"
      brandSub="GPHF"
      roleLabel="Donor"
      homeTo="/portal"
    />
  );
}