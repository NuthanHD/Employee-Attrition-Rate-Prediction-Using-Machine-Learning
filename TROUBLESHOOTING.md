# Database Connection Troubleshooting Guide

## Issue: Predictions Not Saving to Database

### Step 1: Verify Database Connection
Check your browser console (F12) for debug messages starting with `[v0]`:
- `[v0] Database enabled: true` - Good, database is configured
- `[v0] Database enabled: false` - Database not configured, check .env.local

### Step 2: Check .env.local File
Ensure your `.env.local` file exists in project root with:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_attrition
DB_USER=postgres
DB_PASSWORD=Nhd@2003
DB_SSL=false
```

### Step 3: Restart Development Server
After changing .env.local, ALWAYS restart:
```bash
# Press Ctrl+C to stop the server
npm run dev
```

### Step 4: Verify Data in Database
Run in pgAdmin:
```sql
-- Check employees in database
SELECT COUNT(*) FROM employee_data;

-- Check predictions
SELECT * FROM predictions ORDER BY created_at DESC LIMIT 5;

-- Check latest employee data with predictions
SELECT id, full_name, department, prediction_result, prediction_probability 
FROM employee_data 
ORDER BY created_at DESC LIMIT 10;
```

### Step 5: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for `[v0]` messages when you click Predict
4. You should see:
   - `[v0] Starting prediction for employee: X`
   - `[v0] Database enabled: true`
   - `[v0] Prediction saved successfully`

### Step 6: Common Issues

**Issue:** "Employee data not found"
- The employee exists in localStorage but not in database
- Solution: Employees need to be in the `employee_data` table

**Issue:** "Database not configured"
- .env.local file missing or incorrect
- Solution: Create/fix .env.local and restart server

**Issue:** Connection timeout
- PostgreSQL not running
- Solution: Start PostgreSQL service in pgAdmin

### Testing the Connection

Run this in your browser console after logging in:
```javascript
// Check if database is enabled
fetch('/api/hr/employees').then(r => r.json()).then(console.log)
```

You should see employee data if the connection works.
