import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Bot,
  CalendarClock,
  CheckCircle2,
  ListChecks,
  Mail,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { DisclaimerBanner } from "@/components/AppShell";
import { relativeTime, useActivity, useTasks } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WorkMate AI Productivity Assistant" },
      {
        name: "description",
        content:
          "WorkMate AI brings email drafting, meeting summaries, task planning, research and chat into one workspace dashboard.",
      },
      { property: "og:title", content: "WorkMate AI — Your Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Five AI tools for work: emails, meeting notes, task plans, research and chat.",
      },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/email-generator",
    icon: Mail,
    title: "Smart Email Generator",
    text: "Turn key points into a polished email in any tone.",
  },
  {
    to: "/meeting-summarizer",
    icon: NotebookPen,
    title: "Meeting Notes Summarizer",
    text: "Condense messy notes into decisions and action items.",
  },
  {
    to: "/task-planner",
    icon: ListChecks,
    title: "AI Task Planner",
    text: "Prioritise your workload into a realistic daily plan.",
  },
  {
    to: "/research-assistant",
    icon: BookOpen,
    title: "AI Research Assistant",
    text: "Get a structured brief on any workplace topic.",
  },
  {
    to: "/chatbot",
    icon: Bot,
    title: "AI Workplace Chatbot",
    text: "Ask anything and get streaming answers instantly.",
  },
] as const;

function Dashboard() {
  const { tasks } = useTasks();
  const { activity } = useActivity();

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);
  const upcoming = open
    .filter((t) => t.deadline)
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <section className="surface-card overflow-hidden p-6 sm:p-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="size-3.5" aria-hidden />
          Your AI workspace
        </span>
        <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
          Good to see you — let's get today moving.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          WorkMate AI drafts your emails, summarises your meetings, plans your tasks, researches
          topics and answers questions — all in one place.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/email-generator"
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Draft an email
          </Link>
          <Link
            to="/chatbot"
            className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition-colors hover:border-primary/40"
          >
            Ask the assistant
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={ListChecks} label="Open tasks" value={open.length} />
        <StatCard icon={CheckCircle2} label="Completed" value={done.length} />
        <StatCard icon={CalendarClock} label="With deadlines" value={upcoming.length} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">AI tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map(({ to, icon: Icon, title, text }) => (
            <Link
              key={to}
              to={to}
              className="surface-card group p-5 transition-transform hover:-translate-y-0.5"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="mt-3 font-semibold group-hover:text-primary">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Upcoming deadlines</h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No deadlines yet — add tasks in the{" "}
              <Link to="/task-planner" className="text-primary underline-offset-4 hover:underline">
                task planner
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcoming.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <span>{t.title}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                      t.priority === "high"
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary-soft text-primary",
                    )}
                  >
                    {t.deadline}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Your AI activity will appear here once you start using the tools.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="rounded-xl border border-border px-3 py-2 text-sm">
                  <span className="font-medium capitalize">{a.tool}</span>
                  <span className="text-muted-foreground"> — {a.label}</span>
                  <span className="block text-xs text-muted-foreground">{relativeTime(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <DisclaimerBanner />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ListChecks;
  label: string;
  value: number;
}) {
  return (
    <div className="surface-card flex items-center gap-4 p-5">
      <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
