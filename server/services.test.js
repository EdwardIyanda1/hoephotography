import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { createStorage, createMailer } from "./services.js";
test("disk upload limits, cleanup, immutable files and path safety", async (t) => {
  const dir = await mkdtemp(join(tmpdir(), "hoe-storage-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const files = createStorage(dir);
  const project = "12345678-1234-1234-1234-123456789abc",
    path = project + "/12345678-1234-1234-1234-123456789def";
  await assert.rejects(
    files.write(path, Readable.from([Buffer.alloc(6)]), 5, 5),
    { status: 413 },
  );
  assert.deepEqual(await readdir(join(dir, project)), []);
  await assert.rejects(
    files.write(path, Readable.from([Buffer.alloc(2)]), 5, 5),
    { status: 400 },
  );
  await files.write(path, Readable.from([Buffer.alloc(5)]), 5, 5);
  assert.equal((await files.info(path)).size, 5);
  await assert.rejects(
    files.write(path, Readable.from([Buffer.alloc(5)]), 5, 5),
    { status: 409 },
  );
  await assert.rejects(files.info("../config.json"), { status: 400 });
  await files.remove(path);
  await files.remove(path);
});
test("Gmail SMTP uses TLS and normalized app password without calling Google", async () => {
  let options, message;
  const send = createMailer(
    {
      GMAIL_USER: "studio@gmail.com",
      GMAIL_APP_PASSWORD: "abcd efgh ijkl mnop",
    },
    (o) => {
      options = o;
      return {
        sendMail: async (m) => {
          message = m;
          return { accepted: [m.to] };
        },
      };
    },
    async () => ({address:"127.0.0.1"}),
  );
  await send("client@example.com", "Ready", "Open your project", "project-key");
  assert.equal(options.host, "127.0.0.1");
  assert.equal(options.secure, true);
  assert.equal(options.port, 465);
  assert.equal(options.auth.pass, "abcdefghijklmnop");
  assert.equal(message.from.address, "studio@gmail.com");
  assert.equal(message.to, "client@example.com");
  await assert.rejects(
    createMailer({
      GMAIL_USER: "studio@gmail.com",
      GMAIL_APP_PASSWORD: "short",
    })("a@example.com", "Test", "Test"),
    /16-character/,
  );
});
test('media signature rejects disguised content and cleans temporary data',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'hoe-signature-'));t.after(()=>rm(dir,{recursive:true,force:true}));
 const files=createStorage(dir),path='12345678-1234-4234-8234-123456789abc/12345678-1234-4234-8234-123456789def';
 const html=Buffer.from('<html>not an image</html>');
 await assert.rejects(files.write(path,Readable.from([html]),html.length,100,'image/jpeg'),{status:400});
 assert.deepEqual(await readdir(join(dir,path.split('/')[0])),[]);
});
