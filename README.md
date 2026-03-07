Employee Attrition Rate Prediction Using Machine Learning

A comprehensive web application for predicting employee attrition and managing HR analytics. The system helps organizations identify at-risk employees and take proactive measures to improve retention.

Features

For Employees

- **User Dashboard** - View personal information and job details
- **Job Satisfaction Rating** - Rate job satisfaction using a 5-star rating system
- **Profile Management** - Update personal and professional information
- **Attrition Risk Assessment** - Get predictions on attrition likelihood

For HR Managers

- **Employee Management** - View, add, and delete employee records
- **Attrition Predictions** - Predict which employees are at risk of leaving
- **Analytics Dashboard** - Visualize employee data and attrition trends
- **Employee History** - Track prediction history and employee changes
- **Charts & Analytics** - Interactive charts showing department insights, age groups, salary distribution, and more

 Getting Started

Prerequisites
- Node.js 18+ 
- PostgreSQL 12+ (optional, can use localStorage for local testing)
- pgAdmin (for database management)

Installation

1. **Clone and Install Dependencies**
```bash
npm install
```

2. **Set Up Environment Variables**
Create a `.env.local` file with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_attrition
DB_USER=postgres
DB_PASSWORD=Pg@2025
DB_SSL=false
```

3. **Start the Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

Database Setup

 Using PostgreSQL with pgAdmin

1. **Create Database in pgAdmin**
   - Open pgAdmin (http://localhost:5050)
   - Right-click "Databases" → Create → Database
   - Name: `employee_attrition`
   - Click Save

2. **Run Database Scripts**
   - In pgAdmin, go to your database → Query Tool
   - Copy and run the SQL scripts in order:
     - `scripts/001-create-tables.sql` - Creates all required tables
     - `scripts/005-insert-sample-data.sql` - Inserts sample employee data
   
3. **Verify Database**
   - In pgAdmin, expand your database and check the Tables:
     - `employees` - Employee basic info and predictions
     - `employee_data` - Detailed employee data submissions
     - `prediction_history` - Records of all predictions made

 Using localStorage (Default)
If PostgreSQL is not configured, the app automatically falls back to browser localStorage:
- Data persists locally in your browser
- Perfect for testing and development
- Data is lost when browser cache is cleared

 User Roles

Employee
- Login with employee credentials
- View and update personal information
- Submit job satisfaction rating
- See attrition risk status
- Access personal dashboard

HR Manager
- Login with HR credentials
- Manage all employee records
- Run attrition predictions
- View analytics and charts
- Track prediction history
- Delete employee records

 Key Pages

 `/` - Landing Page

Overview and login/register options for both employees and HR managers
![image alt](https://github.com/NuthanHD/Employee-Attrition-Rate-Prediction-Using-Machine-Learning/blob/9fc4b3c2300ccd5e7142cc4bfc6aff387eee50eb/Images/HR%20Login.png)

`/employee/dashboard` - Employee Dashboard

- Personal information form
- Job satisfaction rating (5-star system)
- Attrition prediction results
- Profile update capability

`/hr/dashboard` - HR Dashboard

- Add new employee records
- Quick statistics on employee base
- Quick access to other HR sections

 `/hr/employees` - Employee Management

- View all employees with their basic info and attrition status
- Click employee to view full details
- Predict attrition for individual employees
- Delete employee records

`/hr/history` - Prediction History

- Track all predictions made
- View historical data and changes
- Delete historical records

`/hr/charts` - Analytics Charts

- Department distribution
- Age group analysis
- Job role distribution
- Salary ranges
- Gender distribution

 `/hr/analytics` - Advanced Analytics

- Attrition risk analysis by department
- Job satisfaction correlation
- Years of service analysis
- Income distribution insights

Data Validation

 Age and Work Experience

- Minimum age: 18 years
- Maximum work experience: `(Age - 18)` years
- Example: 19-year-old can have max 1 year experience, 25-year-old can have max 7 years

Education and Job Role Requirements

**Technical Roles** (require B.Tech/B.E, M.Tech/M.E, MCA, or BCA):
- Engineering Manager
- Research Scientist
- Senior Developer
- Scientist
- Developer

**Mid-Level Roles** (require 12th pass or higher):
- Sales Representative
- Sales Executive
- Finance Manager
- Analyst
- HR Administrator

**Entry-Level Roles** (require 10th pass or higher):
- Sales Representative
- Analyst

Attrition Prediction Model

The system predicts employee attrition based on:
- Age and tenure
- Job role and department
- Job satisfaction rating
- Income level
- Education background
- Marital status
- Distance from workplace
- Years at current company

Risk categories:
- **At Risk (>50%)** - Red badge, high probability of leaving
- **Stable (20-50%)** - Yellow badge, moderate stability
- **Stable (<20%)** - Green badge, low risk of attrition

Technical Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (optional, localStorage fallback)
- **Database Client**: pg (Node.js PostgreSQL driver)
- **Charts**: Recharts
- **Form Handling**: React Hook Form
- **Notifications**: Sonner (Toast notifications)

Database Schema

employees Table
sql
- id: Primary key
- name: Employee name
- age: Age in years
- gender: Male/Female
- education: Education level
- department: Department name
- jobRole: Job position
- yearsAtCompany: Tenure in years
- jobSatisfaction: 1-5 rating
- maritalStatus: Marital status
- distanceFromHome: Distance in km
- monthlyIncome: Monthly salary
- attritionRisk: Prediction percentage
- predictedAt: Last prediction timestamp


 employee_data Table

sql

- id: Primary key
- name: Employee name
- age: Age in years
- contact: Phone number
- education: Education level
- jobRole: Job position
- yearsAtCompany: Years at company
- jobSatisfaction: Star rating (1-5)
- department: Department
- maritalStatus: Marital status
- income: Monthly income
- distance: Distance from home
- gender: Gender
- submittedAt: Submission timestamp


 Troubleshooting

 Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify credentials in `.env.local`
3. Check database exists: `SELECT datname FROM pg_database;` in pgAdmin
4. Verify tables exist: Check Schemas → public → Tables in pgAdmin

 No Employees Showing
1. Check browser localStorage: Open DevTools (F12) → Application → Local Storage
2. Or check pgAdmin database for data in `employee_data` table
3. If empty, insert sample data using `scripts/005-insert-sample-data.sql`

Prediction Failing
- Verify age ≥ 18 and work experience ≤ (age - 18)
- Verify education matches job role requirements
- Check browser console for specific error messages

Data Not Persisting
- If using localStorage: Don't clear browser cache
- If using PostgreSQL: Verify database connection in `.env.local`
- Check pgAdmin for table data

API Routes

- `POST /api/auth/login-employee` - Employee login
- `POST /api/auth/register-employee` - Employee registration
- `POST /api/employee/submit-data` - Submit employee data
- `POST /api/hr/predict` - Run attrition prediction
- `GET /api/hr/employees` - Get all employees
- `DELETE /api/hr/employees` - Delete employee record

 UI/UX Features

- Responsive design for desktop and tablet
- Toast notifications for user feedback
- Loading states and skeleton screens
- Confirmation dialogs for destructive actions
- Form validation with clear error messages
- Star rating component for satisfaction
- Interactive charts and analytics
- Dark-friendly color scheme

Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

 License

This project is proprietary software.

Support

For issues or questions, refer to:
- `TROUBLESHOOTING.md` - Common issues and solutions
- `DATABASE_SETUP_GUIDE.md` - Database setup instructions
- `PGADMIN_SETUP_INSTRUCTIONS.md` - pgAdmin configuration guide

Deployment



1. **Connect GitHub Repository**
   - Push code to GitHub
   - Connect repository 
2. **Set Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add database credentials:
     - `DB_HOST`
     - `DB_PORT`
     - `DB_NAME`
     - `DB_USER`
     - `DB_PASSWORD`
     - `DB_SSL`

 Example Workflow

1. **HR Manager** adds new employees via `/hr/dashboard`
2. **Employee** logs in and updates profile, rates satisfaction
3. **HR Manager** views employees at `/hr/employees`
4. **HR Manager** clicks "Predict" to get attrition risk for each employee
5. **HR Manager** reviews predictions and history at `/hr/history`
6. **HR Manager** analyzes trends at `/hr/charts` and `/hr/analytics`
7. **HR Manager** takes action on high-risk employees (retention strategies)
8. **System** tracks all predictions for future analysis

