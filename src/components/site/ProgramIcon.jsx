import {
  BookOpen,
  HeartPulse,
  Wheat,
  Droplets,
  Sprout,
  Users,
  Baby,
  LifeBuoy,
  Handshake,
  Globe2,
} from "lucide-react";

const ICONS = {
  book: BookOpen,
  health: HeartPulse,
  food: Wheat,
  water: Droplets,
  livelihood: Sprout,
  women: Users,
  child: Baby,
  relief: LifeBuoy,
  peace: Handshake,
};

export default function ProgramIcon({ name, className }) {
  const Icon = ICONS[name] || Globe2;
  return <Icon className={className} aria-hidden="true" />;
}