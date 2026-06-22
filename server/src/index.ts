import "dotenv/config";
import { createApp, createServices, createServicesFromDb } from "./app.js";
import { createSupabaseRepositories } from "./Repository/createRepositories.js";
import { createSupabaseClient } from "./config/supabaseClient.js";
import { createInMemoryDb } from "./db/db.js";

const PORT = process.env.PORT ?? 3000;

const hasSupabaseConfig =
  process.env.SUPABASE_URL &&
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
const services = hasSupabaseConfig
  ? createServices(createSupabaseRepositories(createSupabaseClient()))
  : createServicesFromDb(createInMemoryDb());

if (!hasSupabaseConfig && process.env.NODE_ENV === "production") {
  throw new Error(
    "Supabase 환경 변수가 필요합니다. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_ANON_KEY를 설정해주세요.",
  );
}

if (!hasSupabaseConfig) {
  console.warn("Supabase 환경 변수가 없어 인메모리 DB로 서버를 시작합니다.");
}

const app = createApp(services);
app.listen(PORT);
