import { createFileRoute } from "@tanstack/react-router";
import { demoResponse, type ToolId } from "@/lib/ai-fallback";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type Body = {
  tool?: ToolId;
  input?: string;
  messages?: ChatMessage[];
  options?: Record<string, string>;
};

const SYSTEM_PROMPTS: Record<ToolId, string> = {
  email:
    "You are WorkMate AI, a professional workplace writing assistant. Write a complete, polished, workplace-appropriate email. Always start with a bold '**Subject:**' line, then the greeting, body and sign-off. Keep it concise and ready to send. Use markdown.",
  meeting:
    "You are WorkMate AI, a meeting analyst. Analyse the supplied meeting notes or transcript and reply in markdown using EXACTLY these H2 sections in this order: '## Meeting Summary', '## Key Points', '## Decisions', '## Action Items', '## Deadlines'. Action items must be markdown checkboxes '- [ ] task — Owner: name' and include the responsible person when identifiable. If a section has no content, say 'None identified'.",
  tasks:
    "You are WorkMate AI, a productivity planner. From the user's tasks, deadlines and priorities, reply in markdown with these H2 sections: '## Daily Overview', '## Suggested Schedule' (a numbered, time-blocked plan with estimated durations), '## High Priority', '## Tips'. Prioritise by urgency and importance and keep it realistic.",
  research:
    "You are WorkMate AI, a research assistant. Reply in markdown with these H2 sections: '## Summary', '## Key Insights', '## Important Concepts', '## Key Findings', '## Recommendations'. Be accurate, structured and concise. State clearly when something is uncertain.",
  chat: "You are WorkMate AI, a friendly and highly capable workplace productivity assistant. Help with workplace questions, brainstorming, drafting and improving communication, organising tasks and productivity advice. Use markdown with short paragraphs, headings and bullet points where helpful. Be concise and practical.",
};

function buildMessages(body: Body): { messages: ChatMessage[]; tool: ToolId; input: string } {
  const tool: ToolId = body.tool ?? "chat";
  let system = SYSTEM_PROMPTS[tool];
  if (tool === "email" && body.options?.['tone']) {
    system += ` The email tone must be strictly ${body.options['tone']}.`;
  }
  if (body.options?.['length']) {
    system += ` Preferred response length: ${body.options['length']}.`;
  }
  if (body.options?.['extra']) {
    system += ` ${body.options['extra']}`;
  }

  if (tool === "chat" && Array.isArray(body.messages)) {
    const history = body.messages.filter((m) => m.role !== "system").slice(-20);
    return {
      messages: [{ role: "system", content: system }, ...history],
      tool,
      input: history[history.length - 1]?.content ?? "",
    };
  }

  const input = (body.input ?? "").toString();
  return {
    messages: [
      { role: "system", content: system },
      { role: "user", content: input },
    ],
    tool,
    input,
  };
}

function demoStream(text: string) {
  const encoder = new TextEncoder();
  const chunks = text.match(/[\s\S]{1,24}/g) ?? [text];
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const c of chunks) {
        controller.enqueue(encoder.encode(c));
        await new Promise((r) => setTimeout(r, 12));
      }
      controller.close();
    },
  });
}

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Invalid request body", { status: 400 });
        }

        const { messages, tool, input } = buildMessages(body);
        if (!messages.some((m) => m.role !== "system" && m.content.trim())) {
          return new Response("Please provide some input first.", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response(demoStream(demoResponse(tool, input)), {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        let upstream: Response;
        try {
          upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({
              model: "google/gemini-3.7-flash",
              messages,
              stream: true,
            }),
          });
        } catch {
          return new Response(demoStream(demoResponse(tool, input)), {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        if (upstream.status === 429) {
          return new Response(
            "The AI assistant is busy right now (rate limit reached). Please wait a moment and try again.",
            { status: 429 },
          );
        }
        if (upstream.status === 402) {
          return new Response(
            "AI credits for this workspace have run out. Please top up to continue using the AI features.",
            { status: 402 },
          );
        }
        if (!upstream.ok || !upstream.body) {
          return new Response(demoStream(demoResponse(tool, input)), {
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }

        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            try {
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                let idx: number;
                while ((idx = buffer.indexOf("\n")) !== -1) {
                  const line = buffer.slice(0, idx).trim();
                  buffer = buffer.slice(idx + 1);
                  if (!line.startsWith("data:")) continue;
                  const data = line.slice(5).trim();
                  if (!data || data === "[DONE]") continue;
                  try {
                    const json = JSON.parse(data);
                    const delta = json?.choices?.[0]?.delta?.content;
                    if (typeof delta === "string" && delta) {
                      controller.enqueue(encoder.encode(delta));
                    }
                  } catch {
                    /* ignore partial frames */
                  }
                }
              }
            } catch {
              /* stream ended unexpectedly */
            } finally {
              controller.close();
              reader.releaseLock();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
