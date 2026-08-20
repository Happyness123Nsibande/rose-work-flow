export type ToolId = "email" | "meeting" | "tasks" | "research" | "chat";

/**
 * Offline demo responses so every feature stays demonstrable when the AI
 * service is unavailable. Never used when a live response succeeds.
 */
export function demoResponse(tool: ToolId, input: string): string {
  const snippet = input.trim().slice(0, 120) || "your request";
  switch (tool) {
    case "email":
      return `**Subject:** Request regarding ${snippet}

Dear [Recipient],

I hope this message finds you well. I am writing regarding ${snippet}.

- I wanted to share the key context so you have the full picture.
- Please let me know if any additional detail would be helpful.
- I am happy to adjust timelines to suit the team's priorities.

Thank you for your time and support. I look forward to your response.

Kind regards,
[Your name]

*(Demo response — the AI service was unavailable, so a sample draft is shown.)*`;
    case "meeting":
      return `## Meeting Summary
The team reviewed progress, confirmed priorities and agreed next steps based on the notes provided.

## Key Points
- Current workstreams are broadly on track.
- One dependency needs follow-up before the next milestone.
- Communication cadence will stay weekly.

## Decisions
- Proceed with the current plan.
- Weekly check-in remains on Thursdays.

## Action Items
- [ ] Circulate updated notes — Owner: Project lead
- [ ] Confirm the outstanding dependency — Owner: Team member

## Deadlines
- Next check-in: end of week.

*(Demo response — the AI service was unavailable.)*`;
    case "tasks":
      return `## Daily Overview
A focused day: tackle high-impact work first, then batch smaller items.

## Suggested Schedule
1. **09:00 – 10:30 — High priority deep work** (90 min)
2. **10:30 – 11:00 — Email and messages** (30 min)
3. **11:00 – 12:30 — Second priority task** (90 min)
4. **13:30 – 15:00 — Collaboration and meetings**
5. **15:00 – 16:30 — Remaining tasks and wrap-up**

## High Priority
- Items with the nearest deadlines come first.

## Tips
- Protect one uninterrupted focus block.
- Review tomorrow's list before logging off.

*(Demo response — the AI service was unavailable.)*`;
    case "research":
      return `## Summary
An overview of ${snippet}, covering the core ideas and why they matter.

## Key Insights
- The topic has clear practical relevance for workplace teams.
- Several established approaches exist, each with trade-offs.

## Important Concepts
- **Concept 1** — the foundational idea.
- **Concept 2** — how it is applied in practice.

## Recommendations
1. Start with a small, measurable pilot.
2. Document findings and review after two weeks.

*(Demo response — the AI service was unavailable.)*`;
    default:
      return `Thanks for your message about ${snippet}. Here's how I'd approach it:

- Clarify the outcome you want.
- Break the work into two or three concrete steps.
- Decide who needs to be informed.

*(Demo response — the AI service was unavailable.)*`;
  }
}
