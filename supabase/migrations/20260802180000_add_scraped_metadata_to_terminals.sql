-- Migration: 20260802180000_add_scraped_metadata_to_terminals.sql
-- Description: Add external_ids and source_raw JSONB columns to terminals for Apify scraping & deduplication

ALTER TABLE public.terminals
  ADD COLUMN IF NOT EXISTS external_ids JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_raw JSONB;

CREATE INDEX IF NOT EXISTS idx_terminals_external_ids ON public.terminals USING gin (external_ids);
