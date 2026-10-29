// Checks the database rule from the build brief: no table is readable or
// writable from the browser. Tries every table with the publishable key (what
// a browser would have) and expects to be refused, then with the secret key
// (the server's) and expects to get in. Run with: npm run check:db
// Prints status codes only, never keys or rows.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publishableKey || !secretKey) {
  console.error("Missing Supabase environment variables (see .env.example)");
  process.exit(1);
}

const tables = ["onboarding_sessions", "people", "ai_calls"];
const headers = (key) => ({
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
  Prefer: "return=minimal",
});

let failures = 0;
const check = (name, passed, status) => {
  console.log(`${passed ? "pass" : "FAIL"}  ${name} (HTTP ${status})`);
  if (!passed) failures += 1;
};

for (const table of tables) {
  const endpoint = `${url}/rest/v1/${table}`;

  const browserRead = await fetch(`${endpoint}?select=*&limit=1`, {
    headers: headers(publishableKey),
  });
  check(`browser key can't read ${table}`, !browserRead.ok, browserRead.status);

  // An empty row: refused before any insert is attempted
  const browserWrite = await fetch(endpoint, {
    method: "POST",
    headers: headers(publishableKey),
    body: JSON.stringify({}),
  });
  check(`browser key can't write ${table}`, !browserWrite.ok, browserWrite.status);

  const serverRead = await fetch(`${endpoint}?select=*&limit=1`, {
    headers: headers(secretKey),
  });
  check(`secret key can read ${table}`, serverRead.ok, serverRead.status);
}

console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
