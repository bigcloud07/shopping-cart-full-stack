import { createClient } from "@supabase/supabase-js";

export function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase 환경 변수가 필요합니다. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_ANON_KEY를 설정해주세요.",
    );
  }

  return createClient(supabaseUrl, supabaseKey);
}
