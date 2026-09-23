import { createHash, createHmac } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGzip, createGunzip } from "node:zlib";
import { matchesMedia } from "./file-signature.js";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const hmac = (key, value) => createHmac("sha256", key).update(value).digest();
const fail = (status, message) => Object.assign(new Error(message), { status });
const keyFor = (path) => {
  if (!/^r2:[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(path))
    throw fail(400, "Invalid R2 image path");
  return path.slice(3) + ".gz";
};
export function createR2Storage(settings, local, fetcher = fetch) {
  let active = 0;
  function configured() {
    if (
      !/^[a-f0-9]{32}$/i.test(settings.R2_ACCOUNT_ID || "") ||
      !/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(settings.R2_BUCKET || "") ||
      !settings.R2_ACCESS_KEY_ID ||
      !settings.R2_SECRET_ACCESS_KEY
    )
      throw fail(503, "Configure private R2 image storage on the server");
  }
  async function request(method, path, body, payloadHash = hash(""), length) {
    configured();
    const host = `${settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const uri = `/${settings.R2_BUCKET}/${keyFor(path)}`;
    const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""),
      day = date.slice(0, 8);
    const headers = {
      host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": date,
    };
    if (method === "PUT") headers["if-none-match"] = "*";
    const names = Object.keys(headers).sort();
    const canonical = [
      method,
      uri,
      "",
      names.map((k) => `${k}:${headers[k]}\n`).join(""),
      names.join(";"),
      payloadHash,
    ].join("\n");
    const scope = `${day}/auto/s3/aws4_request`;
    const signing = hmac(
      hmac(
        hmac(hmac(`AWS4${settings.R2_SECRET_ACCESS_KEY}`, day), "auto"),
        "s3",
      ),
      "aws4_request",
    );
    headers.authorization = `AWS4-HMAC-SHA256 Credential=${settings.R2_ACCESS_KEY_ID}/${scope}, SignedHeaders=${names.join(";")}, Signature=${createHmac(
      "sha256",
      signing,
    )
      .update(`AWS4-HMAC-SHA256\n${date}\n${scope}\n${hash(canonical)}`)
      .digest("hex")}`;
    if (length !== undefined) headers["content-length"] = String(length);
    const response = await fetcher(`https://${host}${uri}`, {
      method,
      headers,
      body,
      duplex: body ? "half" : undefined,
      signal: AbortSignal.timeout(120000),
      redirect: "error",
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw fail(
        response.status === 404 ? 404 : response.status === 412 ? 409 : 502,
        response.status === 404
          ? "Image missing from storage"
          : response.status === 412
            ? "Image already uploaded"
            : "Cloudflare storage request failed",
      );
    }
    return response;
  }
  return {
    pathFor(id, mime) {
      if (mime.startsWith("image/")) {
        configured();
        return `r2:${id}`;
      }
      return id;
    },
    async write(path, source, expected, max, mime) {
      if (!path.startsWith("r2:"))
        return local.write(path, source, expected, max, mime);
      keyFor(path);
      configured();
      if (!mime?.startsWith("image/"))
        throw fail(400, "R2 storage accepts images only");
      if (active >= 2)
        throw fail(503, "Image processing is busy. Try again shortly.");
      active++;
      let dir;
      try {
        dir = await mkdtemp(join(tmpdir(), "hoe-r2-"));
        const file = join(dir, "image.gz");
        let bytes = 0,
          header = Buffer.alloc(0);
        const digest = createHash("sha256");
        await pipeline(
          source,
          new Transform({
            transform(chunk, enc, cb) {
              bytes += chunk.length;
              if (header.length < 32)
                header = Buffer.concat([
                  header,
                  chunk.subarray(0, 32 - header.length),
                ]);
              cb(
                bytes > expected || bytes > max
                  ? fail(413, "Image exceeds upload size")
                  : null,
                chunk,
              );
            },
          }),
          createGzip({ level: 1 }),
          new Transform({
            transform(chunk, enc, cb) {
              digest.update(chunk);
              cb(null, chunk);
            },
          }),
          createWriteStream(file, { flags: "wx", mode: 0o600 }),
        );
        if (bytes !== expected)
          throw fail(400, "File size does not match upload");
        if (!matchesMedia(header, mime))
          throw fail(
            400,
            "File content does not match the selected media type",
          );
        const result = await request(
          "PUT",
          path,
          createReadStream(file),
          digest.digest("hex"),
          (await stat(file)).size,
        );
        await result.body?.cancel();
      } finally {
        active--;
        if (dir) await rm(dir, { recursive: true, force: true });
      }
    },
    async remove(path) {
      if (!path.startsWith("r2:")) return local.remove(path);
      const response = await request("DELETE", path);
      await response.body?.cancel();
    },
    async info(path) {
      if (!path.startsWith("r2:")) return local.info(path);
      const response = await request("HEAD", path);
      return { size: Number(response.headers.get("content-length")) };
    },
    async serve(req, res, media, download = false) {
      if (!media.path.startsWith("r2:"))
        return local.serve(req, res, media, download);
      const response = await request("GET", media.path);
      res.type(media.mime);
      res.set("Cache-Control", "private, no-store");
      res.set("X-Content-Type-Options", "nosniff");
      res.set("Accept-Ranges", "none");
      if (download) res.attachment(media.name);
      // Stored gzip is an internal format, not a Content-Encoding sent to the browser.
      // Restore the original bytes as a stream, without buffering the entire image.
      await pipeline(Readable.fromWeb(response.body), createGunzip(), res);
    },
  };
}
