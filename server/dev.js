import express from "express";
import { fileURLToPath } from "node:url";
import app from "./app.js";
import { config } from "./config.js";
if (!config.AUTH_SECRET || config.AUTH_SECRET.length < 32)
  throw new Error("Run npm run setup, then edit .private/config.json");
if (process.argv.includes("--production")) {
  const dist = fileURLToPath(new URL("../dist/", import.meta.url));
  app.use(express.static(dist));
  app.get("/{*path}", (req, res) => res.sendFile(dist + "index.html"));
}
app.listen(config.PORT, () =>
  console.log("Studio listening on port " + config.PORT),
);
