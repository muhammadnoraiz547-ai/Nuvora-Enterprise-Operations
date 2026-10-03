import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Archive,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckSquare,
  CircleHelp,
  ClipboardCheck,
  FileText,
  Gauge,
  GitBranch,
  History,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Wrench,
  Landmark,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCurrentOrganization } from "@/lib/api/organization";
import { useDemoData } from "@/data/context";

const groups = [
  { label: "OVERVIEW", items: [["/dashboard", "Overview", LayoutDashboard]] },
  {
    label: "WORKSPACE",
    items: [
      ["/workspace/tasks", "Tasks", CheckSquare],
      ["/workspace/activity", "Activity", Activity],
      ["/workspace/approvals", "Approvals", ClipboardCheck],
    ],
  },
  {
    label: "PEOPLE",
    items: [
      ["/people/employees", "Employees", Users],
      ["/people/teams", "Teams", Users],
      ["/people/departments", "Departments", Building2],
      ["/people/attendance", "Attendance", CalendarDays],
      ["/people/performance", "Performance", BarChart3],
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      ["/operations/processes", "Processes", GitBranch],
      ["/operations/inventory", "Inventory", Boxes],
      ["/operations/assets", "Assets", Package],
      ["/operations/maintenance", "Maintenance", Wrench],
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      ["/management/documents", "Documents", FileText],
      ["/management/expenses", "Expenses", Landmark],
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      ["/intelligence/ai", "AI Assistant", Sparkles],
      ["/intelligence/insights", "Insights", Gauge],
      ["/intelligence/reports", "Reports", BarChart3],
    ],
  },
  {
    label: "GOVERNANCE",
    items: [
      ["/governance/audit", "Audit Trail", History],
      ["/governance/verification", "Verification", ShieldCheck],
      ["/governance/access", "Access Control", ShieldCheck],
    ],
  },
  {
    label: "ADMINISTRATION",
    items: [
      ["/settings/organization", "Organization Settings", Settings2],
      ["/settings/users", "Users", Users],
      ["/settings/roles", "Roles & Permissions", ShieldCheck],
      ["/settings/modules", "Modules", BriefcaseBusiness],
      ["/settings/integrations", "Integrations", Archive],
    ],
  },
] as const;

export default function AppShell({ children }: { children: ReactNode }) {
  const location = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: apiOrganization } = useCurrentOrganization();
  const { data: demoData } = useDemoData();
  const navItems = groups.reduce<
    Array<{ group: string; item: (typeof groups)[number]["items"][number] }>
  >((items, group) => {
    group.items.forEach((item) => items.push({ group: group.label, item }));
    return items;
  }, []);
  const current =
    navItems.find(({ item }) => item[0] === location)?.item[1] ?? "Workspace";
  const searchResults = navItems
    .filter(({ item }) => item[1].toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);
  // Fall back to demo data if API is unavailable
  const organization = apiOrganization || demoData.organization;
  const orgName = organization?.name || "Loading...";
  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">O</span>Operations Flow
        </div>
        <div className="org-switch">
          <span className="org-monogram">{orgName.slice(0, 2).toUpperCase()}</span>
          <div>
            <div className="org-title">{orgName}</div>
            <div className="org-subtitle">Organization workspace</div>
          </div>
        </div>
        <nav aria-label="Primary navigation">
          {groups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>
              {group.items.map(([href, label, Icon]) => (
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`nav-link ${location === href ? "active" : ""}`}
                  key={href}
                  data-testid={`link-nav-${href.split("/").filter(Boolean).join("-")}`}
                >
                  <Icon className="nav-icon" strokeWidth={1.8} />
                  <span>{label}</span>
                  {href === "/workspace/approvals" && (
                    <span className="nav-count">4</span>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link
            href="/settings/organization"
            className="nav-link"
            data-testid="link-settings-shortcut"
          >
            <Settings2 className="nav-icon" />
            Workspace settings
          </Link>
          <div className="demo-note">
            Demo workspace · changes are saved in this browser only.
          </div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              className="top-icon mobile-nav-toggle"
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation"
              data-testid="button-toggle-navigation"
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
            <div className="breadcrumbs">
              {orgName}{" "}
              <span style={{ padding: "0 7px", color: "#bbb7ae" }}>/</span>{" "}
              {current}
            </div>
          </div>
          <div className="top-actions" style={{ position: "relative" }}>
            <button
              className="top-icon"
              aria-label="Search workspace"
              onClick={() => {
                setSearchOpen(!searchOpen);
                setHelpOpen(false);
              }}
              data-testid="button-global-search"
            >
              <Search size={16} />
            </button>
            <button
              className="top-icon"
              aria-label="Help"
              onClick={() => {
                setHelpOpen(!helpOpen);
                setSearchOpen(false);
              }}
              data-testid="button-help"
            >
              <CircleHelp size={16} />
            </button>
            <ThemeToggle />
            <div className="profile-chip">
              <span className="avatar">AM</span>
              <span className="profile-name">Alex Morgan</span>
            </div>
            {searchOpen && (
              <div
                className="panel"
                style={{
                  position: "absolute",
                  right: 70,
                  top: 42,
                  width: 280,
                  padding: 10,
                  zIndex: 30,
                  boxShadow: "0 12px 28px #292c2614",
                }}
              >
                <input
                  className="field"
                  autoFocus
                  placeholder="Find a workspace area…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ width: "100%" }}
                  data-testid="input-global-search"
                />
                <div style={{ marginTop: 7 }}>
                  {searchResults.map(({ group, item }) => (
                    <Link
                      href={item[0]}
                      onClick={() => setSearchOpen(false)}
                      className="nav-link"
                      key={item[0]}
                      data-testid={`link-search-${item[0].split("/").filter(Boolean).join("-")}`}
                    >
                      <span style={{ flex: 1 }}>{item[1]}</span>
                      <span className="panel-caption">{group}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {helpOpen && (
              <div
                className="panel"
                style={{
                  position: "absolute",
                  right: 35,
                  top: 42,
                  width: 260,
                  padding: 15,
                  zIndex: 30,
                  boxShadow: "0 12px 28px #292c2614",
                }}
              >
                <div className="panel-title">Workspace help</div>
                <div
                  className="panel-caption"
                  style={{ lineHeight: 1.6, marginTop: 7 }}
                >
                  This preview uses sample records and local browser storage.
                  Use the persistent navigation to explore people, operations
                  and governance.
                </div>
                <div className="notice" style={{ marginTop: 11 }}>
                  Live support and integrations are not connected.
                </div>
                <button
                  className="btn btn-small"
                  style={{ marginTop: 10 }}
                  onClick={() => setHelpOpen(false)}
                  data-testid="button-dismiss-help"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </header>
        {children}
      </div>
      {open && (
        <button
          aria-label="Close navigation overlay"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            border: 0,
            background: "#252b2525",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}
