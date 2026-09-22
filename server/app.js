import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import {
  randomUUID,
  randomBytes,
  randomInt,
  createHmac,
  createHash,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";
import { query } from "./db.js";
import { storage, mail } from "./services.js";
import { accessFor } from "./permissions.js";
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
  app.disable("x-powered-by");
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
          frameAncestors: ["'none'"],
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
  const audit=async(req,pid,action,subject=null)=>db('INSERT INTO studio.audit(project_id,actor,action,subject) VALUES($1,$2,$3,$4)',[pid,req.user.email,action,subject]);
  async function identity(address){const administrator=admins().includes(address);const staff=administrator||!!await one("SELECT 1 FROM studio.members WHERE email=$1 AND role IN ('manager','editor') AND approval='approved' LIMIT 1",[address]);return {email:address,studio:staff,administrator};}
  async function auth(req, res, next) {
    const s = req.cookies.studio_session;
    const user =
      s &&
      (await one(
        "UPDATE studio.sessions SET last_seen=now() WHERE token=$1 AND expires>now() AND last_seen>now()-interval '2 hours' RETURNING email",
        [hash(s)],
      ));
    if (!user) fail(401, "Please sign in");
    req.user = await identity(user.email);
    next();
  }
  function studio(req, res, next) {
    if (!req.user.administrator) fail(403, "Studio administrator access required");
    next();
  }
  async function project(req,permission) {
    const id=uuid.parse(req.params.id);
    const p=await one('SELECT * FROM studio.projects WHERE id=$1',[id]);
    const member=await one('SELECT * FROM studio.members WHERE project_id=$1 AND email=$2',[id,req.user.email]);
    if(!p||(!req.user.administrator&&!member))fail(404,'Project not found');
    const access=accessFor(req.user,member);
    if(permission&&!access.permissions[permission])fail(403,'Your project permission does not allow this action');
    return {...p,access};
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
    if (!valid || !timingSafeEqual(Buffer.from(valid.hash,"hex"),Buffer.from(codeHash(address,code),"hex")))
      fail(400, "Invalid or expired code");
    const used = await one(
      "DELETE FROM studio.codes WHERE email=$1 AND hash=$2 RETURNING email",
      [address, valid.hash],
    );
    if (!used) fail(400, "Code already used");
    await db('INSERT INTO studio.users(email,verified_at) VALUES($1,now()) ON CONFLICT(email) DO UPDATE SET verified_at=now()',[address]);
    await db('DELETE FROM studio.sessions WHERE token=$1',[hash(req.cookies.studio_session||'')]);
    const token = randomBytes(32).toString("hex");
    await db(
      `INSERT INTO studio.sessions(token,email,expires) VALUES($1,$2,now()+interval '1 day')`,
      [hash(token), address],
    );
    res
      .cookie("studio_session", token, {
        httpOnly: true,
        secure: origin.startsWith("https:"),
        sameSite: "lax",
        maxAge: 86400000,
        path: "/",
      })
      .json(await identity(address));
  });
  app.post("/api/auth/logout", async (req, res) => {
    await db("DELETE FROM studio.sessions WHERE token=$1", [
      hash(req.cookies.studio_session || ""),
    ]);
    res.clearCookie("studio_session", { path: "/" }).json({ ok: true });
  });
  app.post('/api/auth/logout-all',auth,async(req,res)=>{await db('DELETE FROM studio.sessions WHERE email=$1',[req.user.email]);res.clearCookie('studio_session',{path:'/'}).json({ok:true});});
  app.get("/api/me", auth, (req, res) => res.json(req.user));
  app.get("/api/public/settings", async (req, res) =>
    res.json(
      Object.fromEntries(
        (await rows("SELECT * FROM studio.settings WHERE key='logo_url'")).map((r) => [
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
  app.get('/api/projects',auth,async(req,res)=>{
    const projects=await rows(req.user.administrator?'SELECT * FROM studio.projects ORDER BY created_at DESC':"SELECT p.*,m.role,m.approval FROM studio.projects p JOIN studio.members m ON p.id=m.project_id WHERE m.email=$1 ORDER BY created_at DESC",req.user.administrator?[]:[req.user.email]);
    res.json(projects.map(p=>{const access=accessFor(req.user,p);return {id:p.id,title:p.title,category:p.category,status:p.status,created_at:p.created_at,public_consent:p.public_consent,...(access.permissions.price?{price:p.price,currency:p.currency}:{}),access};}));
  });
  app.post("/api/projects", auth, studio, async (req, res) => {
    const p = projectSchema.parse(req.body),
      id = randomUUID();
    await db(
      `WITH created AS (INSERT INTO studio.projects(id,title,description,owner_email,category,price,currency) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,owner_email) INSERT INTO studio.members(project_id,email,role,approval,approved_by,approved_at) SELECT id,owner_email,'owner','approved',$8,now() FROM created`,
      [
        id,
        p.title,
        p.description,
        p.owner_email,
        p.category,
        p.price,
        p.currency,
        req.user.email,
      ],
    );
    await audit(req,id,"project.created",p.owner_email);
    res.status(201).json({ id });
  });
  app.get('/api/projects/:id',auth,async(req,res)=>{
    const p=await project(req);const permissions=p.access.permissions;
    const members=await rows('SELECT m.email,m.role,m.approval,m.approved_by,m.approved_at,u.verified_at FROM studio.members m LEFT JOIN studio.users u ON u.email=m.email WHERE m.project_id=$1 ORDER BY m.role,m.email',[p.id]);
    const visible=permissions.approve||permissions.recipients?members:members.filter(m=>m.email===req.user.email);
    const media=permissions.files?await rows('SELECT id,name,mime,bytes,caption,featured,created_at FROM studio.media WHERE project_id=$1 AND uploaded ORDER BY created_at DESC',[p.id]):[];
    res.json({id:p.id,title:p.title,category:p.category,status:p.status,created_at:p.created_at,registered:p.registered,public_consent:p.public_consent,access:p.access,
      ...(permissions.files?{description:p.description}:{}),...(permissions.price?{price:p.price,currency:p.currency}:{}),
      ...(permissions.recipients||permissions.approve?{owner_email:p.owner_email}:{}),
      members:visible.map(m=>m.email),member_access:visible,media:media.map(m=>({...m,url:`/api/projects/${p.id}/media/${m.id}/file`}))});
  });
  app.patch("/api/projects/:id", auth, async (req, res) => {
    const old = await project(req,"edit");
    const p = projectSchema.omit({ owner_email: true }).parse(req.body);
    await db(
      "UPDATE studio.projects SET title=$2,description=$3,category=$4,price=$5,currency=$6 WHERE id=$1",
      [old.id, p.title, p.description, p.category, p.price, p.currency],
    );
    await audit(req,old.id,"project.updated");
    res.json({ ok: true });
  });
  app.put('/api/projects/:id/members',auth,async(req,res)=>{
    const p=await project(req,'recipients');
    const addresses=z.array(email).min(2).max(3).parse(req.body.emails);
    if(new Set(addresses).size!==addresses.length)fail(400,'Use a different email address for each recipient.');
    if(!addresses.includes(p.owner_email))fail(400,'Keep the owner email in the recipient list.');
    if(addresses.some(a=>admins().includes(a)&&a!==p.owner_email))fail(400,'Studio administrators cannot be added as customer recipients.');
    if(await one("SELECT 1 FROM studio.members WHERE project_id=$1 AND email=ANY($2::text[]) AND role IN ('manager','editor')",[p.id,addresses]))fail(400,'A staff email cannot also be a customer recipient.');
    await db('SELECT studio.request_recipients($1,$2,$3)',[p.id,req.user.email,addresses]);res.json({message:'Recipients saved. New addresses are pending studio approval.'});
  });
  app.patch('/api/projects/:id/access',auth,async(req,res)=>{
    const p=await project(req,'approve');
    const change=z.object({email,approval:z.enum(['approved','rejected','revoked'])}).strict().parse(req.body);
    const target=await one('SELECT * FROM studio.members WHERE project_id=$1 AND email=$2',[p.id,change.email]);
    if(!target)fail(404,'Recipient not found');
    if(target.role!=='recipient'&&!req.user.administrator)fail(403,'Only an administrator may change owner or staff access');
    await db("WITH changed AS (UPDATE studio.members SET approval=$3,approved_by=$4,approved_at=now() WHERE project_id=$1 AND email=$2 RETURNING email) INSERT INTO studio.audit(project_id,actor,action,subject) SELECT $1,$4,'access.'||$3,email FROM changed",[p.id,change.email,change.approval,req.user.email]);
    res.json({ok:true});
  });
  app.put('/api/projects/:id/staff',auth,studio,async(req,res)=>{
    const p=await project(req,'staff');const change=z.object({email,role:z.enum(['manager','editor'])}).strict().parse(req.body);
    if(admins().includes(change.email))fail(400,'This email is already a studio administrator');
    const existing=await one('SELECT role FROM studio.members WHERE project_id=$1 AND email=$2',[p.id,change.email]);
    if(existing&&['owner','recipient'].includes(existing.role))fail(409,'A customer email cannot be promoted to staff here');
    await db("WITH changed AS (INSERT INTO studio.members(project_id,email,role,approval,approved_by,approved_at) VALUES($1,$2,$3,'approved',$4,now()) ON CONFLICT(project_id,email) DO UPDATE SET role=$3,approval='approved',approved_by=$4,approved_at=now() RETURNING email) INSERT INTO studio.audit(project_id,actor,action,subject) SELECT $1,$4,'staff.assigned',email FROM changed",[p.id,change.email,change.role,req.user.email]);res.json({ok:true});
  });
  app.get('/api/projects/:id/audit',auth,async(req,res)=>{const p=await project(req,'audit');res.json(await rows('SELECT actor,action,subject,created_at FROM studio.audit WHERE project_id=$1 ORDER BY id DESC LIMIT 100',[p.id]));});
  app.put("/api/projects/:id/privacy", auth, async (req, res) => {
    const p = await project(req,"consent");
    if (req.user.email !== p.owner_email)
      fail(403, "Only the customer owner can change publication consent");
    const consent = z.boolean().parse(req.body.public_consent);
    await db(
      "UPDATE studio.projects SET public_consent=$2,consent_by=$3,consent_at=now() WHERE id=$1",
      [p.id, consent, req.user.email],
    );
    await audit(req,p.id,"consent."+(consent?"granted":"withdrawn"));
    res.json({ ok: true });
  });
  app.post("/api/projects/:id/invite", auth, async (req, res) => {
    const p = await project(req,"invite");
    await rate(`invite:${p.id}`, 5);
    await send(
      p.owner_email,
      "Your Hoe studio project invitation",
      `The studio has created your project: ${p.title}. Sign in with this email and register 2–3 permitted email addresses here: ${origin}/projects/${p.id}`,
    );
    res.json({ ok: true });
  });
  app.post("/api/projects/:id/ready", auth, async (req, res) => {
    const p = await project(req,"ready");
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
      "SELECT email FROM studio.members WHERE project_id=$1 AND approval='approved' AND role IN ('owner','recipient')",
      [p.id],
    );
    await audit(req,p.id,"project.marked-ready");
    let failed = 0;
    for (const { email: address } of recipients) {
      const claim=await one("INSERT INTO studio.deliveries(project_id,email,sending_at) VALUES($1,$2,now()) ON CONFLICT(project_id,email) DO UPDATE SET sending_at=now() WHERE studio.deliveries.sent_at IS NULL AND (studio.deliveries.sending_at IS NULL OR studio.deliveries.sending_at<now()-interval '5 minutes') RETURNING email",[p.id,address]);
      if(!claim)continue;
      try {
        await send(
          address,
          "Your photos and videos are ready",
          `Your project, ${p.title}, is ready. Sign in with this email to view and download your files: ${origin}/projects/${p.id}`,
          `ready-${p.id}-${hash(address).slice(0, 24)}`,
        );
        await db(
          `INSERT INTO studio.deliveries(project_id,email,sent_at) VALUES($1,$2,now()) ON CONFLICT(project_id,email) DO UPDATE SET sent_at=now(),error=NULL,sending_at=NULL`,
          [p.id, address],
        );
      } catch {
        failed++;
        await db(
          `INSERT INTO studio.deliveries(project_id,email,error) VALUES($1,$2,'Delivery failed; retry') ON CONFLICT(project_id,email) DO UPDATE SET error='Delivery failed; retry',sending_at=NULL`,
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
  app.post("/api/projects/:id/uploads", auth, async (req, res) => {
    const p = await project(req,"upload");
    await rate(`upload:${req.user.email}`, 100);
    const m = z
      .object({
        name: text.refine(v=>!/[\\/:]/.test(v)&&![...v].some(c=>c.charCodeAt(0)<32||c.charCodeAt(0)===127),"Invalid filename"),
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
    await audit(req,p.id,"upload.created",m.name);
    res.json({ id, uploadUrl: `/api/projects/${p.id}/media/${id}/content` });
  });
  app.put(
    "/api/projects/:id/media/:media/content",
    auth,
    async (req, res) => {
      const p = await project(req,"upload");
      const m = await one(
        "SELECT * FROM studio.media WHERE project_id=$1 AND id=$2",
        [p.id, uuid.parse(req.params.media)],
      );
      if (!m) fail(404, "Upload not found");
      if (m.uploaded) fail(409, "File already uploaded");
      if (req.headers["content-type"]?.split(";")[0] !== m.mime)
        fail(400, "File type does not match upload");
      const claimed=await one("UPDATE studio.media SET upload_started=now() WHERE id=$1 AND NOT uploaded AND (upload_started IS NULL OR upload_started<now()-interval '1 hour') RETURNING id",[m.id]);
      if(!claimed)fail(409,'Upload already in progress');
      try { await files.write(
        m.path,
        req,
        Number(m.bytes),
        Number(env.MAX_UPLOAD_BYTES || 52428800),
        m.mime,
      ); } catch(error){await db("UPDATE studio.media SET upload_started=NULL WHERE id=$1",[m.id]);throw error;}
      try {
        await project(req,"upload");
        await db("WITH changed AS (UPDATE studio.media SET uploaded=true WHERE id=$1 RETURNING project_id,name) INSERT INTO studio.audit(project_id,actor,action,subject) SELECT project_id,$2,'upload.completed',name FROM changed",[m.id,req.user.email]);
      } catch (error) {
        await files.remove(m.path);
        throw error;
      }
      res.json({ ok: true });
    },
  );
  app.get("/api/projects/:id/media/:media/file", auth, async (req, res) => {
    const p = await project(req,"files");
    const m = await one(
      "SELECT path,name,mime FROM studio.media WHERE id=$1 AND project_id=$2 AND uploaded",
      [uuid.parse(req.params.media), p.id],
    );
    if (!m) fail(404, "Media not found");
    if(req.query.download=== "1")await audit(req,p.id,"media.download",req.params.media);
    await files.serve(req, res, m, req.query.download === "1");
  });
  app.patch(
    "/api/projects/:id/media/:media",
    auth,
    async (req, res) => {
      const p = await project(req,"caption");
      const m = z
        .object({ caption: z.string().max(2000), featured: z.boolean().optional() })
        .parse(req.body);
      const current=await one('SELECT featured FROM studio.media WHERE id=$1 AND project_id=$2',[uuid.parse(req.params.media),p.id]);
      if(!current)fail(404,'Media not found');
      if(m.featured!==undefined&&m.featured!==current.featured&&!p.access.permissions.feature)fail(403,'Portfolio selection requires a project manager');
      const changed = await one(
        "UPDATE studio.media SET caption=$3,featured=$4 WHERE id=$1 AND project_id=$2 RETURNING id",
        [uuid.parse(req.params.media), p.id, m.caption, m.featured ?? current.featured],
      );
      if (!changed) fail(404, "Media not found");
      await audit(req,p.id,"media.updated",req.params.media);
      res.json({ ok: true });
    },
  );
  app.delete(
    "/api/projects/:id/media/:media",
    auth,
    async (req, res) => {
      const p = await project(req,"delete");
      const m = await one(
        "SELECT path FROM studio.media WHERE id=$1 AND project_id=$2",
        [uuid.parse(req.params.media), p.id],
      );
      if (!m) fail(404, "Media not found");
      await audit(req,p.id,"media.delete-requested",req.params.media);
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
          ? (err instanceof z.ZodError?err.issues.map(i=>`${i.path.join(".")}: ${i.message}`).join("; "):err.message)
          : status >= 500
            ? "Service unavailable. Check server configuration and try again."
            : err.message,
    });
  });
  return app;
}
export default createApp();
