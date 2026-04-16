-- Remove newbie buffet feature database artifacts.
-- Run in staging first, then production during maintenance window.

START TRANSACTION;

-- 1) Backup newbie data before destructive operations.
CREATE TABLE IF NOT EXISTS backup_buffet_setting_newbie AS
SELECT * FROM buffet_setting_newbie;

CREATE TABLE IF NOT EXISTS backup_buffet_newbie AS
SELECT * FROM buffet_newbie;

CREATE TABLE IF NOT EXISTS backup_buffet_newbie_shuttlecocks AS
SELECT * FROM buffet_newbie_shuttlecocks;

CREATE TABLE IF NOT EXISTS backup_history_buffet_newbie AS
SELECT * FROM history_buffet_newbie;

-- 2) Remove newbie rows from shared table if present.
DELETE FROM current_cock WHERE type = 'newbie';

-- 3) Drop dependent newbie tables first.
DROP TABLE IF EXISTS history_buffet_newbie;
DROP TABLE IF EXISTS buffet_newbie_shuttlecocks;
DROP TABLE IF EXISTS buffet_newbie;
DROP TABLE IF EXISTS buffet_setting_newbie;

COMMIT;

-- 4) NOTE:
-- If daily_summary_view references newbie tables/columns, recreate it
-- to remove those dependencies before running this script in production.
