import { useCallback, useRef, useState } from "react";
import { getResponseLength, logActivity } from "@/lib/store";
import type { ToolId } from "@/lib/ai-fallback";

export type AiRequest = {
  tool: ToolId;
  input?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
  options?: Record<string, string>;
  activityLabel?: string;
  onChunk?: (full: string) => void;
};

export function useAi() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequest = useRef<AiRequest | null>(null);

  const run = useCallback(async (req: AiRequest) => {
    lastRequest.current = req;
    setLoading(true);
    setError(null);
    setOutput("");
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: req.tool,
          input: req.input,
          messages: req.messages,
          options: { length: getResponseLength(), ...(req.options ?? {}) },
        }),
      });

      if (!res.ok || !res.body) {
        const message = await res.text().catch(() => "");
        throw new Error(
          message || "We couldn't reach the AI assistant right now. Please try again.",
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setOutput(full);
        req.onChunk?.(full);
      }
      if (req.activityLabel) logActivity(req.tool, req.activityLabel);
      return full;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong while generating your response. Please try again.",
      );
      return "";
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerate = useCallback(() => {
    if (lastRequest.current) return run(lastRequest.current);
    return Promise.resolve("");
  }, [run]);

  const clear = useCallback(() => {
    setOutput("");
    setError(null);
    lastRequest.current = null;
  }, []);

  return { output, setOutput, loading, error, run, regenerate, clear, hasRun: !!lastRequest.current };
}
