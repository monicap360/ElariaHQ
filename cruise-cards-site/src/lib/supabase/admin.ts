import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function resolveSupabaseUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!rawUrl) return null;

  const supabaseUrl = rawUrl.trim();
  if (!supabaseUrl) return null;

  try {
    const parsed = new URL(supabaseUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return supabaseUrl;
  } catch {
    return null;
  }
}

export function createAdminClient() {
  const supabaseUrl = resolveSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing or invalid Supabase environment variables: (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL) must be a valid HTTP/HTTPS URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    );
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}
