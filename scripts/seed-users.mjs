/**
 * Creates all DSC team members in Supabase Auth + inserts their profile rows.
 * Run once: node scripts/seed-users.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (never commit this key).
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local manually (no dotenv dependency needed)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const envVars = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()))
);

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_ROLE_KEY = envVars["SUPABASE_SERVICE_ROLE_KEY"];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

// Admin client — uses service role key, bypasses RLS
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  { email: "davis@kovil.ai",       name: "Davis",    password: "DSC@Davis2026!",    role: "admin"  },
  { email: "sahdev@kovil.ai",      name: "Sahdev",   password: "DSC@Sahdev2026!",   role: "member" },
  { email: "vivek@dataskate.ai",   name: "Vivek",    password: "DSC@Vivek2026!",    role: "member" },
  { email: "kailash@dataskate.ai", name: "Kailash",  password: "DSC@Kailash2026!",  role: "member" },
  { email: "raghuram@dataskate.ai",name: "Raghuram", password: "DSC@Raghuram2026!", role: "member" },
];

async function run() {
  console.log("🚀  Seeding DSC team users...\n");

  for (const user of USERS) {
    // 1. Create auth user
    const { data: authData, error: authErr } =
      await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // skip confirmation email
      });

    if (authErr) {
      // If user already exists, fetch their id instead
      if (authErr.message.includes("already been registered")) {
        console.log(`⚠️   ${user.email} already exists in Auth — skipping auth step`);
      } else {
        console.error(`❌  Auth error for ${user.email}:`, authErr.message);
        continue;
      }
    } else {
      console.log(`✅  Auth user created: ${user.email}`);
    }

    // 2. Get the auth user id (whether just created or pre-existing)
    const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
    const authUser = authUsers.find((u) => u.email === user.email);
    if (!authUser) {
      console.error(`❌  Could not find auth user for ${user.email}`);
      continue;
    }

    // 3. Upsert profile row in public.users
    const { error: profileErr } = await supabase.from("users").upsert(
      {
        id: authUser.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: true,
      },
      { onConflict: "id" }
    );

    if (profileErr) {
      console.error(`❌  Profile error for ${user.email}:`, profileErr.message);
    } else {
      console.log(`   Profile row upserted: ${user.name} (${user.role})`);
    }
  }

  console.log("\n✅  Done. Credentials summary:\n");
  console.log("  Email                       Password");
  console.log("  ──────────────────────────  ────────────────────");
  USERS.forEach((u) =>
    console.log(`  ${u.email.padEnd(28)}  ${u.password}`)
  );
  console.log("\n⚠️   Share passwords securely (not over email/Slack in plaintext).");
}

run();
