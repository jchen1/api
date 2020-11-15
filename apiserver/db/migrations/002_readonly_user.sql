CREATE USER readonly;

GRANT
SELECT ON ALL TABLES IN SCHEMA public to readonly;


ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT
SELECT ON TABLES TO readonly;

-- use a strong password please!
-- \password readonly;