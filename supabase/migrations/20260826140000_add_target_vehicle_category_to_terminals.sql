-- Migration: 20260826140000_add_target_vehicle_category_to_terminals.sql
-- Description: Add target_vehicle_category column to terminals for vehicle discrimination (car, bike, both)

ALTER TABLE public.terminals
  ADD COLUMN IF NOT EXISTS target_vehicle_category TEXT DEFAULT 'car';

-- Add check constraint for valid categories
ALTER TABLE public.terminals DROP CONSTRAINT IF EXISTS terminals_target_vehicle_category_check;
ALTER TABLE public.terminals
  ADD CONSTRAINT terminals_target_vehicle_category_check
  CHECK (target_vehicle_category IN ('car', 'bike', 'both'));

COMMENT ON COLUMN public.terminals.target_vehicle_category IS
  'Category of vehicles supported: car (4-wheeler/SUV), bike (2-wheeler/3-wheeler e-bike), or both.';
