import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
export const configPath = fileURLToPath(
  new URL("../.private/config.json", import.meta.url),
);
let local = {};
try {
  local = JSON.parse(readFileSync(configPath, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
export const config = {
  APP_URL: "http://localhost:5173",
  PORT: 3001,
  MAX_UPLOAD_BYTES: 52428800,
  STORAGE_DIR: fileURLToPath(new URL("../.private/uploads", import.meta.url)),
  ...local,
};
