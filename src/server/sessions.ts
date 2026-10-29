import "server-only";
import { supabase } from "./supabase";

// Progress for one visitor on one device, keyed by the anonymous visitor
// cookie. Never holds free text: every field is an id, a fixed value or a time

export type PayMethod = "insurance" | "self_pay";
export type FitResult = "eligible" | "screened_out" | "crisis";
export type ScreenOutReason =
  | "under_18"
  | "not_in_texas"
  | "medicaid_medicare"
  | "hospital_stay";
export type VisitOutcome = "completed" | "no_show";

export type OnboardingSession = {
  id: string;
  anon_id: string;
  person_id: string | null;
  current_screen: string;
  pay_method: PayMethod | null;
  plan_id: string | null;
  fit_result: FitResult | null;
  screen_out_reason: ScreenOutReason | null;
  concern_labels: string[] | null;
  provider_id: string | null;
  slot_start: string | null;
  booked_at: string | null;
  visit_outcome: VisitOutcome | null;
  intake_done: boolean;
  created_at: string;
  updated_at: string;
};

export type SessionPatch = Partial<
  Omit<OnboardingSession, "id" | "anon_id" | "created_at" | "updated_at">
>;

const TABLE = "onboarding_sessions";

export async function getSession(
  anonId: string,
): Promise<OnboardingSession | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("anon_id", anonId)
    .maybeSingle<OnboardingSession>();
  if (error) throw new Error(`Couldn't read the session: ${error.message}`);
  return data;
}

// Safe to call more than once: a second call returns the existing row
export async function getOrCreateSession(
  anonId: string,
): Promise<OnboardingSession> {
  const { error } = await supabase
    .from(TABLE)
    .upsert({ anon_id: anonId }, { onConflict: "anon_id", ignoreDuplicates: true });
  if (error) throw new Error(`Couldn't create the session: ${error.message}`);

  const session = await getSession(anonId);
  if (!session) throw new Error("The session was created but can't be read");
  return session;
}

export async function updateSession(
  anonId: string,
  patch: SessionPatch,
): Promise<OnboardingSession> {
  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("anon_id", anonId)
    .select("*")
    .single<OnboardingSession>();
  if (error) throw new Error(`Couldn't update the session: ${error.message}`);
  return data;
}
