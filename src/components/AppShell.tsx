import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bot,
  CalendarCheck,
  LayoutDashboard,
  Mail,
  Menu,
  NotebookPen,
  Search,
  Settings as SettingsIcon,
  ShieldAlert,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email-generator", label: "Email Generator", icon: Mail },
  { to: "/meeting-summarizer", label: "Meeting Summarizer", icon: NotebookPen },
  { to: "/task-planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/research-assistant", label: "Research Assistant", icon: Search },
  { to: "/chatbot", label: "AI Chatbot", icon: Bot },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export const DISCLAIMER_TEXT =
  "AI-generated content may contain inaccuracies or omissions. Users should review and verify AI-generated information before using it for important workplace decisions or communications. Do not enter confidential, sensitive, personal, financial, or proprietary company information unless the system is approved for such data.";

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-base font-bold text-primary-foreground">
        W
      </span>
      <span className="leading-tight">
        <span className="block font-display text-base font-bold tracking-tight">
          WorkMate<span className="text-primary"> AI</span>
        </span>
        <span className="block text-[11px] text-muted-foreground">Productivity Assistant</span>
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary-soft p-4">
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
      <p className="text-xs leading-relaxed text-foreground/80">
        <span className="font-semibold text-foreground">Responsible AI notice: </span>
        {DISCLAIMER_TEXT}
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Wordmark />
        <div className="mt-7 flex-1">
          <NavLinks />
        </div>
        <p className="mt-4 border-t border-sidebar-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
          Always review AI output before sending or sharing.
        </p>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <Wordmark />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="grid size-11 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-accent"
        >
          {open ? <Menu className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sidebar px-4 py-5 shadow-xl">
            <div className="flex items-center justify-between">
              <Wordmark />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-10 place-items-center rounded-lg hover:bg-accent"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        <footer className="mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6">
          <div className="border-t border-border pt-5 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">WorkMate AI — Work smarter. Communicate better. Get more done.</p>
            <p className="mt-1.5 leading-relaxed">{DISCLAIMER_TEXT}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
