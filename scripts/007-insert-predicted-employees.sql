-- Insert Predicted Employee Details from the Application
-- These are the employees showing in your UI with their prediction statuses

-- Clear existing data (optional - remove this section if you want to keep existing data)
-- TRUNCATE TABLE predictions CASCADE;
-- TRUNCATE TABLE employee_data CASCADE;
-- TRUNCATE TABLE employees CASCADE;

-- Insert employees (these appear in your Employees tab)
INSERT INTO employees (username, email, password, full_name, contact_number, role)
VALUES 
    ('raj', 'raj@company.com', 'emp123', 'Raj', '9876543210', 'employee'),
    ('govtham', 'govtham@company.com', 'emp123', 'Govtham', '9876543211', 'employee'),
    ('nuthan', 'nuthan@company.com', 'emp123', 'Nuthan', '9876543212', 'employee'),
    ('ravikanth', 'ravikanth@company.com', 'emp123', 'Ravikanth', '9876543213', 'employee'),
    ('ranjith', 'ranjith@company.com', 'emp123', 'Ranjith', '9876543214', 'employee'),
    ('guru', 'guru@company.com', 'emp123', 'Guru', '9876543215', 'employee')
ON CONFLICT (username) DO NOTHING;

-- Insert detailed employee data with all required fields
INSERT INTO employee_data (
    employee_id, 
    employee_code, 
    full_name, 
    age, 
    contact_number, 
    gender, 
    education, 
    department, 
    job_role, 
    monthly_income, 
    years_at_company, 
    distance_from_home, 
    marital_status, 
    is_predicted
)
VALUES 
    (
        (SELECT id FROM employees WHERE username = 'raj'), 
        'EMP101', 'Raj', 30, '9876543210', 'Male', 'Bachelor', 
        'Sales', 'Sales Executive', 50000.00, 5, 12, 'Married', true
    ),
    (
        (SELECT id FROM employees WHERE username = 'govtham'), 
        'EMP102', 'Govtham', 35, '9876543211', 'Male', 'Master', 
        'DevOps & Cloud', 'Cloud Architect', 30000.00, 8, 15, 'Married', true
    ),
    (
        (SELECT id FROM employees WHERE username = 'nuthan'), 
        'EMP103', 'Nuthan', 24, '9876543212', 'Male', 'Bachelor', 
        'DevOps & Cloud', 'Data Analyst', 54999.00, 2, 20, 'Single', true
    ),
    (
        (SELECT id FROM employees WHERE username = 'ravikanth'), 
        'EMP104', 'Ravikanth', 22, '9876543213', 'Male', 'Bachelor', 
        'Human Resources', 'HR Executive', 30000.00, 1, 25, 'Single', true
    ),
    (
        (SELECT id FROM employees WHERE username = 'ranjith'), 
        'EMP105', 'Ranjith', 25, '9876543214', 'Male', 'Master', 
        'Cybersecurity', 'Data Scientist', 30000.00, 3, 18, 'Single', true
    ),
    (
        (SELECT id FROM employees WHERE username = 'guru'), 
        'EMP106', 'Guru', 25, '9876543215', 'Male', 'Bachelor', 
        'Cybersecurity', 'QA Engineer', 39000.00, 3, 10, 'Married', true
    )
ON CONFLICT (employee_code) DO NOTHING;

