-- MANUAL ONLY — do not put this in the normal migration chain.
-- Use on a fresh/dev project if you previously applied the Supabase-Auth schema
-- (profiles / auth.users). Then re-run 20260731120000_initial_schema.sql.

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
