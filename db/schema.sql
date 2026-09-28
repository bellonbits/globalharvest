-- Global Harvest database schema. Safe to run repeatedly (idempotent).
-- Apply with: npm run db:migrate
--
-- Everything lives in its own schema so it never collides with other
-- applications sharing this database. gen_random_uuid() is built into PostgreSQL 13+.

CREATE SCHEMA IF NOT EXISTS global_harvest;
SET search_path TO global_harvest;

CREATE TABLE IF NOT EXISTS registrations (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name         text NOT NULL CHECK (length(first_name) BETWEEN 1 AND 60),
  last_name          text NOT NULL CHECK (length(last_name) BETWEEN 1 AND 60),
  email              text NOT NULL CHECK (length(email) <= 254),
  phone              text NOT NULL CHECK (length(phone) <= 30),
  country            text NOT NULL,
  city               text NOT NULL CHECK (length(city) <= 80),
  age_range          text NOT NULL,
  preferred_language text NOT NULL,
  referral_source    text NOT NULL,
  interests          text[] NOT NULL CHECK (cardinality(interests) > 0),
  participation      text NOT NULL CHECK (participation IN ('online', 'in-person', 'both')),
  church             text CHECK (length(church) <= 120),
  areas_of_interest  text CHECK (length(areas_of_interest) <= 300),
  message            text CHECK (length(message) <= 1000),
  consent            boolean NOT NULL CHECK (consent),
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS registrations_email_idx ON registrations (lower(email));
CREATE INDEX IF NOT EXISTS registrations_created_idx ON registrations (created_at DESC);

CREATE TABLE IF NOT EXISTS event_registrations (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_slug           text NOT NULL,
  first_name           text NOT NULL CHECK (length(first_name) BETWEEN 1 AND 60),
  last_name            text NOT NULL CHECK (length(last_name) BETWEEN 1 AND 60),
  email                text NOT NULL CHECK (length(email) <= 254),
  phone                text NOT NULL CHECK (length(phone) <= 30),
  country              text NOT NULL,
  attendees            integer NOT NULL CHECK (attendees BETWEEN 1 AND 10),
  special_requirements text CHECK (length(special_requirements) <= 500),
  consent              boolean NOT NULL CHECK (consent),
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_registrations_slug_idx ON event_registrations (event_slug);

-- Prayer requests are confidential: never exposed by any public endpoint.
CREATE TABLE IF NOT EXISTS prayer_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL CHECK (length(full_name) BETWEEN 1 AND 80),
  email         text NOT NULL CHECK (length(email) <= 254),
  request       text NOT NULL CHECK (length(request) BETWEEN 10 AND 2000),
  country       text NOT NULL,
  wants_contact boolean NOT NULL DEFAULT false,
  consent       boolean NOT NULL CHECK (consent),
  status        text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'prayed', 'followed-up', 'archived')),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS prayer_requests_created_idx ON prayer_requests (created_at DESC);

CREATE TABLE IF NOT EXISTS contact_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  email      text NOT NULL CHECK (length(email) <= 254),
  phone      text CHECK (length(phone) <= 30),
  category   text NOT NULL CHECK (category IN ('general', 'bible-study', 'prayer', 'events', 'mission', 'partnership')),
  subject    text NOT NULL CHECK (length(subject) BETWEEN 1 AND 120),
  message    text NOT NULL CHECK (length(message) BETWEEN 10 AND 3000),
  status     text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contact_messages_created_idx ON contact_messages (created_at DESC);

-- =====================================================================
-- v2 — Admin portal
-- =====================================================================

-- Workflow status + demo flags on public submission tables ------------
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_status_check;
ALTER TABLE registrations ADD CONSTRAINT registrations_status_check CHECK (status IN ('new', 'contacted', 'active', 'inactive', 'archived'));

ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS attendance text NOT NULL DEFAULT 'registered';
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE event_registrations DROP CONSTRAINT IF EXISTS event_registrations_attendance_check;
ALTER TABLE event_registrations ADD CONSTRAINT event_registrations_attendance_check CHECK (attendance IN ('registered', 'confirmed', 'attended', 'no-show', 'cancelled'));

