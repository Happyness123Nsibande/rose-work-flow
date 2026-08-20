import { createFileRoute } from "@tanstack/react-router";
import { Mail, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AiOutput } from "@/components/AiOutput";
import { InputPanel, ToolPage } from "@/components/ToolPage";
import { DisclaimerBanner } from "@/components/AppShell";
import { useAi } from "@/lib/use-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email-generator")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkMate AI" },
      {
        name: "description",
        content:
          "Generate polished, workplace-ready emails in a formal, friendly or persuasive tone with WorkMate AI.",
      },
      { property: "og:title", content: "Smart Email Generator — WorkMate AI" },
      {
        property: "og:description",
        content: "Turn a few key points into a professional email in seconds.",
      },
    ],
  }),
  component: EmailGenerator,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;

function EmailGenerator() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Formal");
  const { output, loading, error, run, regenerate, clear } = useAi();

  const generate = (improve = false) => {
    if (!purpose.trim()) return;
    run({
      tool: "email",
      input: `Purpose / key points: ${purpose}${recipient ? `\nRecipient: ${recipient}` : ""}`,
      options: {
        tone,
        ...(improve
          ? {
              extra:
                "Improve and elevate the previous draft: sharpen the wording, tighten structure and make it more compelling while keeping the same intent.",
            }
          : {}),
      },
      activityLabel: purpose,
    });
  };

  return (
    <ToolPage
      icon={Mail}
      title="Smart Email Generator"
      description="Describe the purpose of your email and get a polished, workplace-ready draft."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <InputPanel title="Your Input">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient (optional)</Label>
            <Input
              id="recipient"
              placeholder="e.g. My manager, Sarah"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose or key points</Label>
            <Textarea
              id="purpose"
              rows={7}
              placeholder="e.g. Write an email to my manager requesting leave for Friday."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Tone</legend>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  aria-pressed={tone === t}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    tone === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => generate()} disabled={loading || !purpose.trim()}>
              <Sparkles className="size-4" aria-hidden />
              Generate Email
            </Button>
            <Button
              variant="outline"
              onClick={() => generate(true)}
              disabled={loading || !output}
            >
              <Wand2 className="size-4" aria-hidden />
              Improve
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPurpose("");
                setRecipient("");
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
          emptyTitle="No email generated yet"
          emptyHint="Add your key points, pick a tone and select Generate Email."
        />
      </div>

      <DisclaimerBanner />
    </ToolPage>
  );
}
