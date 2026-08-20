import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiOutput } from "@/components/AiOutput";
import { InputPanel, ToolPage } from "@/components/ToolPage";
import { DisclaimerBanner } from "@/components/AppShell";
import { useAi } from "@/lib/use-ai";
import { useTasks, type Task } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/task-planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — WorkMate AI" },
      {
        name: "description",
        content:
          "Turn a messy to-do list into a prioritised, deadline-aware plan with the WorkMate AI task planner.",
      },
      { property: "og:title", content: "AI Task Planner — WorkMate AI" },
      {
        property: "og:description",
        content: "Prioritise your workload and get a realistic daily plan in seconds.",
      },
    ],
  }),
  component: TaskPlanner,
});

const PRIORITIES: Task["priority"][] = ["high", "medium", "low"];

function TaskPlanner() {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [goals, setGoals] = useState("");
  const { output, loading, error, run, regenerate } = useAi();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title: title.trim(), deadline, priority });
    setTitle("");
    setDeadline("");
  };

  const plan = () => {
    const list = tasks
      .filter((t) => !t.done)
      .map((t) => `- ${t.title} (priority: ${t.priority}${t.deadline ? `, due ${t.deadline}` : ""})`)
      .join("\n");
    const input = `${list || "No saved tasks yet."}\n\nAdditional goals or notes: ${goals || "none"}`;
    run({ tool: "tasks", input, activityLabel: "Generated a prioritised task plan" });
  };

  return (
    <ToolPage
      icon={ListChecks}
      title="AI Task Planner"
      description="Capture your tasks, then let WorkMate AI prioritise them into a realistic plan."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <InputPanel title="Add a task">
            <form className="space-y-4" onSubmit={submit}>
              <div className="space-y-2">
                <Label htmlFor="task-title">Task</Label>
                <Input
                  id="task-title"
                  placeholder="e.g. Draft the Q3 report"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-deadline">Deadline</Label>
                <Input
                  id="task-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Priority</legend>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      aria-pressed={priority === p}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors",
                        priority === p
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Button type="submit" disabled={!title.trim()}>
                <Plus className="size-4" aria-hidden />
                Add task
              </Button>
            </form>
          </InputPanel>

          <InputPanel title={`Your tasks (${tasks.filter((t) => !t.done).length} open)`}>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tasks yet. Add your first one above.
              </p>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleTask(t.id)}
                      aria-label={`Mark ${t.title} as done`}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    <span
                      className={cn(
                        "flex-1 text-sm",
                        t.done && "text-muted-foreground line-through",
                      )}
                    >
                      {t.title}
                      {t.deadline ? (
                        <span className="block text-xs text-muted-foreground">Due {t.deadline}</span>
                      ) : null}
                    </span>
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium capitalize text-primary">
                      {t.priority}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTask(t.id)}
                      aria-label={`Delete ${t.title}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-2">
              <Label htmlFor="goals">Goals or constraints (optional)</Label>
              <Textarea
                id="goals"
                rows={3}
                placeholder="e.g. I only have 4 focused hours tomorrow."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div>

            <Button onClick={plan} disabled={loading}>
              <Sparkles className="size-4" aria-hidden />
              Generate plan
            </Button>
          </InputPanel>
        </div>

        <AiOutput
          output={output}
          loading={loading}
          error={error}
          onRegenerate={regenerate}
          emptyTitle="No plan generated yet"
          emptyHint="Add a few tasks and select Generate plan to get a prioritised schedule."
        />
      </div>

      <DisclaimerBanner />
    </ToolPage>
  );
}
