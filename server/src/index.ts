import { createApp, createServices } from "./app.js";
import { createSupabaseRepositories } from "./Repository/createRepositories.js";
import { createSupabaseClient } from "./config/supabaseClient.js";

const PORT = process.env.PORT ?? 3000;
const supabase = createSupabaseClient();
const services = createServices(createSupabaseRepositories(supabase));

const app = createApp(services);
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
