import "server-only";
import { supabase } from "./supabase";

// The made-up person behind a session, from the checkout's details section.
// An email that's already used comes back as "email_taken" so the checkout
// can offer "Sign in and pick up where you left off"

export type Person = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  consented_at: string;
  created_at: string;
};

export type NewPerson = Omit<Person, "id" | "created_at">;

export type CreatePersonResult =
  | { status: "created"; person: Person }
  | { status: "email_taken" };

const TABLE = "people";
const UNIQUE_VIOLATION = "23505";

export async function createPerson(
  details: NewPerson,
): Promise<CreatePersonResult> {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...details, email: normaliseEmail(details.email) })
    .select("*")
    .single<Person>();

  if (error?.code === UNIQUE_VIOLATION) return { status: "email_taken" };
  if (error) throw new Error(`Couldn't save the details: ${error.message}`);
  return { status: "created", person: data };
}

export async function findPersonByEmail(email: string): Promise<Person | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("email", normaliseEmail(email))
    .maybeSingle<Person>();
  if (error) throw new Error(`Couldn't look up the email: ${error.message}`);
  return data;
}

const normaliseEmail = (email: string) => email.trim().toLowerCase();
