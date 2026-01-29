import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type ServerClientMode = "service" | "anon";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
}

export function createServerClient(): { client: ReturnType<typeof createSupabaseClient>; mode: ServerClientMode } | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
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