ALTER TABLE prayer_requests ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'other';
ALTER TABLE prayer_requests ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE prayer_requests ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE prayer_requests DROP CONSTRAINT IF EXISTS prayer_requests_status_check;
UPDATE prayer_requests SET status = 'being-prayed-for' WHERE status = 'prayed';
UPDATE prayer_requests SET status = 'follow-up' WHERE status = 'followed-up';
ALTER TABLE prayer_requests ADD CONSTRAINT prayer_requests_status_check CHECK (status IN ('new', 'being-prayed-for', 'follow-up', 'answered', 'archived'));
ALTER TABLE prayer_requests DROP CONSTRAINT IF EXISTS prayer_requests_category_check;
ALTER TABLE prayer_requests ADD CONSTRAINT prayer_requests_category_check CHECK (category IN ('personal', 'family', 'health', 'work', 'faith', 'community', 'mission', 'other'));

ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS replied_at timestamptz;
ALTER TABLE contact_messages DROP CONSTRAINT IF EXISTS contact_messages_status_check;
UPDATE contact_messages SET status = 'unread' WHERE status = 'new';
ALTER TABLE contact_messages ALTER COLUMN status SET DEFAULT 'unread';
ALTER TABLE contact_messages ADD CONSTRAINT contact_messages_status_check CHECK (status IN ('unread', 'read', 'replied', 'archived'));

-- Admin users & sessions ---------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email           text NOT NULL,
  name            text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  role            text NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'EVENT_MANAGER', 'BIBLE_STUDY_LEADER', 'PRAYER_COORDINATOR', 'CONTENT_MANAGER')),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'suspended', 'pending')),
  password_hash   text,                         -- scrypt; NULL until the user sets a password
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until    timestamptz,
  last_login_at   timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_uidx ON admin_users (lower(email));

CREATE TABLE IF NOT EXISTS admin_sessions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash   text NOT NULL UNIQUE,             -- sha256 of the cookie token; the raw token is never stored
  remember     boolean NOT NULL DEFAULT false,
  ip           text,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  revoked_at   timestamptz
);
CREATE INDEX IF NOT EXISTS admin_sessions_user_idx ON admin_sessions (user_id);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log (append-only: the API exposes no update/delete) ------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id          bigserial PRIMARY KEY,
  user_id     uuid,
  user_email  text,
  action      text NOT NULL,
  resource    text NOT NULL,
  resource_id text,
  details     jsonb,
  ip          text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_resource_idx ON audit_logs (resource, resource_id);

-- Notifications --------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL,                     -- registration | event_registration | prayer_request | contact_message | system
  title       text NOT NULL,
  entity_type text,
  entity_id   text,
  permission  text NOT NULL,                     -- only users holding this permission see it
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_created_idx ON notifications (created_at DESC);
CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id uuid NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  read_at         timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (notification_id, user_id)
);

-- Internal notes & communication history ------------------------------
CREATE TABLE IF NOT EXISTS admin_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,                     -- registration | member | prayer_request | contact_message | group …
  entity_id   text NOT NULL,
  kind        text NOT NULL DEFAULT 'note' CHECK (kind IN ('note', 'email', 'call', 'message', 'status')),
  body        text NOT NULL CHECK (length(body) BETWEEN 1 AND 5000),
  author_id   uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  author_name text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_notes_entity_idx ON admin_notes (entity_type, entity_id, created_at DESC);

-- Managed records (events, Bible studies, groups, members, resources, content, media, subscribers, campaigns, settings)
CREATE TABLE IF NOT EXISTS records (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection text NOT NULL,
  status     text,
  data       jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo    boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS records_collection_idx ON records (collection, updated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS records_slug_uidx ON records (collection, (data->>'slug')) WHERE data ? 'slug';

-- One subscriber per email address.
CREATE UNIQUE INDEX IF NOT EXISTS records_subscriber_email_uidx ON records (lower(data->>'email')) WHERE collection = 'subscribers';
