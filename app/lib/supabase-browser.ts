import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseBrowserGlobal = typeof globalThis & {
  __jinheungSupabaseBrowserClient?: SupabaseClient;
};

const supabaseBrowserGlobal = globalThis as SupabaseBrowserGlobal;

export function getSupabaseBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Supabase 공개 연결 설정이 없습니다.");

  supabaseBrowserGlobal.__jinheungSupabaseBrowserClient ??= createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
  return supabaseBrowserGlobal.__jinheungSupabaseBrowserClient;
}
