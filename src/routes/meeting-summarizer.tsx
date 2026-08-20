import { createFileRoute } from "@tanstack/react-router";
import { FileText, NotebookPen, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AiOutput } from "@/components/AiOutput";
import { InputPanel, ToolPage } from "@/components/ToolPage";
import { DisclaimerBanner } from "@/components/AppShell";
import { useAi } from "@/lib/use-ai";

export const Route = createFileRoute("/meeting-summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — WorkMate AI" },
      {
        name: "description",
        content:
          "Paste meeting notes or a transcript and get a summary, decisions, action items and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — WorkMate AI" },
      {
        property: "og:description",
        content: "Turn long meeting notes into clear decisions, owners and deadlines.",
      },
    ],
  }),
  component: MeetingSummarizer,
});

const SAMPLE = `Weekly product sync — Tuesday
Attendees: Thabo (PM), Lerato (Design), Sam (Engineering)
- Thabo shared that onboarding completion is at 62%, below the 75% target.
- Lerato proposed simplifying step 2 of the sign-up flow; team agreed.
- Sam raised that the reporting API is slower since last release; needs investigation.
- Decision: ship the simplified onboarding flow in the next release.
- Decision: postpone the notifications feature to next quarter.
- Sam will profile the reporting API by Thursday.
- Lerato will deliver updated designs by Friday 12:00.
- Thabo will update stakeholders after the release next Wednesday.`;

function MeetingSummarizer() {
  const [notes, setNotes] = useState("");
  const { output, loading, error, run, regenerate, clear } = useAi();

  return (
    <ToolPage
      icon={NotebookPen}
      title="Meeting Notes Summarizer"
      description="Paste your meeting notes or transcript to extract the summary, decisions, action items and deadlines."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <InputPanel title="Your Input">
          <div className="space-y-2">
            <Label htmlFor="notes">Meeting notes or transcript</Label>
            <Textarea
              id="notes"
              rows={14}
              placeholder="Paste your meeting notes or transcript here…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{notes.length} characters</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() =>
                run({ tool: "meeting", input: notes, activityLabel: notes.slice(0, 80) })
              }
              disabled={loading || !notes.trim()}
            >
              <FileText className="size-4" aria-hidden />
              Summarize
            </Button>
            <Button variant="outline" onClick={() => setNotes(SAMPLE)} disabled={loading}>
              Load sample notes
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setNotes("");
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
          emptyTitle="No summary yet"
          emptyHint="Paste your notes and select Summarize to see key points, decisions, action items and deadlines."
        />
      </div>

      <DisclaimerBanner />
    </ToolPage>
  );
}
