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

-- Project-scoped access. Legacy secondary recipients must be reviewed once.
CREATE TABLE IF NOT EXISTS studio.migrations (name text PRIMARY KEY);
CREATE TABLE IF NOT EXISTS studio.users (email text PRIMARY KEY, verified_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE studio.members ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'recipient' CHECK (role IN ('owner','recipient','editor','manager'));
ALTER TABLE studio.members ADD COLUMN IF NOT EXISTS approval text NOT NULL DEFAULT 'pending' CHECK (approval IN ('pending','approved','rejected','revoked'));
ALTER TABLE studio.members ADD COLUMN IF NOT EXISTS approved_by text;
ALTER TABLE studio.members ADD COLUMN IF NOT EXISTS approved_at timestamptz;
ALTER TABLE studio.sessions ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE studio.sessions ADD COLUMN IF NOT EXISTS last_seen timestamptz NOT NULL DEFAULT now();
ALTER TABLE studio.media ADD COLUMN IF NOT EXISTS upload_started timestamptz;
ALTER TABLE studio.deliveries ADD COLUMN IF NOT EXISTS sending_at timestamptz;
CREATE TABLE IF NOT EXISTS studio.audit (
 id bigserial PRIMARY KEY, project_id uuid REFERENCES studio.projects ON DELETE CASCADE,
 actor text NOT NULL, action text NOT NULL, subject text, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS audit_project_idx ON studio.audit(project_id,created_at DESC);
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM studio.migrations WHERE name='project-access-v1') THEN
  UPDATE studio.members m SET role='owner',approval='approved',approved_by='migration',approved_at=now() FROM studio.projects p WHERE p.id=m.project_id AND p.owner_email=m.email;
  INSERT INTO studio.users(email) SELECT DISTINCT email FROM studio.sessions WHERE expires>now() ON CONFLICT DO NOTHING;
  INSERT INTO studio.migrations VALUES('project-access-v1');
 END IF;
END $$;
CREATE OR REPLACE FUNCTION studio.request_recipients(pid uuid, actor_email text, addresses text[]) RETURNS void LANGUAGE plpgsql AS $$
DECLARE p studio.projects%ROWTYPE;
BEGIN
 SELECT * INTO p FROM studio.projects WHERE id=pid FOR UPDATE;
 IF p.owner_email IS DISTINCT FROM actor_email OR NOT EXISTS(SELECT 1 FROM studio.members WHERE project_id=pid AND email=actor_email AND role='owner' AND approval='approved') THEN RAISE EXCEPTION 'Owner access required'; END IF;
 IF cardinality(addresses) NOT BETWEEN 2 AND 3 OR NOT(actor_email=ANY(addresses)) OR (SELECT count(DISTINCT a) FROM unnest(addresses) a)<>cardinality(addresses) THEN RAISE EXCEPTION 'Invalid recipients'; END IF;
 IF EXISTS(SELECT 1 FROM studio.members WHERE project_id=pid AND role IN ('editor','manager') AND email=ANY(addresses)) THEN RAISE EXCEPTION 'Staff email cannot be a customer recipient'; END IF;
 UPDATE studio.members SET approval='revoked',approved_by=actor_email,approved_at=now() WHERE project_id=pid AND role='recipient' AND NOT(email=ANY(addresses)) AND approval<>'revoked';
 INSERT INTO studio.members(project_id,email,role,approval) SELECT pid,a,'recipient','pending' FROM unnest(addresses) a WHERE a<>actor_email ON CONFLICT(project_id,email) DO UPDATE SET approval=CASE WHEN studio.members.approval='revoked' THEN 'pending' ELSE studio.members.approval END;
 UPDATE studio.projects SET registered=true WHERE id=pid;
 INSERT INTO studio.audit(project_id,actor,action) VALUES(pid,actor_email,'recipients.requested');
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA studio FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA studio FROM PUBLIC;
