# 📘 pgAdmin Database Setup Instructions

## Step 1: Create the Database in pgAdmin

1. **Open pgAdmin 4**
2. **Connect to your PostgreSQL server**
   - Should be: localhost:5432
   - Username: postgres
   - Password: Pg@2025

3. **Create Database**
   - Right-click on "Databases" → Create → Database
   - Name: `employee_attrition`
   - Owner: postgres
   - Click "Save"

## Step 2: Run the SQL Schema Script

1. **Open Query Tool**
   - Right-click on `employee_attrition` database
   - Select "Query Tool"

2. **Load the Schema Script**
   - In the v0 project, open `scripts/001-create-tables.sql`
   - Copy the entire content
   - Paste it into pgAdmin Query Tool

3. **Execute the Script**
   - Click the "Execute/Refresh" button (▶ icon) or press F5
   - You should see: "Database setup complete!" in the Messages tab

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root with these credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_attrition
DB_USER=postgres
DB_PASSWORD=Pg@2025
DB_SSL=false
```

## Step 4: Verify Database Connection

1. **Run the verification script**
   - Open Query Tool for `employee_attrition` database
   - Open `scripts/VERIFY_DATABASE.sql` from the project
   - Copy and paste into pgAdmin
   - Execute (F5)
   - You should see all tables and the 3 HR users

## Step 5: View Data in pgAdmin

### View Tables
1. In pgAdmin, expand:
   - Databases → employee_attrition → Schemas → public → Tables

2. **Available Tables:**
   - `hr_users` - Authorized HR personnel (3 users)
   - `employees` - Registered employees
   - `employee_data` - Submitted employee information
   - `predictions` - Attrition predictions made by HR

### Query Data
Right-click any table → View/Edit Data → All Rows

Or use Query Tool:
```sql
-- View all HR users
SELECT * FROM hr_users;

-- View all employees
SELECT * FROM employees;

-- View all submitted employee data
SELECT * FROM employee_data ORDER BY submitted_at DESC;

-- View all predictions
SELECT * FROM predictions ORDER BY created_at DESC;

-- View predictions with employee details
SELECT 
    p.id,
    p.full_name,
    p.department,
    p.job_role,
    p.prediction_result,
    p.probability,
    p.risk_level,
    p.created_at
FROM predictions p
ORDER BY p.created_at DESC;
```

## Step 6: Monitor Real-Time Data

### When employees register:
```sql
SELECT id, username, email, full_name, contact_number, created_at 
FROM employees 
ORDER BY created_at DESC;
```

### When employees submit data:
```sql
SELECT id, employee_code, full_name, age, department, job_role, submitted_at 
FROM employee_data 
ORDER BY submitted_at DESC;
```

### When HR makes predictions:
```sql
SELECT 
    p.full_name,
    p.department,
    p.job_role,
    p.prediction_result,
    p.probability,
    p.risk_level,
    p.job_satisfaction,
    p.created_at
FROM predictions p
ORDER BY p.created_at DESC
LIMIT 10;
```

## Troubleshooting

### Error: "database does not exist"
- Make sure you created the `employee_attrition` database in Step 1

### Error: "password authentication failed"
- Verify your postgres password is `Pg@2025`
- Update `.env.local` if different

### Error: "connection refused"
- Make sure PostgreSQL service is running
- Windows: Services → postgresql-x64-xx → Start
- Check port 5432 is not blocked

### Tables not showing data
- The app needs to be running with correct `.env.local` settings
- Data will appear in pgAdmin as users register and submit forms
- Currently using localStorage, so run the migration script to see data

## Data Migration from localStorage

To import existing localStorage data into PostgreSQL, create a new script:

```sql
-- scripts/008-import-existing-data.sql
-- Copy your existing employee data here
```

Then execute it in pgAdmin Query Tool.

## Useful pgAdmin Features

1. **Refresh Data**: Right-click table → Refresh
2. **Export Data**: Right-click table → Import/Export Data
3. **View Relationships**: Right-click table → View → Dependencies
4. **Run Queries**: Click "Query Tool" icon in toolbar

---

Your database is now ready! Start your Next.js app and all data will be saved to PostgreSQL. View it anytime in pgAdmin.
