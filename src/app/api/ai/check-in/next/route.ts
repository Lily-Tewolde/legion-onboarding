import { NextResponse } from "next/server";
import { z } from "zod";
import { nextQuestion } from "@/lib/ai/check-in";
import { MAX_TURNS } from "@/lib/check-in/stored";
import { runCheckInTurn } from "@/lib/check-in/step";
import { checkMessage } from "@/lib/crisis/check";
import { checkLimits, recordAiCall } from "@/server/ai-calls";
import { missingFor } from "@/server/booking";
import { getSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// POST /api/ai/check-in/next: one answer in the pre-visit check-in, and the
// next question. The answers are used for this call only and never stored or
// logged; they live in the patient's browser. Patient text is limited to
// 2,000 characters per answer (build brief, section 4)

const Turn = z
  .object({
    id: z.string().regex(/^m\d{1,2}$/),
    question: z.string().max(300),
    answer: z.string().max(2000),
    skipped: z.boolean(),
  })
  .strict();

const Body = z
  .object({ turns: z.array(Turn).min(1).max(MAX_TURNS), afterSafe: z.boolean().optional(), form: z.boolean().optional() })
  .strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  const session = await getSession(visitorId).catch(() => null);
  if (missingFor(session, "booked")) return NextResponse.json({ error: "not_ready" }, { status: 409 });

  const response = await runCheckInTurn(parsed.data, {
    checkMessage: (text) => checkMessage(text),
    nextQuestion,
    checkLimits: () => checkLimits(visitorId),
    record: (route, cost) => recordAiCall(visitorId, route, cost),
  });

  if (response.result === "fallback") console.error(`check-in fell back: ${response.reason}`);
  return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
}
