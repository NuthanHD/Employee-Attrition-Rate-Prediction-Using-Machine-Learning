-- ============================================
-- VERIFICATION SCRIPT
-- Run this after setting up the database
-- ============================================

-- 1. Check all tables exist
SELECT 'Checking tables...' AS step;
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check HR users exist
SELECT 'Checking HR users...' AS step;
SELECT id, username, email, full_name, role, created_at 
FROM hr_users 
ORDER BY id;

-- 3. Check employees table structure
SELECT 'Checking employees table...' AS step;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;

-- 4. Check employee_data table structure
SELECT 'Checking employee_data table...' AS step;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'employee_data'
ORDER BY ordinal_position;

-- 5. Check predictions table structure
SELECT 'Checking predictions table...' AS step;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'predictions'
ORDER BY ordinal_position;

-- 6. Count records in each table
SELECT 'Record counts...' AS step;
SELECT 
    (SELECT COUNT(*) FROM hr_users) AS hr_users_count,
    (SELECT COUNT(*) FROM employees) AS employees_count,
    (SELECT COUNT(*) FROM employee_data) AS employee_data_count,
    (SELECT COUNT(*) FROM predictions) AS predictions_count;

-- 7. Test database permissions
SELECT 'Testing permissions...' AS step;
SELECT current_user AS connected_as, 
       current_database() AS database_name,
       version() AS postgres_version;
