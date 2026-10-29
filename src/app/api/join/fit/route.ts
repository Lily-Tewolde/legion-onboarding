import { NextResponse } from "next/server";
import { z } from "zod";
import { todayInCentral } from "@/lib/central-time";
import { currentScreenFor, outcomePath } from "@/lib/fit/flow";
import { earlyOutcome, evaluateFit, validateFacts } from "@/lib/fit/rules";
import { getOrCreateSession, updateSession } from "@/server/sessions";
import { readVisitorId } from "@/server/visitor";

// Screen 1's fit check. The rules decide here, on the server, on today's date
// in Central time, and the outcome is saved to the visitor's session. The
// date of birth is checked but never stored. "early" is the safety or
// hospital question answered "Yes"; "submit" is Continue

const YesNo = z.enum(["yes", "no"]);

const Body = z.object({
  mode: z.enum(["early", "submit"]),
  answers: z
    .object({
      dateOfBirth: z.string().max(20).optional(),
      inTexas: YesNo.optional(),
      payMethod: z.enum(["insurance", "self_pay"]).optional(),
      planId: z.string().max(40).optional(),
      safety: YesNo.optional(),
      hospital: YesNo.optional(),
      safeConfirmed: z.boolean().optional(),
    })
    .strict(),
});

export async function POST(request: Request) {
  const visitorId = await readVisitorId();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!visitorId || !parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { mode, answers } = parsed.data;
  const today = todayInCentral();
  const outcome =
    mode === "early"
      ? earlyOutcome(answers)
      : Object.keys(validateFacts(answers, today)).length === 0
        ? evaluateFit(answers, today)
        : null;
  if (!outcome) {
    return NextResponse.json({ error: "incomplete" }, { status: 400 });
  }

  try {
    await getOrCreateSession(visitorId);
    await updateSession(visitorId, {
      current_screen: currentScreenFor(outcome),
      fit_result: outcome.result,
      screen_out_reason: outcome.result === "screened_out" ? outcome.reason : null,
      pay_method: answers.payMethod ?? null,
      plan_id: answers.payMethod === "insurance" ? (answers.planId ?? null) : null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }

  return NextResponse.json({ outcome, path: outcomePath(outcome) });
}
