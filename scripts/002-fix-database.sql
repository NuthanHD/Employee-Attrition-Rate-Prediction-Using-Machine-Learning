-- ============================================
-- FIX SCRIPT FOR EMPLOYEE ATTRITION DATABASE
-- Run this if you get "employee_code does not exist" error
-- ============================================

-- First, let's check current table structure
SELECT 'Checking employee_data table structure...' AS info;

-- Add employee_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employee_data' 
        AND column_name = 'employee_code'
    ) THEN
        ALTER TABLE employee_data ADD COLUMN employee_code VARCHAR(50);
        ALTER TABLE employee_data ADD CONSTRAINT employee_data_employee_code_key UNIQUE (employee_code);
        RAISE NOTICE 'employee_code column added successfully';
    ELSE
        RAISE NOTICE 'employee_code column already exists';
    END IF;
END $$;

-- Add other potentially missing columns
DO $$ 
BEGIN
    -- Add is_predicted if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employee_data' 
        AND column_name = 'is_predicted'
    ) THEN
        ALTER TABLE employee_data ADD COLUMN is_predicted BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'is_predicted column added';
    END IF;
    
    -- Add submitted_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employee_data' 
        AND column_name = 'submitted_at'
    ) THEN
        ALTER TABLE employee_data ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'submitted_at column added';
    END IF;
END $$;

-- Create indexes safely
CREATE INDEX IF NOT EXISTS idx_employee_data_employee_id ON employee_data(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_data_code ON employee_data(employee_code);
CREATE INDEX IF NOT EXISTS idx_predictions_hr_user ON predictions(hr_user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_employee_data ON predictions(employee_data_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);

-- ============================================
-- VERIFY ALL TABLES AND COLUMNS
-- ============================================
SELECT '========================================' AS divider;
SELECT 'VERIFICATION REPORT' AS title;
SELECT '========================================' AS divider;

-- Show all tables
SELECT 'Tables in database:' AS info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Show hr_users columns
SELECT '========================================' AS divider;
SELECT 'HR_USERS table columns:' AS info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hr_users'
ORDER BY ordinal_position;

-- Show employees columns
SELECT '========================================' AS divider;
SELECT 'EMPLOYEES table columns:' AS info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employees'
ORDER BY ordinal_position;

-- Show employee_data columns
SELECT '========================================' AS divider;
SELECT 'EMPLOYEE_DATA table columns:' AS info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'employee_data'
ORDER BY ordinal_position;

-- Show predictions columns
SELECT '========================================' AS divider;
SELECT 'PREDICTIONS table columns:' AS info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'predictions'
ORDER BY ordinal_position;

-- Show row counts
SELECT '========================================' AS divider;
SELECT 'Row counts:' AS info;
SELECT 
    (SELECT COUNT(*) FROM hr_users) AS hr_users_count,
    (SELECT COUNT(*) FROM employees) AS employees_count,
    (SELECT COUNT(*) FROM employee_data) AS employee_data_count,
    (SELECT COUNT(*) FROM predictions) AS predictions_count;

-- Show HR users
SELECT '========================================' AS divider;
SELECT 'HR Users in system:' AS info;
SELECT id, username, email, full_name, role, created_at FROM hr_users;

SELECT '========================================' AS divider;
SELECT 'Database fix complete!' AS status;
SELECT '========================================' AS divider;
