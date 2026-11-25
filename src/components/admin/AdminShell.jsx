import {
  BookOpen,
  ClipboardList,
  CreditCard,
  FileText,
  FolderKanban,
  HandCoins,
  Handshake,
  Images,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Newspaper,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const ALL = ["super_admin", "administrator", "finance_manager", "project_manager"];
const CONTENT = ["super_admin", "administrator"];
const FINANCE = ["super_admin", "administrator", "finance_manager"];
const PROJECTS = ["super_admin", "administrator", "project_manager"];
const USER_MANAGEMENT = ["super_admin", "administrator"];
const SUPER_ADMIN = ["super_admin"];

const NAV = [
  { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard, roles: ALL },
  { to: "/admin/finance", label: "Finance", icon: Wallet, roles: FINANCE },
  { to: "/admin/donations", label: "Donations", icon: HandCoins, roles: FINANCE },
  { to: "/admin/payments", label: "Payment Management", icon: CreditCard, roles: FINANCE },
  { to: "/admin/donors", label: "Donors", icon: Users, roles: ALL },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban, roles: PROJECTS },
  { to: "/admin/programs", label: "Programs", icon: BookOpen, roles: CONTENT },
  { to: "/admin/campaigns", label: "Campaigns", icon: Megaphone, roles: CONTENT },
  { to: "/admin/news", label: "News & Stories", icon: Newspaper, roles: CONTENT },
  { to: "/admin/gallery", label: "Gallery", icon: Images, roles: CONTENT },
  { to: "/admin/documents", label: "Reports", icon: FileText, roles: CONTENT },
  { to: "/admin/volunteers", label: "Volunteers", icon: Users, roles: CONTENT },
  { to: "/admin/partnerships", label: "Partnerships", icon: Handshake, roles: CONTENT },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, roles: CONTENT },
  { to: "/admin/users", label: "Users & Access", icon: ShieldCheck, roles: USER_MANAGEMENT },
  { to: "/admin/audit", label: "Audit Log", icon: ClipboardList, roles: USER_MANAGEMENT },
  { to: "/admin/admin-management", label: "Admin Management", icon: UserCog, roles: SUPER_ADMIN },
  { to: "/admin/super-admin-settings", label: "Account Settings", icon: KeyRound, roles: SUPER_ADMIN },
  { to: "/admin/settings", label: "Site Settings", icon: Settings, roles: CONTENT },
];

const ROLE_LABELS = {
  super_admin: "Super Admin",
  administrator: "Administrator",
  finance_manager: "Finance Manager",
  project_manager: "Project Manager",
};

export default function AdminShell({ user, adminRole }) {
  // The role comes from the server-verified session, never from the cached user.
  const role = adminRole || user?.admin_role || "administrator";
  const nav = NAV.filter((item) => item.roles.includes(role));

  return (
    <DashboardLayout
      nav={nav}
      user={user}
      brandLabel="GPHF Admin"
      brandSub={ROLE_LABELS[role] || "Management"}
      roleLabel={ROLE_LABELS[role] || "Management"}
      homeTo="/admin/dashboard"
    />
  );
}