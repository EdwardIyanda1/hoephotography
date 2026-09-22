import { pool } from "./db.js";
import { storage } from "./services.js";
try {
  await pool.query(
    "DELETE FROM studio.sessions WHERE expires<now(); DELETE FROM studio.codes WHERE expires<now(); DELETE FROM studio.limits WHERE expires<now();",
  );
  const pending = await pool.query(
    "SELECT id,path FROM studio.media WHERE NOT uploaded AND created_at<now()-interval '1 day'",
  );
  for (const media of pending.rows) {
    await storage.remove(media.path);
    await pool.query("DELETE FROM studio.media WHERE id=$1", [media.id]);
  }
  console.log("Expired authentication records removed.");
} finally {
  await pool.end();
}
