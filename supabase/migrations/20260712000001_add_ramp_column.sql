-- "Why channels launch in this order" ramp visualization, missed in the
-- initial schema pass. Same treatment as north_star: structured JSON on
-- programs rather than its own table (not called out as a table in the brief).

alter table programs add column ramp jsonb;
