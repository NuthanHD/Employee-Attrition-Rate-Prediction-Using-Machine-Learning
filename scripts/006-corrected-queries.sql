-- Corrected Queries for Viewing Database Details
-- Copy and run these queries in pgAdmin

-- ====================================
-- 1. VIEW ALL TABLES
-- ====================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- ====================================
-- 2. VIEW ROW COUNTS (CORRECTED VERSION)
-- ====================================
SELECT 
    schemaname,
    relname AS tablename,
    n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- ====================================
-- 3. VIEW ALL DATA FROM EACH TABLE
-- ====================================

-- HR Users
SELECT * FROM hr_users ORDER BY id;

-- Employees
SELECT * FROM employees ORDER BY id;

-- Employee Data
SELECT * FROM employee_data ORDER BY id LIMIT 20;

-- Predictions
SELECT * FROM predictions ORDER BY id;

-- ====================================
-- 4. VIEW TABLE STRUCTURES
-- ====================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ====================================
-- 5. VIEW JOINED DATA (Employees with their data)
-- ====================================
SELECT 
    e.employee_code,
    e.full_name,
    e.age,
    e.gender,
    e.department,
    e.job_role,
    ed.monthly_income,
    ed.performance_rating,
    ed.attrition
FROM employees e
LEFT JOIN employee_data ed ON e.employee_code = ed.employee_code
ORDER BY e.id;

-- ====================================
-- 6. VIEW PREDICTIONS WITH EMPLOYEE INFO
-- ====================================
SELECT 
    p.employee_code,
    e.full_name,
    p.prediction_result,
    p.prediction_date,
    p.model_accuracy
FROM predictions p
LEFT JOIN employees e ON p.employee_code = e.employee_code
ORDER BY p.prediction_date DESC;
