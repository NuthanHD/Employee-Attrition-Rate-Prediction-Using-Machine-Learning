-- Insert Sample Employee Data
-- Run this script to populate your database with test data

-- Corrected to match actual table schema from 001-create-tables.sql

-- First, add some registered employees (these are users who can log into the employee portal)
INSERT INTO employees (username, email, password, full_name, contact_number, role)
VALUES 
    ('john.doe', 'john.doe@company.com', 'pass123', 'John Doe', '9876543210', 'employee'),
    ('jane.smith', 'jane.smith@company.com', 'pass123', 'Jane Smith', '9876543211', 'employee'),
    ('mike.wilson', 'mike.wilson@company.com', 'pass123', 'Mike Wilson', '9876543212', 'employee'),
    ('sarah.johnson', 'sarah.johnson@company.com', 'pass123', 'Sarah Johnson', '9876543213', 'employee'),
    ('david.brown', 'david.brown@company.com', 'pass123', 'David Brown', '9876543214', 'employee')
ON CONFLICT (username) DO NOTHING;

-- Now add detailed employee data (submitted by employees for attrition prediction)
INSERT INTO employee_data (employee_id, employee_code, full_name, age, contact_number, gender, education, department, job_role, monthly_income, years_at_company, distance_from_home, marital_status, is_predicted)
VALUES 
    ((SELECT id FROM employees WHERE username = 'john.doe'), 'EMP001', 'John Doe', 28, '9876543210', 'Male', 'Bachelor', 'Sales', 'Sales Executive', 5000.00, 3, 10, 'Single', false),
    ((SELECT id FROM employees WHERE username = 'jane.smith'), 'EMP002', 'Jane Smith', 32, '9876543211', 'Female', 'Master', 'Research & Development', 'Research Scientist', 8000.00, 5, 15, 'Married', false),
    ((SELECT id FROM employees WHERE username = 'mike.wilson'), 'EMP003', 'Mike Wilson', 35, '9876543212', 'Male', 'Bachelor', 'Human Resources', 'HR Manager', 7500.00, 7, 5, 'Married', false),
    ((SELECT id FROM employees WHERE username = 'sarah.johnson'), 'EMP004', 'Sarah Johnson', 25, '9876543213', 'Female', 'Bachelor', 'Sales', 'Sales Representative', 4500.00, 1, 20, 'Single', false),
    ((SELECT id FROM employees WHERE username = 'david.brown'), 'EMP005', 'David Brown', 40, '9876543214', 'Male', 'Master', 'Research & Development', 'Laboratory Technician', 6000.00, 10, 8, 'Married', false)
ON CONFLICT (employee_code) DO NOTHING;

-- Add some sample prediction records (predictions made by HR)
INSERT INTO predictions (
    hr_user_id, 
    employee_data_id, 
    employee_code, 
    full_name, 
    age, 
    gender, 
    contact_number, 
    education, 
    department, 
    job_role, 
    monthly_income, 
    years_at_company, 
    distance_from_home, 
    marital_status,
    job_satisfaction,
    work_life_balance,
    environment_satisfaction,
    job_involvement,
    performance_rating,
    overtime,
    num_companies_worked,
    total_working_years,
    training_times_last_year,
    years_since_last_promotion,
    years_with_curr_manager,
    stock_option_level,
    prediction_result, 
    probability, 
    risk_level, 
    risk_factors,
    source
)
VALUES 
    (
        (SELECT id FROM hr_users WHERE username = 'admin'), 
        (SELECT id FROM employee_data WHERE employee_code = 'EMP001'),
        'EMP001', 'John Doe', 28, 'Male', '9876543210', 'Bachelor', 'Sales', 'Sales Executive', 
        5000.00, 3, 10, 'Single', 4, 3, 3, 3, 3, 'Yes', 2, 5, 2, 1, 2, 1,
        'Low Risk', 15.50, 'Low', 'Good work-life balance, satisfied with job', 'manual'
    ),
    (
        (SELECT id FROM hr_users WHERE username = 'admin'), 
        (SELECT id FROM employee_data WHERE employee_code = 'EMP002'),
        'EMP002', 'Jane Smith', 32, 'Female', '9876543211', 'Master', 'Research & Development', 'Research Scientist', 
        8000.00, 5, 15, 'Married', 3, 2, 4, 4, 4, 'No', 3, 8, 3, 2, 3, 2,
        'Low Risk', 12.30, 'Low', 'High performance, experienced', 'manual'
    ),
    (
        (SELECT id FROM hr_users WHERE username = 'nuthanhd'), 
        (SELECT id FROM employee_data WHERE employee_code = 'EMP004'),
        'EMP004', 'Sarah Johnson', 25, 'Female', '9876543213', 'Bachelor', 'Sales', 'Sales Representative', 
        4500.00, 1, 20, 'Single', 3, 2, 2, 2, 3, 'Yes', 1, 2, 1, 0, 1, 0,
        'High Risk', 68.75, 'High', 'Low experience, long commute, works overtime, low satisfaction', 'manual'
    );

-- Verify the data was inserted
SELECT '========================================' AS divider;
SELECT 'Sample data inserted successfully!' AS status;
SELECT '========================================' AS divider;

-- Show row counts
SELECT 
    'hr_users' AS table_name, COUNT(*) AS row_count FROM hr_users
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'employee_data', COUNT(*) FROM employee_data
UNION ALL
SELECT 'predictions', COUNT(*) FROM predictions;

-- Show sample data
SELECT '========================================' AS divider;
SELECT 'Sample HR Users:' AS info;
SELECT username, email, full_name, role FROM hr_users;

SELECT '========================================' AS divider;
SELECT 'Sample Employees:' AS info;
SELECT username, email, full_name, contact_number FROM employees LIMIT 5;

SELECT '========================================' AS divider;
SELECT 'Sample Employee Data:' AS info;
SELECT employee_code, full_name, age, department, job_role, monthly_income FROM employee_data LIMIT 5;

SELECT '========================================' AS divider;
SELECT 'Sample Predictions:' AS info;
SELECT employee_code, full_name, prediction_result, probability, risk_level FROM predictions LIMIT 5;
