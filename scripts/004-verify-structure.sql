-- Verify Database Structure
-- Run this to confirm all tables and columns are correct

-- Check all tables exist
SELECT 'Tables in database:' AS info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT '---' AS divider;

-- Check hr_users columns
SELECT 'hr_users columns:' AS info;
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'hr_users'
ORDER BY ordinal_position;

SELECT '---' AS divider;

-- Check employees columns
SELECT 'employees columns:' AS info;
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;

SELECT '---' AS divider;

-- Check employee_data columns
SELECT 'employee_data columns:' AS info;
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'employee_data'
ORDER BY ordinal_position;

SELECT '---' AS divider;

-- Check predictions columns
SELECT 'predictions columns:' AS info;
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'predictions'
ORDER BY ordinal_position;

SELECT '---' AS divider;

-- Check row counts
SELECT 'Row counts:' AS info;
SELECT 
    (SELECT COUNT(*) FROM hr_users) AS hr_users,
    (SELECT COUNT(*) FROM employees) AS employees,
    (SELECT COUNT(*) FROM employee_data) AS employee_data,
    (SELECT COUNT(*) FROM predictions) AS predictions;

SELECT '---' AS divider;

-- Verify HR users exist for login
SELECT 'HR Users for login:' AS info;
SELECT username, email, role, full_name 
FROM hr_users
ORDER BY id;

SELECT '============ VERIFICATION COMPLETE ============' AS status;
