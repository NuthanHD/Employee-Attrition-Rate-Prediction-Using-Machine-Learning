-- ============================================
-- Employee Attrition Prediction Database Schema
-- ============================================
-- 
-- HOW TO RUN THIS SCRIPT IN PGADMIN:
-- 1. Open pgAdmin 4
-- 2. Connect to your PostgreSQL server
-- 3. Right-click "Databases" -> Create -> Database
-- 4. Name it: employee_attrition
-- 5. Click Save
-- 6. Right-click on employee_attrition -> Query Tool
-- 7. Copy and paste this entire script
-- 8. Click Execute (F5 or Play button)
-- ============================================

-- Drop existing tables for fresh install (uncomment if needed)
-- DROP TABLE IF EXISTS predictions CASCADE;
-- DROP TABLE IF EXISTS employee_data CASCADE;
-- DROP TABLE IF EXISTS employees CASCADE;
-- DROP TABLE IF EXISTS hr_users CASCADE;

-- ============================================
-- HR USERS TABLE (Only authorized HRs)
-- ============================================
CREATE TABLE IF NOT EXISTS hr_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'hr',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EMPLOYEES TABLE (Registered employees)
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20),
    role VARCHAR(50) DEFAULT 'employee',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- EMPLOYEE DATA TABLE (Submitted by employees)
-- ============================================
CREATE TABLE IF NOT EXISTS employee_data (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    contact_number VARCHAR(20),
    gender VARCHAR(20) NOT NULL,
    education VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    job_role VARCHAR(100) NOT NULL,
    monthly_income DECIMAL(12, 2) NOT NULL,
    years_at_company INTEGER NOT NULL,
    distance_from_home INTEGER NOT NULL,
    marital_status VARCHAR(50) NOT NULL,
    is_predicted BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PREDICTIONS TABLE (All predictions from HR)
-- ============================================
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    hr_user_id INTEGER REFERENCES hr_users(id) ON DELETE SET NULL,
    employee_data_id INTEGER REFERENCES employee_data(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(255),
    age INTEGER NOT NULL,
    gender VARCHAR(20),
    contact_number VARCHAR(20),
    education VARCHAR(100),
    department VARCHAR(100) NOT NULL,
    job_role VARCHAR(100) NOT NULL,
    monthly_income DECIMAL(12, 2) NOT NULL,
    years_at_company INTEGER NOT NULL,
    distance_from_home INTEGER,
    marital_status VARCHAR(50),
    job_satisfaction INTEGER CHECK (job_satisfaction BETWEEN 1 AND 5),
    work_life_balance INTEGER CHECK (work_life_balance BETWEEN 1 AND 4),
    environment_satisfaction INTEGER CHECK (environment_satisfaction BETWEEN 1 AND 4),
    job_involvement INTEGER CHECK (job_involvement BETWEEN 1 AND 4),
    performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 4),
    overtime VARCHAR(10),
    num_companies_worked INTEGER,
    total_working_years INTEGER,
    training_times_last_year INTEGER,
    years_since_last_promotion INTEGER,
    years_with_curr_manager INTEGER,
    stock_option_level INTEGER,
    prediction_result VARCHAR(20) NOT NULL,
    probability DECIMAL(5, 2) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    risk_factors TEXT,
    source VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_hr_users_username ON hr_users(username);
CREATE INDEX IF NOT EXISTS idx_hr_users_email ON hr_users(email);
CREATE INDEX IF NOT EXISTS idx_employees_username ON employees(username);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employee_data_employee_id ON employee_data(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_data_code ON employee_data(employee_code);
CREATE INDEX IF NOT EXISTS idx_predictions_hr_user ON predictions(hr_user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_employee_data ON predictions(employee_data_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at DESC);

-- ============================================
-- INSERT AUTHORIZED HR USERS (Only these 3 can login)
-- ============================================
INSERT INTO hr_users (username, email, password, full_name, role)
VALUES 
    ('hr_manager', 'manager4@gmail.com', 'hradmin123', 'Chaitra', 'hr'),
    ('nuthanhd', 'nuthanhd6@gmail.com', 'nuth1234', 'Nuthan', 'hr'),
    ('admin', 'admin3@gmail.com', 'admin123', 'Rajshekar', 'hr')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- VERIFY INSTALLATION
-- ============================================
SELECT '========================================' AS message;
SELECT 'Database setup complete!' AS status;
SELECT '========================================' AS message;

SELECT 'HR Users created:' AS info;
SELECT id, username, email, full_name, role FROM hr_users;

SELECT 'Tables created:' AS info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
