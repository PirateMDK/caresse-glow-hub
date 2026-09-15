// The site runs on the owner's own Supabase project. The hosting platform injects
// env vars pointing at a legacy project, so we pin the correct values for
// server-side code (which reads process.env at call time).
const OWN_SUPABASE = {
  SUPABASE_URL: "https://ekgncshjtcxpgexdomvj.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_2-sd0zhy_mZSdPuOyGdUwg_T3TFIrdJ",
  SUPABASE_PROJECT_ID: "ekgncshjtcxpgexdomvj",
} as const;

try {
  for (const [key, value] of Object.entries(OWN_SUPABASE)) {
    process.env[key] = value;
  }
} catch {
  // process.env is read-only in some runtimes; the Vite define fallback covers the client.
}

export {};
