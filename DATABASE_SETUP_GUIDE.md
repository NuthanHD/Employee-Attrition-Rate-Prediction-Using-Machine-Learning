# Employee Attrition Database Setup Guide

## Current Status
✅ Database `employee_attrition` is created  
✅ Table `hr_users` exists with 3 users  
❌ Missing tables: `employees`, `employee_data`, `predictions`

## Problem
Only `SELECT * FROM hr_users;` works because other tables don't exist yet.

## Solution: Run the Complete SQL Schema

### Step 1: Open pgAdmin Query Tool
1. Open pgAdmin 4
2. Expand Databases → employee_attrition
3. Right-click "employee_attrition" → Query Tool

### Step 2: Execute the Complete Schema Script
Copy the script from `scripts/001-create-tables.sql` and run it in the Query Tool.

This will create:
- `hr_users` table (already exists, will skip)
- `employees` table (NEW - for employee registration)
- `employee_data` table (NEW - for employee survey data)
- `predictions` table (NEW - for attrition predictions)

### Step 3: Verify Installation
After running the script, test these queries:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Check HR users
SELECT * FROM hr_users;

-- Check employees (empty initially)
SELECT * FROM employees;

-- Check employee data (empty initially)
SELECT * FROM employee_data;

-- Check predictions (empty initially)
SELECT * FROM predictions;
```

## Environment Variables Setup

Your `.env.local` file is already configured correctly:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_attrition
DB_USER=postgres
DB_PASSWORD=Nhd@2003
DB_SSL=false
```

## Testing the Connection

### Test 1: Check if tables exist
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Expected Result: You should see 4 tables:
- hr_users
- employees
- employee_data
- predictions

### Test 2: Check HR users
```sql
SELECT id, username, email, full_name, role FROM hr_users;
```

Expected Result: 3 HR users (Chaitra, Nuthan, Rajshekar)

### Test 3: Try inserting test data
```sql
-- Insert a test employee
INSERT INTO employees (username, email, password, full_name, contact_number)
VALUES ('test_emp', 'test@example.com', 'test123', 'Test Employee', '1234567890');

-- Verify it was inserted
SELECT * FROM employees;
```

## Common Issues and Solutions

### Issue 1: "relation does not exist" error
**Cause**: Table hasn't been created yet  
**Solution**: Run the complete schema script from `scripts/001-create-tables.sql`

### Issue 2: "permission denied" error
**Cause**: User doesn't have proper permissions  
**Solution**: Make sure you're connected as `postgres` user (superuser)

### Issue 3: Connection timeout
**Cause**: PostgreSQL service not running  
**Solution**: 
- Windows: Check Services → PostgreSQL service is running
- Mac: Check if postgres process is running
- Restart PostgreSQL service if needed

### Issue 4: Password authentication failed
**Cause**: Wrong password in .env.local  
**Solution**: Verify your postgres password matches `DB_PASSWORD=Nhd@2003`

## Next Steps

1. ✅ Run the SQL schema script
2. ✅ Verify all 4 tables are created
3. ✅ Test inserting data
4. ✅ Start your Next.js application: `npm run dev`
5. ✅ Try logging in with HR credentials:
   - Username: `admin` / Password: `admin123`
   - Username: `nuthanhd` / Password: `nuth1234`
   - Username: `hr_manager` / Password: `hradmin123`

## Running the Next.js Application

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Application will run on http://localhost:3000
```

The application will automatically connect to your PostgreSQL database using the credentials in `.env.local`.
