import { NextResponse } from "next/server";
import { z } from "zod";
import { MAX_TURNS } from "@/lib/check-in/stored";
import { summarize } from "@/lib/ai/check-in-summary";
import { runSummary } from "@/lib/check-in/step";
import { checkLimits, recordAiCall } from "@/server/ai-calls";
import { missingFor } from "@/server/booking";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// POST /api/ai/check-in/summary: the clinician summary, written once at the
// end of the check-in. The answers and the summary go back to the patient's
// browser and are never stored or logged here. Up to the AI check-in's
// questions plus the simple form's, if it switched part way

const Turn = z
  .object({
    id: z.string().regex(/^m\d{1,2}$/),
    question: z.string().max(300),
    answer: z.string().max(2000),
    skipped: z.boolean(),
  })
  .strict();

const Body = z.object({ turns: z.array(Turn).min(1).max(MAX_TURNS) }).strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const session = await getSession(visitorId).catch(() => null);
  if (missingFor(session, "booked")) return NextResponse.json({ error: "not_ready" }, { status: 409 });

  const response = await runSummary(parsed.data.turns, {
    summarize,
    checkLimits: () => checkLimits(visitorId),
    record: (route, cost) => recordAiCall(visitorId, route, cost),
  });

  if (response.result === "fallback") console.error(`check-in summary fell back: ${response.reason}`);
  return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
}
