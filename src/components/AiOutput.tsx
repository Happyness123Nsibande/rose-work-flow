import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle, Check, Copy, Loader2, RefreshCw, Sparkle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  output: string;
  loading: boolean;
  error: string | null;
  emptyTitle: string;
  emptyHint: string;
  onRegenerate?: () => void;
  extraActions?: React.ReactNode;
};

export function AiOutput({
  output,
  loading,
  error,
  emptyTitle,
  emptyHint,
  onRegenerate,
  extraActions,
}: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copying isn't available in this browser");
    }
  };

  return (
    <section className="surface-card flex min-h-[320px] flex-col overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkle className="size-4 text-primary" aria-hidden />
          AI Generated Response
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {extraActions}
          {output && !loading && onRegenerate && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              <RefreshCw className="size-4" aria-hidden />
              Regenerate
            </Button>
          )}
          {output && !loading && (
            <Button size="sm" onClick={copy}>
              {copied ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              Copy
            </Button>
          )}
        </div>
      </header>

      <div className="flex-1 px-4 py-4 sm:px-5">
        {loading && !output && (
          <div className="space-y-3" aria-live="polite">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
              WorkMate AI is thinking…
            </p>
            {[90, 100, 75, 95, 60].map((w, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded-full bg-muted"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <div>
              <p className="font-medium text-foreground">We couldn't finish that request</p>
              <p className="mt-1 text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && !output && (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-primary-soft">
              <Sparkle className="size-5 text-primary" aria-hidden />
            </div>
            <p className="text-sm font-medium">{emptyTitle}</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">{emptyHint}</p>
          </div>
        )}

        {output && (
          <div className="ai-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{output}</ReactMarkdown>
            {loading && (
              <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-primary align-middle" />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
