import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type ServerClientMode = "service" | "anon";

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

export function createClient() {
  const supabaseUrl = resolveSupabaseUrl();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export function createServerClient(): { client: ReturnType<typeof createSupabaseClient>; mode: ServerClientMode } | null {
  const supabaseUrl = resolveSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    return {
      client: createSupabaseClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } }),
      mode: "service",
    };
  }

  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    return {
      client: createSupabaseClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } }),
      mode: "anon",
    };
  }

  return null;
}
