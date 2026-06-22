import { createClient, type WebSocketLikeConstructor } from "@supabase/supabase-js";
import WebSocket from "ws";

export function createSupabaseClient() {
  const supabaseUrl = normalizeSupabaseUrl(process.env.SUPABASE_URL);
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase 환경 변수가 필요합니다. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_ANON_KEY를 설정해주세요.",
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    realtime: {
      transport: WebSocket as unknown as WebSocketLikeConstructor,
    },
  });
}

function normalizeSupabaseUrl(supabaseUrl: string | undefined) {
  return supabaseUrl?.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}
