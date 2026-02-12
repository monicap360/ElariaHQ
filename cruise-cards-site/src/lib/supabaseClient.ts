import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

function resolvePublicSupabaseUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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

export function getSupabaseClient() {
  if (cachedClient) return cachedClient;

  const supabaseUrl = resolvePublicSupabaseUrl();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch {
    return null;
  }
  return cachedClient;
}
