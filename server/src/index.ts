import { DB } from "./db/db.js";
import { createApp } from "./app.js";

const PORT = process.env.PORT ?? 3000;

const app = createApp(DB);
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
