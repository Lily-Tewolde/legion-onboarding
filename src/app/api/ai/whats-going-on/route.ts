import { NextResponse } from "next/server";
import { z } from "zod";
import { CONCERN_LABELS } from "@/data";
import { understand } from "@/lib/ai/whats-going-on";
import { checkMessage } from "@/lib/crisis/check";
import { runWhatsGoingOnStep } from "@/lib/whats-going-on/step";
import { checkLimits, recordAiCall } from "@/server/ai-calls";
import { readVisitorId } from "@/server/visitor";

// POST /api/ai/whats-going-on: one submit of screen 2. The patient's text is
// used for this answer only and never stored or logged. Patient text is
// limited to 2,000 characters per answer (build brief, section 4)

const PatientText = z.string().max(2000);

const Body = z
  .object({
    text: PatientText,
    chips: z.array(z.enum(CONCERN_LABELS)).max(10),
    clarification: z.object({ question: z.string().max(300), answer: PatientText }).optional(),
    afterSafe: z.boolean().optional(),
  })
  .strict();

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const response = await runWhatsGoingOnStep(parsed.data, {
    checkMessage: (text) => checkMessage(text),
    understand,
    checkLimits: () => checkLimits(visitorId),
    record: (route, cost) => recordAiCall(visitorId, route, cost),
  });

  if (response.result === "fallback") console.error(`whats-going-on fell back: ${response.reason}`);
  return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
}
