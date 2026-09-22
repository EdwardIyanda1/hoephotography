import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import {
  randomUUID,
  randomBytes,
  randomInt,
  createHmac,
  createHash,
} from "node:crypto";
import { z } from "zod";
import { query } from "./db.js";
import { storage, mail } from "./services.js";
import { config } from "./config.js";
const email = z.string().trim().toLowerCase().email().max(254);
const uuid = z.string().uuid();
const text = z.string().trim().min(1).max(200);
const projectSchema = z.object({
  title: text,
  description: z.string().max(10000).default(""),
  owner_email: email,
  category: text,
  price: z.coerce.number().min(0).max(9999999999),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .default("NGN"),
});
const packageSchema = projectSchema
  .omit({ owner_email: true, title: true })
  .extend({ name: text, active: z.boolean().default(true) });
const hash = (value) => createHash("sha256").update(value).digest("hex");
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
export function createApp({
  db = query,
  files = storage,
  send = mail,
  env = config,
} = {}) {
  const app = express();
  const origin = env.APP_URL || "http://localhost:5173";
  const admins = () =>
    (env.STUDIO_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  const codeHash = (address, code) =>
    createHmac(
      "sha256",
      env.AUTH_SECRET?.length >= 32
        ? env.AUTH_SECRET
        : fail(
            503,
            "A random AUTH_SECRET of at least 32 characters is required",
          ),
    )
      .update(`${address}:${code}`)
      .digest("hex");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          imgSrc: ["'self'", "https:", "data:", "blob:"],
          mediaSrc: ["'self'", "blob:"],
        },
      },
    }),
    express.json({ limit: "100kb" }),
    cookieParser(),
  );
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin !== origin
    )
      return res.status(403).json({ error: "Invalid request origin" });
    next();
  });
  const rows = async (sql, args = []) => (await db(sql, args)).rows;
  const one = async (sql, args = []) => (await rows(sql, args))[0];
  async function rate(key, max) {
    const r = await one(
      `INSERT INTO studio.limits(key,count,expires) VALUES($1,1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN studio.limits.expires<now() THEN 1 ELSE studio.limits.count+1 END, expires=CASE WHEN studio.limits.expires<now() THEN now()+interval '15 minutes' ELSE studio.limits.expires END RETURNING count`,
      [hash(key)],
    );
    if (r.count > max) fail(429, "Too many attempts. Try again in 15 minutes.");
  }
  async function auth(req, res, next) {
    const s = req.cookies.studio_session;
    const user =
      s &&
      (await one(
        "SELECT email FROM studio.sessions WHERE token=$1 AND expires>now()",
        [hash(s)],
      ));
    if (!user) fail(401, "Please sign in");
    req.user = { email: user.email, studio: admins().includes(user.email) };
    next();
  }
  function studio(req, res, next) {
    if (!req.user.studio) fail(403, "Studio access required");
    next();
  }
  async function project(req) {
    const id = uuid.parse(req.params.id);
    const p = await one("SELECT * FROM studio.projects WHERE id=$1", [id]);
    if (
      !p ||
      (!req.user.studio &&
        !(await one(
          "SELECT 1 FROM studio.members WHERE project_id=$1 AND email=$2",
          [id, req.user.email],
        )))
    )
      fail(404, "Project not found");
    return p;
  }
  app.post("/api/auth/request", async (req, res) => {
    const address = email.parse(req.body.email);
    await rate(`login:${address}`, 5);
    await rate(`ip:${req.ip}`, 30);
    const allowed =
      admins().includes(address) ||
      (await one("SELECT 1 FROM studio.members WHERE email=$1 LIMIT 1", [
        address,
      ]));
    if (allowed) {
      const code = String(randomInt(100000, 1000000));
      await db(
        `INSERT INTO studio.codes(email,hash,expires,attempts) VALUES($1,$2,now()+interval '10 minutes',0) ON CONFLICT(email) DO UPDATE SET hash=$2,expires=now()+interval '10 minutes',attempts=0`,
        [address, codeHash(address, code)],
      );
      await send(
        address,
        "Your Hoe studio sign-in code",
        `Your code is ${code}. It expires in 10 minutes. Do not share it.`,
      );
    }
    res.json({
      message: "If this email has been invited, a sign-in code has been sent.",
    });
  });
  app.post("/api/auth/verify", async (req, res) => {
    const address = email.parse(req.body.email);
    const code = z
      .string()
      .regex(/^\d{6}$/)
      .parse(req.body.code);
    await rate(`verify:${address}`, 15);
    const valid = await one(
      `UPDATE studio.codes SET attempts=attempts+1 WHERE email=$1 AND expires>now() AND attempts<5 RETURNING hash`,
      [address],
    );
    if (!valid || valid.hash !== codeHash(address, code))
      fail(400, "Invalid or expired code");
    const used = await one(
      "DELETE FROM studio.codes WHERE email=$1 AND hash=$2 RETURNING email",
      [address, valid.hash],
    );
    if (!used) fail(400, "Code already used");
    const token = randomBytes(32).toString("hex");
    await db(
      `INSERT INTO studio.sessions(token,email,expires) VALUES($1,$2,now()+interval '7 days')`,
      [hash(token), address],
    );
    res
      .cookie("studio_session", token, {
        httpOnly: true,
        secure: origin.startsWith("https:"),
        sameSite: "lax",
        maxAge: 604800000,
        path: "/",
      })
      .json({ email: address, studio: admins().includes(address) });
  });
  app.post("/api/auth/logout", async (req, res) => {
    await db("DELETE FROM studio.sessions WHERE token=$1", [
      hash(req.cookies.studio_session || ""),
    ]);
    res.clearCookie("studio_session", { path: "/" }).json({ ok: true });
  });
  app.get("/api/me", auth, (req, res) => res.json(req.user));
  app.get("/api/public/settings", async (req, res) =>
    res.json(
      Object.fromEntries(
        (await rows("SELECT * FROM studio.settings")).map((r) => [
          r.key,
          r.value,
        ]),
      ),
    ),
  );
  app.put("/api/studio/settings", auth, studio, async (req, res) => {
    const logo = z
      .string()
      .url()
      .max(2000)
      .refine((s) => s.startsWith("https://"))
      .parse(req.body.logo_url);
    await db(
      `INSERT INTO studio.settings(key,value) VALUES('logo_url',$1) ON CONFLICT(key) DO UPDATE SET value=$1`,
      [logo],
    );
    res.json({ ok: true });
  });
  app.get("/api/public/packages", async (req, res) =>
    res.json(
      await rows(
        "SELECT * FROM studio.packages WHERE active=true ORDER BY price",
      ),
    ),
  );
  app.get("/api/studio/packages", auth, studio, async (req, res) =>
    res.json(await rows("SELECT * FROM studio.packages ORDER BY name")),
  );
  app.put("/api/studio/packages/:id", auth, studio, async (req, res) => {
    const p = packageSchema.parse(req.body);
    await db(
      "INSERT INTO studio.packages(id,name,description,category,price,currency,active) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO UPDATE SET name=$2,description=$3,category=$4,price=$5,currency=$6,active=$7",
      [
        uuid.parse(req.params.id),
        p.name,
        p.description,
        p.category,
        p.price,
        p.currency,
        p.active,
      ],
    );
    res.json({ ok: true });
  });
  app.get("/api/public/media", async (req, res) => {
    const result = await rows(
      `SELECT m.id,m.name,m.caption,m.mime,p.category FROM studio.media m JOIN studio.projects p ON p.id=m.project_id WHERE m.uploaded AND m.featured AND p.public_consent AND p.status='ready' ORDER BY m.created_at DESC LIMIT 120`,
    );
    res.json(
      result.map((m) => ({ ...m, url: `/api/public/media/${m.id}/file` })),
    );
  });
  app.get("/api/public/media/:id/file", async (req, res) => {
    const m = await one(
      `SELECT m.path,m.name,m.mime FROM studio.media m JOIN studio.projects p ON p.id=m.project_id WHERE m.id=$1 AND m.uploaded AND m.featured AND p.public_consent AND p.status='ready'`,
      [uuid.parse(req.params.id)],
    );
    if (!m) fail(404, "Media not found");
    await files.serve(req, res, m);
  });
  app.get("/api/projects", auth, async (req, res) =>
    res.json(
      await rows(
        req.user.studio
          ? "SELECT * FROM studio.projects ORDER BY created_at DESC"
          : `SELECT p.* FROM studio.projects p JOIN studio.members m ON p.id=m.project_id WHERE m.email=$1 ORDER BY created_at DESC`,
        req.user.studio ? [] : [req.user.email],
      ),
    ),
  );
  app.post("/api/projects", auth, studio, async (req, res) => {
    const p = projectSchema.parse(req.body),
      id = randomUUID();
    await db(
      `WITH created AS (INSERT INTO studio.projects(id,title,description,owner_email,category,price,currency) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,owner_email) INSERT INTO studio.members SELECT id,owner_email FROM created`,
      [
        id,
        p.title,
        p.description,
        p.owner_email,
        p.category,
        p.price,
        p.currency,
      ],
    );
    res.status(201).json({ id });
  });
  app.get("/api/projects/:id", auth, async (req, res) => {
    const p = await project(req);
    const media = await rows(
      "SELECT id,name,mime,bytes,caption,featured FROM studio.media WHERE project_id=$1 AND uploaded ORDER BY created_at",
      [p.id],
    );
    const members = await rows(
      "SELECT email FROM studio.members WHERE project_id=$1 ORDER BY email",
      [p.id],
    );
    res.json({
      ...p,
      members: members.map((m) => m.email),
      media: media.map((m) => ({
        ...m,
        url: `/api/projects/${p.id}/media/${m.id}/file`,
      })),
    });
  });
  app.patch("/api/projects/:id", auth, studio, async (req, res) => {
    const old = await project(req);
    const p = projectSchema.omit({ owner_email: true }).parse(req.body);
    await db(
      "UPDATE studio.projects SET title=$2,description=$3,category=$4,price=$5,currency=$6 WHERE id=$1",
      [old.id, p.title, p.description, p.category, p.price, p.currency],
    );
    res.json({ ok: true });
  });
  app.put("/api/projects/:id/members", auth, async (req, res) => {
    const p = await project(req);
    if (req.user.email !== p.owner_email)
      fail(403, "Only the customer owner can set recipient emails");
    const addresses = z.array(email).min(2).max(3).parse(req.body.emails);
    if (
      new Set(addresses).size !== addresses.length ||
      !addresses.includes(p.owner_email)
    )
      fail(400, "Use 2 or 3 different emails, including your owner email");
    await db(
      `WITH removed AS (DELETE FROM studio.members WHERE project_id=$1 AND NOT(email=ANY($2::text[]))), updated AS (UPDATE studio.projects SET registered=true WHERE id=$1) INSERT INTO studio.members(project_id,email) SELECT $1,unnest($2::text[]) ON CONFLICT DO NOTHING`,
      [p.id, addresses],
    );
    res.json({ ok: true });
  });
  app.put("/api/projects/:id/privacy", auth, async (req, res) => {
    const p = await project(req);
    if (req.user.email !== p.owner_email)
      fail(403, "Only the customer owner can change publication consent");
    const consent = z.boolean().parse(req.body.public_consent);
    await db(
      "UPDATE studio.projects SET public_consent=$2,consent_by=$3,consent_at=now() WHERE id=$1",
      [p.id, consent, req.user.email],
    );
    res.json({ ok: true });
  });
  app.post("/api/projects/:id/invite", auth, studio, async (req, res) => {
    const p = await project(req);
    await rate(`invite:${p.id}`, 5);
    await send(
      p.owner_email,
      "Your Hoe studio project invitation",
      `The studio has created your project: ${p.title}. Sign in with this email and register 2–3 permitted email addresses here: ${origin}/projects/${p.id}`,
    );
    res.json({ ok: true });
  });
  app.post("/api/projects/:id/ready", auth, studio, async (req, res) => {
    const p = await project(req);
    if (!p.registered)
      fail(409, "Customer must register their recipient emails first");
    if (
      !(await one(
        "SELECT 1 FROM studio.media WHERE project_id=$1 AND uploaded LIMIT 1",
        [p.id],
      ))
    )
      fail(409, "Upload at least one file first");
    await db(`UPDATE studio.projects SET status='ready' WHERE id=$1`, [p.id]);
    const recipients = await rows(
      "SELECT email FROM studio.members WHERE project_id=$1",
      [p.id],
    );
    let failed = 0;
    for (const { email: address } of recipients) {
      if (
        await one(
          "SELECT 1 FROM studio.deliveries WHERE project_id=$1 AND email=$2 AND sent_at IS NOT NULL",
          [p.id, address],
        )
      )
        continue;
      try {
        await send(
          address,
          "Your photos and videos are ready",
          `Your project, ${p.title}, is ready. Sign in with this email to view and download your files: ${origin}/projects/${p.id}`,
          `ready-${p.id}-${hash(address).slice(0, 24)}`,
        );
        await db(
          `INSERT INTO studio.deliveries(project_id,email,sent_at) VALUES($1,$2,now()) ON CONFLICT(project_id,email) DO UPDATE SET sent_at=now(),error=NULL`,
          [p.id, address],
        );
      } catch {
        failed++;
        await db(
          `INSERT INTO studio.deliveries(project_id,email,error) VALUES($1,$2,'Delivery failed; retry') ON CONFLICT(project_id,email) DO UPDATE SET error='Delivery failed; retry'`,
          [p.id, address],
        );
      }
    }
    res.json({
      message: failed
        ? `Project ready; ${failed} notification(s) failed. Press again to retry.`
        : "Project ready. All permitted recipients notified.",
    });
  });
  app.post("/api/projects/:id/uploads", auth, studio, async (req, res) => {
    const p = await project(req);
    const m = z
      .object({
        name: text,
        mime: z.enum([
          "image/jpeg",
          "image/png",
          "image/webp",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ]),
        bytes: z
          .number()
          .int()
          .positive()
          .max(Number(env.MAX_UPLOAD_BYTES || 52428800)),
      })
      .parse(req.body);
    const id = randomUUID(),
      path = `${p.id}/${id}`;
    await db(
      "INSERT INTO studio.media(id,project_id,path,name,mime,bytes) VALUES($1,$2,$3,$4,$5,$6)",
      [id, p.id, path, m.name, m.mime, m.bytes],
    );
    res.json({ id, uploadUrl: `/api/projects/${p.id}/media/${id}/content` });
  });
  app.put(
    "/api/projects/:id/media/:media/content",
    auth,
    studio,
    async (req, res) => {
      const p = await project(req);
      const m = await one(
        "SELECT * FROM studio.media WHERE project_id=$1 AND id=$2",
        [p.id, uuid.parse(req.params.media)],
      );
      if (!m) fail(404, "Upload not found");
      if (m.uploaded) fail(409, "File already uploaded");
      if (req.headers["content-type"]?.split(";")[0] !== m.mime)
        fail(400, "File type does not match upload");
      await files.write(
        m.path,
        req,
        Number(m.bytes),
        Number(env.MAX_UPLOAD_BYTES || 52428800),
      );
      try {
        await db("UPDATE studio.media SET uploaded=true WHERE id=$1", [m.id]);
      } catch (error) {
        await files.remove(m.path);
        throw error;
      }
      res.json({ ok: true });
    },
  );
  app.get("/api/projects/:id/media/:media/file", auth, async (req, res) => {
    const p = await project(req);
    const m = await one(
      "SELECT path,name,mime FROM studio.media WHERE id=$1 AND project_id=$2 AND uploaded",
      [uuid.parse(req.params.media), p.id],
    );
    if (!m) fail(404, "Media not found");
    await files.serve(req, res, m, req.query.download === "1");
  });
  app.patch(
    "/api/projects/:id/media/:media",
    auth,
    studio,
    async (req, res) => {
      const p = await project(req);
      const m = z
        .object({ caption: z.string().max(2000), featured: z.boolean() })
        .parse(req.body);
      const changed = await one(
        "UPDATE studio.media SET caption=$3,featured=$4 WHERE id=$1 AND project_id=$2 RETURNING id",
        [uuid.parse(req.params.media), p.id, m.caption, m.featured],
      );
      if (!changed) fail(404, "Media not found");
      res.json({ ok: true });
    },
  );
  app.delete(
    "/api/projects/:id/media/:media",
    auth,
    studio,
    async (req, res) => {
      const p = await project(req);
      const m = await one(
        "SELECT path FROM studio.media WHERE id=$1 AND project_id=$2",
        [uuid.parse(req.params.media), p.id],
      );
      if (!m) fail(404, "Media not found");
      await files.remove(m.path);
      await db("DELETE FROM studio.media WHERE id=$1", [req.params.media]);
      res.json({ ok: true });
    },
  );
  app.use("/api", (req, res) =>
    res.status(404).json({ error: "Endpoint not found" }),
  );
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    const status = err instanceof z.ZodError ? 400 : err.status || 500;
    if (status >= 500) console.error(err.message);
    res.status(status).json({
      error:
        status === 400
          ? "Check the submitted fields"
          : status >= 500
            ? "Service unavailable. Check server configuration and try again."
            : err.message,
    });
  });
  return app;
}
export default createApp();
