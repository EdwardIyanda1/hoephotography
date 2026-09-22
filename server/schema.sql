CREATE SCHEMA IF NOT EXISTS studio;
CREATE TABLE IF NOT EXISTS studio.sessions (token text PRIMARY KEY, email text NOT NULL, expires timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS studio.codes (email text PRIMARY KEY, hash text NOT NULL, expires timestamptz NOT NULL, attempts int NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS studio.limits (key text PRIMARY KEY, count int NOT NULL, expires timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS studio.projects (
 id uuid PRIMARY KEY, title text NOT NULL, description text NOT NULL DEFAULT '', owner_email text NOT NULL,
 category text NOT NULL DEFAULT 'Photography', price numeric(12,2) NOT NULL DEFAULT 0 CHECK(price>=0), currency text NOT NULL DEFAULT 'NGN',
 status text NOT NULL DEFAULT 'editing' CHECK(status IN ('editing','ready')), public_consent boolean NOT NULL DEFAULT false,
 consent_at timestamptz, consent_by text, registered boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS studio.members (project_id uuid REFERENCES studio.projects ON DELETE CASCADE, email text NOT NULL, PRIMARY KEY(project_id,email));
CREATE INDEX IF NOT EXISTS members_email_idx ON studio.members(email);
CREATE TABLE IF NOT EXISTS studio.media (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES studio.projects ON DELETE CASCADE, path text UNIQUE NOT NULL,
 name text NOT NULL, mime text NOT NULL, bytes bigint NOT NULL, caption text NOT NULL DEFAULT '', featured boolean NOT NULL DEFAULT false,
 uploaded boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS studio.packages (id uuid PRIMARY KEY, name text NOT NULL, description text NOT NULL DEFAULT '', category text NOT NULL, price numeric(12,2) NOT NULL CHECK(price>=0), currency text NOT NULL DEFAULT 'NGN', active boolean NOT NULL DEFAULT true);
CREATE TABLE IF NOT EXISTS studio.settings (key text PRIMARY KEY, value text NOT NULL);
CREATE TABLE IF NOT EXISTS studio.deliveries (project_id uuid REFERENCES studio.projects ON DELETE CASCADE, email text NOT NULL, sent_at timestamptz, error text, PRIMARY KEY(project_id,email));
-- No browser/Data API access: all authorization runs through the server.
REVOKE ALL ON SCHEMA studio FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA studio FROM PUBLIC;
