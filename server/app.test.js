import test from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import request from "supertest";
import { createApp } from "./app.js";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createStorage } from "./services.js";
const origin = "http://localhost:5173";
test("private project lifecycle, verified recipients, publication consent and delivery retries", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "hoe-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const db = new PGlite();
  await db.exec(
    await readFile(new URL("./schema.sql", import.meta.url), "utf8"),
  );
  const sent = [];
  let failRecipient = false;
  const app = createApp({
    db: (sql, args) => db.query(sql, args),
    env: {
      APP_URL: origin,
      STUDIO_EMAILS: "studio@example.com",
      AUTH_SECRET: "test-secret-not-used-in-production",
    },
    send: async (to, subject, text) => {
      if (
        failRecipient &&
        to === "second@example.com" &&
        subject.includes("ready")
      )
        throw Error("Provider unavailable");
      sent.push({ to, subject, text });
    },
    files: createStorage(directory),
  });
  const studio = request.agent(app),
    owner = request.agent(app),
    other = request.agent(app),
    second = request.agent(app);
  const post = (agent, url, body = {}) =>
    agent.post(url).set("Origin", origin).send(body);
  async function login(agent, email) {
    await post(agent, "/api/auth/request", { email }).expect(200);
    const code = sent
      .findLast((m) => m.to === email && m.subject.includes("sign-in"))
      .text.match(/\d{6}/)[0];
    await post(agent, "/api/auth/verify", { email, code }).expect(200);
    await post(agent, "/api/auth/verify", { email, code }).expect(400);
  }
  await login(studio, "studio@example.com");
  await studio.post("/api/projects").send({}).expect(403);
  const body = {
    title: "Wedding delivery",
    owner_email: "owner@example.com",
    category: "Wedding",
    price: 250000,
    currency: "NGN",
    description: "Photo and film",
  };
  const p = (await post(studio, "/api/projects", body).expect(201)).body;
  const base = `/api/projects/${p.id}`;
  await request(app).get(base).expect(401);
  await post(other, "/api/auth/request", {
    email: "stranger@example.com",
  }).expect(200);
  assert.equal(sent.filter((m) => m.to === "stranger@example.com").length, 0);
  await login(owner, "owner@example.com");
  await post(owner, "/api/projects", body).expect(403);
  await owner
    .put(`${base}/members`)
    .set("Origin", origin)
    .send({ emails: ["owner@example.com"] })
    .expect(400);
  await owner
    .put(`${base}/members`)
    .set("Origin", origin)
    .send({ emails: ["OWNER@example.com", "second@example.com"] })
    .expect(200);
  assert.deepEqual((await owner.get(base)).body.members, [
    "owner@example.com",
    "second@example.com",
  ]);
  await login(second, "second@example.com");
  await second.get(base).expect(200);
  await second
    .put(`${base}/privacy`)
    .set("Origin", origin)
    .send({ public_consent: true })
    .expect(403);
  await studio
    .put(`${base}/privacy`)
    .set("Origin", origin)
    .send({ public_consent: true })
    .expect(403);
  const p2 = (
    await post(studio, "/api/projects", {
      ...body,
      title: "Someone else",
      owner_email: "someone@example.com",
    })
  ).body;
  await owner.get(`/api/projects/${p2.id}`).expect(404);
  assert.equal((await owner.get("/api/projects")).body.length, 1);
  const upload = (
    await post(studio, `${base}/uploads`, {
      name: "photo.jpg",
      mime: "image/jpeg",
      bytes: 200,
    }).expect(200)
  ).body;
  await owner
    .put(upload.uploadUrl)
    .set("Origin", origin)
    .set("Content-Type", "image/jpeg")
    .send(Buffer.alloc(200))
    .expect(403);
  await studio
    .put(upload.uploadUrl)
    .set("Origin", origin)
    .set("Content-Type", "image/jpeg")
    .send(Buffer.alloc(200))
    .expect(200);
  await studio
    .put(upload.uploadUrl)
    .set("Origin", origin)
    .set("Content-Type", "image/jpeg")
    .send(Buffer.alloc(200))
    .expect(409);
  const partial = await owner
    .get(`${base}/media/${upload.id}/file`)
    .set("Range", "bytes=0-9")
    .expect(206);
  assert.equal(partial.body.length, 10);
  await owner
    .get(`${base}/media/${upload.id}/file?download=1`)
    .expect("Content-Disposition", /attachment.*photo.jpg/);
  await studio
    .patch(`${base}/media/${upload.id}`)
    .set("Origin", origin)
    .send({ caption: "Wedding portrait", featured: true })
    .expect(200);
  await post(studio, `${base}/uploads`, {
    name: "bad.html",
    mime: "text/html",
    bytes: 200,
  }).expect(400);
  await owner.get(`${base}/media/${upload.id}/file`).expect(200);
  await second
    .get(`/api/projects/${p2.id}/media/${upload.id}/file`)
    .expect(404);
  assert.equal((await request(app).get("/api/public/media")).body.length, 0);
  await owner
    .put(`${base}/privacy`)
    .set("Origin", origin)
    .send({ public_consent: true })
    .expect(200);
  assert.equal((await request(app).get("/api/public/media")).body.length, 0);
  failRecipient = true;
  const ready = await post(studio, `${base}/ready`).expect(200);
  assert.match(ready.body.message, /1 notification/);
  failRecipient = false;
  await post(studio, `${base}/ready`).expect(200);
  await post(studio, `${base}/ready`).expect(200);
  assert.equal(
    sent.filter(
      (m) => m.subject.includes("ready") && m.to === "owner@example.com",
    ).length,
    1,
  );
  assert.equal(
    sent.filter(
      (m) => m.subject.includes("ready") && m.to === "second@example.com",
    ).length,
    1,
  );
  const publicMedia = (await request(app).get("/api/public/media")).body;
  assert.equal(publicMedia.length, 1);
  assert.equal(publicMedia[0].owner_email, undefined);
  assert.equal(publicMedia[0].price, undefined);
  await request(app).get(`/api/public/media/${upload.id}/file`).expect(200);
  await owner
    .put(`${base}/privacy`)
    .set("Origin", origin)
    .send({ public_consent: false })
    .expect(200);
  await request(app).get(`/api/public/media/${upload.id}/file`).expect(404);
  await owner
    .put(`${base}/members`)
    .set("Origin", origin)
    .send({ emails: ["owner@example.com", "third@example.com"] })
    .expect(200);
  assert.deepEqual((await owner.get(base)).body.members, [
    "owner@example.com",
    "third@example.com",
  ]);
  await second.get(base).expect(404);
  await second.get(`${base}/media/${upload.id}/file`).expect(404);
  await post(owner, "/api/auth/logout").expect(200);
  await owner.get("/api/me").expect(401);
  await db.close();
});
test("codes expire, are limited to five guesses, and rate limits persist in database", async () => {
  const db = new PGlite();
  await db.exec(
    await readFile(new URL("./schema.sql", import.meta.url), "utf8"),
  );
  let code;
  const app = createApp({
    db: (sql, args) => db.query(sql, args),
    env: {
      APP_URL: origin,
      STUDIO_EMAILS: "studio@example.com",
      AUTH_SECRET: "test".repeat(10),
    },
    send: async (to, subject, text) => {
      code = text.match(/\d{6}/)[0];
    },
  });
  const post = (url, body) =>
    request(app).post(url).set("Origin", origin).send(body);
  await post("/api/auth/request", { email: "studio@example.com" }).expect(200);
  for (let i = 0; i < 5; i++)
    await post("/api/auth/verify", {
      email: "studio@example.com",
      code: "000000",
    }).expect(400);
  await post("/api/auth/verify", { email: "studio@example.com", code }).expect(
    400,
  );
  await post("/api/auth/request", { email: "studio@example.com" }).expect(200);
  await db.query("UPDATE studio.codes SET expires=now()-interval '1 second'");
  await post("/api/auth/verify", { email: "studio@example.com", code }).expect(
    400,
  );
  for (let i = 0; i < 3; i++)
    await post("/api/auth/request", { email: "studio@example.com" }).expect(
      200,
    );
  await post("/api/auth/request", { email: "studio@example.com" }).expect(429);
  await db.close();
});
