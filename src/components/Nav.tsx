import { Scale, PlusCircle, List } from "lucide-react";
import type { View } from "../App";

interface NavItem {
  view: View;
  label: string;
  Icon: React.FC<{ className?: string }>;
}

const navItems: NavItem[] = [
  { view: "dashboard", label: "Dashboard", Icon: Scale },
  { view: "log", label: "Log", Icon: PlusCircle },
  { view: "history", label: "History", Icon: List },
];

interface Props {
  activeView: View;
  onViewChange: (v: View) => void;
}

export default function Nav({ activeView, onViewChange }: Props) {
  return (
    <header
      className="border-b"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
    >
      <div className="container mx-auto px-4 max-w-4xl flex items-center gap-1 h-14">
        <span className="font-bold text-lg mr-4">Heavy Detail</span>
        {navItems.map(({ view, label, Icon }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            className={[
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              activeView === view
                ? "text-[var(--color-primary-foreground)] bg-[var(--color-primary)]"
                : "hover:bg-[var(--color-secondary)] text-[var(--color-foreground)]",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
