import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Settings as SettingsIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { InputPanel, ToolPage } from "@/components/ToolPage";
import { DisclaimerBanner } from "@/components/AppShell";
import { clearAllHistory, useSettings, type Settings } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WorkMate AI" },
      {
        name: "description",
        content:
          "Personalise WorkMate AI: switch themes, tune response length and manage your saved history.",
      },
      { property: "og:title", content: "Settings — WorkMate AI" },
      {
        property: "og:description",
        content: "Control theme, notifications, response length and stored history.",
      },
    ],
  }),
  component: SettingsPage,
});

const LENGTHS: Settings["responseLength"][] = ["concise", "balanced", "detailed"];

function SettingsPage() {
  const { settings, update, reset } = useSettings();

  return (
    <ToolPage
      icon={SettingsIcon}
      title="Settings"
      description="Personalise how WorkMate AI looks and responds."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <InputPanel title="Appearance">
          <ToggleRow
            id="dark-mode"
            label="Dark mode"
            hint="Switch between the light and dark theme."
            checked={settings.theme === "dark"}
            onChange={(v) => update("theme", v ? "dark" : "light")}
          />
        </InputPanel>

        <InputPanel title="Notifications">
          <ToggleRow
            id="notifications"
            label="In-app notifications"
            hint="Show toasts when actions complete."
            checked={settings.notifications}
            onChange={(v) => update("notifications", v)}
          />
          <ToggleRow
            id="deadline-alerts"
            label="Deadline alerts"
            hint="Highlight tasks that are due soon on the dashboard."
            checked={settings.deadlineAlerts}
            onChange={(v) => update("deadlineAlerts", v)}
          />
        </InputPanel>

        <InputPanel title="AI responses">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Response length</legend>
            <div className="flex flex-wrap gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => update("responseLength", l)}
                  aria-pressed={settings.responseLength === l}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium capitalize transition-colors",
                    settings.responseLength === l
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </fieldset>
          <ToggleRow
            id="auto-copy"
            label="Auto-copy results"
            hint="Copy generated text to your clipboard automatically."
            checked={settings.autoCopy}
            onChange={(v) => update("autoCopy", v)}
          />
        </InputPanel>

        <InputPanel title="Data & privacy">
          <p className="text-sm text-muted-foreground">
            WorkMate AI stores your tasks, chats and activity only in this browser. Clearing them is
            permanent.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                reset();
                toast.success("Settings restored to defaults");
              }}
            >
              <RotateCcw className="size-4" aria-hidden />
              Reset settings
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clearAllHistory();
                toast.success("Chat and activity history cleared");
              }}
            >
              <Trash2 className="size-4" aria-hidden />
              Clear history
            </Button>
          </div>
        </InputPanel>
      </div>

      <DisclaimerBanner />
    </ToolPage>
  );
}

function ToggleRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
