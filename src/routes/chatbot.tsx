import { createFileRoute } from "@tanstack/react-router";
import { Bot, Loader2, Send, Trash2, User } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolPage } from "@/components/ToolPage";
import { DisclaimerBanner } from "@/components/AppShell";
import { useAi } from "@/lib/use-ai";
import { useChatHistory, type ChatMessage } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chatbot")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chatbot — WorkMate AI" },
      {
        name: "description",
        content:
          "Chat with WorkMate AI about productivity, workplace communication and getting unstuck at work.",
      },
      { property: "og:title", content: "AI Workplace Chatbot — WorkMate AI" },
      {
        property: "og:description",
        content: "A workplace assistant that answers questions and streams replies in real time.",
      },
    ],
  }),
  component: Chatbot,
});

const SUGGESTIONS = [
  "How do I say no to a meeting politely?",
  "Help me plan a productive Monday.",
  "Draft an agenda for a 30-minute stand-up.",
];

function Chatbot() {
  const [messages, setMessages] = useChatHistory();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const { loading, error, run } = useAi();
  const endRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setStreaming("");

    const full = await run({
      tool: "chat",
      messages: history.map(({ role, content }) => ({ role, content })),
      activityLabel: trimmed,
      onChunk: (partial) => {
        setStreaming(partial);
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      },
    });

    setStreaming("");
    if (full) {
      setMessages([...history, { id: crypto.randomUUID(), role: "assistant", content: full }]);
    }
  };

  return (
    <ToolPage
      icon={Bot}
      title="AI Workplace Chatbot"
      description="Ask anything about work, productivity or communication — replies stream in as they're written."
    >
      <section className="surface-card flex min-h-[26rem] flex-col p-4 sm:p-5">
        <div className="flex-1 space-y-4 overflow-y-auto" aria-live="polite">
          {messages.length === 0 && !streaming ? (
            <div className="space-y-4 py-8 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                <Bot className="size-6" aria-hidden />
              </span>
              <p className="text-sm text-muted-foreground">
                Start a conversation, or try one of these:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} content={m.content} />
          ))}
          {streaming ? <Bubble role="assistant" content={streaming} /> : null}
          {loading && !streaming ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              WorkMate AI is thinking…
            </p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div ref={endRef} />
        </div>

        <form
          className="mt-4 flex items-end gap-2 border-t border-border pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Textarea
            rows={2}
            value={input}
            aria-label="Message WorkMate AI"
            placeholder="Ask WorkMate AI anything about your workday…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send message">
            <Send className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear conversation"
            onClick={() => setMessages([])}
            disabled={loading || messages.length === 0}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </form>
      </section>

      <DisclaimerBanner />
    </ToolPage>
  );
}

function Bubble({ role, content }: { role: ChatMessage["role"]; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full",
          isUser ? "bg-secondary text-secondary-foreground" : "bg-primary-soft text-primary",
        )}
      >
        {isUser ? <User className="size-4" aria-hidden /> : <Bot className="size-4" aria-hidden />}
      </span>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="ai-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
