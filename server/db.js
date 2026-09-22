import "dotenv/config";
import pg from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from .env");
}

const url = new URL(process.env.DATABASE_URL);

export const pool = new pg.Pool({
  host: url.hostname,
  port: Number(url.port || 5432),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.slice(1)),
  ssl: {
    rejectUnauthorized: true,
    servername: url.hostname,
  },
  max: 3,
  connectionTimeoutMillis: 30000,
  idleTimeoutMillis: 10000,
  keepAlive: true,
});

pool.on("error", (error) => {
  console.error("Idle database connection error:", error.message);
});

export const query = (sql, args) => pool.query(sql, args);