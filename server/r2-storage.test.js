import test from "node:test";
import assert from "node:assert/strict";
import { Readable, Writable } from "node:stream";
import { gunzipSync } from "node:zlib";
import { createR2Storage } from "./r2-storage.js";
const config = {
  R2_ACCOUNT_ID: "a".repeat(32),
  R2_BUCKET: "studio-private",
  R2_ACCESS_KEY_ID: "test",
  R2_SECRET_ACCESS_KEY: "test-secret",
};
const id =
  "12345678-1234-4234-8234-123456789abc/12345678-1234-4234-8234-123456789def";
test("R2 compresses before PUT and restores identical bytes on GET; validates size and signature", async () => {
  let stored,
    puts = 0;
  const fake = async (url, options) => {
    assert.match(url, /studio-private\/.*\.gz$/);
    assert.match(options.headers.authorization, /AWS4-HMAC-SHA256/);
    if (options.method === "PUT") {
      puts++;
      const chunks = [];
      for await (const c of options.body) chunks.push(c);
      stored = Buffer.concat(chunks);
      assert.equal(options.headers["if-none-match"], "*");
      return new Response(null, { status: 200 });
    }
    return new Response(stored);
  };
  const files = createR2Storage(config, {}, fake),
    path = files.pathFor(id, "image/jpeg");
  const original = Buffer.concat([
    Buffer.from([255, 216, 255]),
    Buffer.alloc(10000, 42),
  ]);
  await files.write(
    path,
    Readable.from([original]),
    original.length,
    20000,
    "image/jpeg",
  );
  assert.deepEqual(gunzipSync(stored), original);
  assert.ok(stored.length < original.length);
  const chunks = [],
    headers = {};
  const res = new Writable({
    write(c, e, cb) {
      chunks.push(c);
      cb();
    },
  });
  res.type = (m) => (headers.type = m);
  res.set = (k, v) => (headers[k] = v);
  res.attachment = (n) => (headers.name = n);
  await files.serve(
    {},
    res,
    { path, mime: "image/jpeg", name: "photo.jpg" },
    true,
  );
  assert.deepEqual(Buffer.concat(chunks), original);
  assert.equal(headers.name, "photo.jpg");
  assert.equal(headers["Cache-Control"], "private, no-store");
  await assert.rejects(
    files.write(path, Readable.from([original]), 5, 20000, "image/jpeg"),
    { status: 413 },
  );
  await assert.rejects(
    files.write(
      path,
      Readable.from([Buffer.alloc(30)]),
      30,
      20000,
      "image/jpeg",
    ),
    { status: 400 },
  );
  assert.equal(puts, 1);
  await assert.rejects(files.info("r2:../escape"), { status: 400 });
});
test("new images require R2 config; videos stay local", () => {
  const files = createR2Storage({}, {});
  assert.throws(() => files.pathFor(id, "image/jpeg"), { status: 503 });
  assert.equal(files.pathFor(id, "video/mp4"), id);
});