-- Insert prediction results for these employees
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
    -- Raj - Stable (30%)
    (
        (SELECT id FROM hr_users WHERE username = 'admin'), 
        (SELECT id FROM employee_data WHERE employee_code = 'EMP101'),
        'EMP101', 'Raj', 30, 'Male', '9876543210', 'Bachelor', 'Sales', 'Sales Executive', 
        50000.00, 5, 12, 'Married', 
        4, 4, 4, 4, 4, 'No', 2, 8, 3, 2, 3, 2,
        'Stable', 30.00, 'Low', 'Experienced, good satisfaction scores, stable role', 'predicted'
    ),
    -- Govtham - At Risk (60%)
    (
        (SELECT id FROM hr_users WHERE username = 'admin'), 
        (SELECT id FROM employee_data WHERE employee_code = 'EMP102'),
        'EMP102', 'Govtham', 35, 'Male', '9876543211', 'Master', 'DevOps & Cloud', 'Cloud Architect', 
        30000.00, 8, 15, 'Married', 
        2, 2, 2, 3, 3, 'Yes', 4, 12, 2, 4, 5, 1,
        'At Risk', 60.00, 'High', 'Low income for role, works overtime, low satisfaction, long tenure without promotion', 'predicted'
    ),
    -- Nuthan - At Risk (55%)
    (
        (SELECT id FROM hr_users WHERE username = 'nuthandhd'), 
        (SELECT id FROM employee_data WHERE employee_code = 'EMP103'),
        'EMP103', 'Nuthan', 24, 'Male', '9876543212', 'Bachelor', 'DevOps & Cloud', 'Data Analyst', 
        54999.00, 2, 20, 'Single', 
        3, 2, 3, 3, 3, 'Yes', 1, 2, 2, 1, 1, 0,
        'At Risk', 55.00, 'Medium', 'Young professional, long commute, works overtime, limited experience', 'predicted'
    ),
    -- Ravikanth - At Risk (60%)
    (
        (SELECT id FROM hr_users WHERE username = 'admin'), 
        (SELECT id FROM employee_data WHERE employee_code = 'EMP104'),
        'EMP104', 'Ravikanth', 22, 'Male', '9876543213', 'Bachelor', 'Human Resources', 'HR Executive', 
        30000.00, 1, 25, 'Single', 
        2, 2, 2, 2, 3, 'Yes', 1, 1, 1, 0, 1, 0,
        'At Risk', 60.00, 'High', 'Very young, low experience, very long commute, works overtime, low satisfaction', 'predicted'
    ),
    -- Ranjith - At Risk (70%)
    (
        (SELECT id FROM hr_users WHERE username = 'admin'), 
        (SELECT id FROM employee_data WHERE employee_code = 'EMP105'),
        'EMP105', 'Ranjith', 25, 'Male', '9876543214', 'Master', 'Cybersecurity', 'Data Scientist', 
        30000.00, 3, 18, 'Single', 
        2, 2, 2, 2, 2, 'Yes', 2, 3, 1, 2, 2, 0,
        'At Risk', 70.00, 'High', 'Low income for Data Scientist role, works overtime, low satisfaction across all areas', 'predicted'
    ),
    -- Guru - At Risk (70%)
    (
        (SELECT id FROM hr_users WHERE username = 'admin'), 
        (SELECT id FROM employee_data WHERE employee_code = 'EMP106'),
        'EMP106', 'Guru', 25, 'Male', '9876543215', 'Bachelor', 'Cybersecurity', 'QA Engineer', 
        39000.00, 3, 10, 'Married', 
        2, 2, 2, 3, 3, 'Yes', 2, 3, 2, 2, 2, 1,
        'At Risk', 70.00, 'High', 'Works overtime, low satisfaction, limited growth opportunities', 'predicted'
    )
ON CONFLICT DO NOTHING;

-- Verification Section
SELECT '========================================' AS divider;
SELECT 'Predicted employees data inserted successfully!' AS status;
SELECT '========================================' AS divider;

-- Show counts
SELECT 
    'Total Employees' AS metric, COUNT(*) AS count FROM employees
UNION ALL
SELECT 'Total Employee Data Records', COUNT(*) FROM employee_data
UNION ALL
SELECT 'Total Predictions', COUNT(*) FROM predictions
UNION ALL
SELECT 'Predicted Employees (is_predicted=true)', COUNT(*) FROM employee_data WHERE is_predicted = true;

SELECT '========================================' AS divider;
SELECT 'Employee List with Predictions:' AS info;
SELECT '========================================' AS divider;

-- Show all employees with their prediction status
SELECT 
    ed.employee_code,
    ed.full_name,
    ed.age,
    ed.department,
    ed.job_role,
    ed.monthly_income,
    COALESCE(p.prediction_result, 'Not Predicted') AS status,
    COALESCE(p.probability, 0) AS risk_percentage,
    COALESCE(p.risk_level, 'Unknown') AS risk_level
FROM employee_data ed
LEFT JOIN predictions p ON ed.id = p.employee_data_id
WHERE ed.is_predicted = true
ORDER BY ed.employee_code;

SELECT '========================================' AS divider;
SELECT 'Data insertion complete!' AS final_status;
SELECT '========================================' AS divider;
