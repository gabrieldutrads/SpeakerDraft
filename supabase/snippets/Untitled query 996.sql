SELECT
  p.proname AS function_name,
  pg_get_function_arguments(p.oid) AS arguments,
  has_schema_privilege('authenticated', 'extensions', 'USAGE') AS authenticated_schema_usage,
  has_schema_privilege('anon', 'extensions', 'USAGE') AS anon_schema_usage,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute
FROM pg_proc p
WHERE p.pronamespace = 'extensions'::regnamespace
  AND p.proname IN ('plan', 'is', 'ok', 'is_empty', 'throws_ok', 'finish')
ORDER BY p.proname, p.oid::regprocedure::text;