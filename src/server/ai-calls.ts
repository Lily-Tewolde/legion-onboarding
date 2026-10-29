import "server-only";
import { centralToUtc, todayInCentral } from "@/lib/central-time";
import { supabase } from "./supabase";

// The AI limits (build brief, section 4): 30 "What's going on?" calls per
// visitor per hour, and a daily spending cap for the whole demo, estimated
// from the token counts each call returns. The crisis flag never counts toward
// the hourly limit and is never blocked, but its cost counts toward the daily
// cap (Lily, PR 5). Each call is logged with its route and cost only, never text

const TABLE = "ai_calls";
const VISITOR_LIMIT_PER_HOUR = 30;
const DEFAULT_DAILY_CAP_USD = 10;

export type AiRoute = "whats_going_on" | "crisis_flag";

export type LimitCheck = { ok: true } | { ok: false; reason: "visitor_limit" | "daily_cap" };

export async function recordAiCall(anonId: string, route: AiRoute, costUsd: number): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .insert({ anon_id: anonId, route, cost_usd: Number(costUsd.toFixed(6)) });
  if (error) throw new Error(`Couldn't log the AI call: ${error.message}`);
}

export async function checkLimits(anonId: string, now: Date = new Date()): Promise<LimitCheck> {
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true })
    .eq("anon_id", anonId)
    .eq("route", "whats_going_on")
    .gte("created_at", hourAgo);
  if (countError) throw new Error(`Couldn't count AI calls: ${countError.message}`);
  if ((count ?? 0) >= VISITOR_LIMIT_PER_HOUR) return { ok: false, reason: "visitor_limit" };

  // Today, from midnight in Central time
  const startOfDay = centralToUtc(todayInCentral(now), "00:00").toISOString();
  const { data, error: costError } = await supabase
    .from(TABLE)
    .select("cost_usd")
    .gte("created_at", startOfDay);
  if (costError) throw new Error(`Couldn't add up today's AI cost: ${costError.message}`);
  const spent = data.reduce((sum, row) => sum + Number(row.cost_usd), 0);
  return spent >= dailyCapUsd() ? { ok: false, reason: "daily_cap" } : { ok: true };
}

function dailyCapUsd(): number {
  const configured = Number(process.env.AI_DAILY_CAP_USD);
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_DAILY_CAP_USD;
}
