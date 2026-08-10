/**
 * TECH-2: Drop the unused parallel ev_stations model.
 * Product path uses `terminals` only (Flutter, seeds, dashboards, APIs).
 */

DROP VIEW IF EXISTS view_ev_charging_stations_full;

DROP TABLE IF EXISTS ev_station_amenities;
DROP TABLE IF EXISTS ev_station_status_history;
DROP TABLE IF EXISTS ev_station_access;
DROP TABLE IF EXISTS ev_station_pricing;
DROP TABLE IF EXISTS ev_station_connectors;
DROP TABLE IF EXISTS ev_stations;

DROP TYPE IF EXISTS plug_type_enum;
DROP TYPE IF EXISTS charging_level_enum;
DROP TYPE IF EXISTS site_type_enum;
DROP TYPE IF EXISTS access_type_enum;
DROP TYPE IF EXISTS operational_status_enum;
DROP TYPE IF EXISTS data_source_enum;
DROP TYPE IF EXISTS location_accuracy_enum;
