import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AiOutput } from "@/components/AiOutput";
import { InputPanel, ToolPage } from "@/components/ToolPage";
import { DisclaimerBanner } from "@/components/AppShell";
import { useAi } from "@/lib/use-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/research-assistant")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — WorkMate AI" },
      {
        name: "description",
        content:
          "Research any workplace topic and get a structured brief with key points, comparisons and next steps.",
      },
      { property: "og:title", content: "AI Research Assistant — WorkMate AI" },
      {
        property: "og:description",
        content: "Structured research briefs for any workplace topic, in seconds.",
      },
    ],
  }),
  component: ResearchAssistant,
});

const DEPTHS = ["Quick overview", "Balanced brief", "Deep dive"] as const;

function ResearchAssistant() {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<(typeof DEPTHS)[number]>("Balanced brief");
  const { output, loading, error, run, regenerate, clear } = useAi();

  const research = () => {
    if (!topic.trim()) return;
    run({
      tool: "research",
      input: topic,
      options: { depth },
      activityLabel: topic,
    });
  };

  return (
    <ToolPage
      icon={BookOpen}
      title="AI Research Assistant"
      description="Ask a research question and get a clear, structured brief you can share with your team."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <InputPanel title="Research topic">
          <div className="space-y-2">
            <Label htmlFor="topic">What do you want to understand?</Label>
            <Textarea
              id="topic"
              rows={7}
              placeholder="e.g. Compare hybrid vs fully remote work policies for a 40-person team."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Depth</legend>
            <div className="flex flex-wrap gap-2">
              {DEPTHS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDepth(d)}
                  aria-pressed={depth === d}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    depth === d
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-2">
            <Button onClick={research} disabled={loading || !topic.trim()}>
              <Search className="size-4" aria-hidden />
              Research topic
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setTopic("");
                clear();
              }}
              disabled={loading}
            >
              <Trash2 className="size-4" aria-hidden />
              Clear
            </Button>
          </div>
        </InputPanel>

        <AiOutput
          output={output}
          loading={loading}
          error={error}
          onRegenerate={regenerate}
          emptyTitle="No research yet"
          emptyHint="Describe a topic or question and select Research topic."
        />
      </div>

      <DisclaimerBanner />
    </ToolPage>
  );
}
