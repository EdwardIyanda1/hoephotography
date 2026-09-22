import nodemailer from "nodemailer";
import { lookup } from "node:dns/promises";
import { mkdir, stat, unlink, link } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { resolve, dirname } from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { config } from "./config.js";

const fail = (status, message) =>
  Object.assign(new Error(message), { status });

export function createStorage(root) {
  const absolute = (path) => {
    if (!/^[a-f0-9-]{36}\/[a-f0-9-]{36}$/.test(path)) {
      throw fail(400, "Invalid file path");
    }

    return resolve(root, path);
  };

  return {
    async write(path, source, expected, max) {
      const target = absolute(path);
      const temp = `${target}.${randomUUID()}.part`;

      await mkdir(dirname(target), {
        recursive: true,
        mode: 0o700,
      });

      let bytes = 0;

      try {
        await pipeline(
          source,
          new Transform({
            transform(chunk, encoding, callback) {
              bytes += chunk.length;

              if (bytes > max || bytes > expected) {
                callback(fail(413, "File exceeds upload size"));
                return;
              }

              callback(null, chunk);
            },
          }),
          createWriteStream(temp, {
            flags: "wx",
            mode: 0o600,
          }),
        );

        if (bytes !== expected) {
          throw fail(400, "File size does not match upload");
        }

        // Create the final file without overwriting an existing file.
        await link(temp, target);
      } catch (error) {
        if (error.code === "EEXIST") {
          throw fail(409, "File already uploaded");
        }

        throw error;
      } finally {
        await unlink(temp).catch(() => {});
      }
    },

    async info(path) {
      const details = await stat(absolute(path));
      return { size: details.size };
    },

    async remove(path) {
      await unlink(absolute(path)).catch((error) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      });
    },

    async serve(req, res, media, download = false) {
      const path = absolute(media.path);

      try {
        await stat(path);
      } catch (error) {
        if (error.code === "ENOENT") {
          throw fail(404, "File is missing from storage");
        }

        throw error;
      }

      res.type(media.mime);
      res.set("Cache-Control", "private, no-store");

      if (download) {
        res.attachment(media.name);
      }

      await new Promise((resolve, reject) => {
        res.sendFile(
          path,
          {
            cacheControl: false,
            acceptRanges: true,
          },
          (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          },
        );
      });
    },
  };
}

export const storage = createStorage(config.STORAGE_DIR);

export function createMailer(
  settings,
  makeTransport = nodemailer.createTransport,
) {
  let transport;

  return async (to, subject, text, key) => {
    const password = (settings.GMAIL_APP_PASSWORD || "")
      .replace(/\s/g, "");

    if (!settings.GMAIL_USER || password.length !== 16) {
      throw new Error(
        "Configure Gmail address and a 16-character app password in .private/config.json",
      );
    }

    if (!transport) {
      // Use IPv4 because the current network cannot reach Gmail over IPv6.
      const { address } = await lookup("smtp.gmail.com", {
        family: 4,
      });

      transport = makeTransport({
        host: address,
        port: 465,
        secure: true,

        auth: {
          user: settings.GMAIL_USER,
          pass: password,
        },

        // Verify Gmail's certificate even though we connect using an IP.
        tls: {
          servername: "smtp.gmail.com",
          rejectUnauthorized: true,
        },

        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
      });
    }

    return transport.sendMail({
      from: {
        name: "Hoe Studio",
        address: settings.GMAIL_USER,
      },
      to,
      subject,
      text,
      ...(key
        ? {
            messageId: `<${createHash("sha256")
              .update(key)
              .digest("hex")}@hoe-studio.local>`,
          }
        : {}),
    });
  };
}

export const mail = createMailer(config);
