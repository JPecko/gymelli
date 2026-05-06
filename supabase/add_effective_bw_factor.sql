-- Adds effective_bw_factor to exercises.
-- For reps_only exercises, this factor (0.0–1.0) multiplies body_weight_kg × reps
-- to produce an effective volume contribution for workout scoring.
-- Examples: crunch ≈ 0.25, push-up ≈ 0.60, pull-up ≈ 1.00
-- NULL (default) = 0 contribution, preserving existing behaviour.

ALTER TABLE exercises
  ADD COLUMN IF NOT EXISTS effective_bw_factor numeric(4,3) DEFAULT NULL;
