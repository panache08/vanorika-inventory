-- Non-superuser runtime role
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user WITH LOGIN PASSWORD 'app_pw';
  END IF;
END $$;

GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- Helper: current tenant from GUC (NULL if unset -> policies deny)
CREATE OR REPLACE FUNCTION current_business_id() RETURNS text
  LANGUAGE sql STABLE AS
  $fn$ SELECT nullif(current_setting('app.current_business_id', true), '') $fn$;

-- Enable + FORCE RLS (FORCE so table owner is also constrained)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['Business','User','Category','Product','StockMovement'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- Business: match on id
CREATE POLICY tenant_isolation ON "Business"
  USING (id = current_business_id())
  WITH CHECK (id = current_business_id());

-- Tenant tables: match on businessId
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['User','Category','Product','StockMovement'] LOOP
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING ("businessId" = current_business_id()) WITH CHECK ("businessId" = current_business_id())', t);
  END LOOP;
END $$;
