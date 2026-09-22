import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { randomBytes } from "node:crypto";
import { configPath } from "./config.js";
await mkdir(dirname(configPath), { recursive: true, mode: 0o700 });
try {
  await writeFile(
    configPath,
    JSON.stringify(
      {
        APP_URL: "http://localhost:5173",
        PORT: 3001,
        STUDIO_EMAILS: "yourstudio@gmail.com",
        GMAIL_USER: "yourstudio@gmail.com",
        GMAIL_APP_PASSWORD: "PASTE_GOOGLE_APP_PASSWORD",
        AUTH_SECRET: randomBytes(32).toString("hex"),
        MAX_UPLOAD_BYTES: 52428800,
      },
      null,
      2,
    ) + "\n",
    { flag: "wx", mode: 0o600 },
  );
  console.log(
    "Created .private/config.json. Edit your studio email and Gmail app password there.",
  );
} catch (error) {
  if (error.code === "EEXIST")
    console.log("Existing private configuration preserved.");
  else throw error;
}
