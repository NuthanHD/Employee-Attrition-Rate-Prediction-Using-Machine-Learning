// PostgreSQL Database Configuration for Employee Attrition Prediction
// Supports PostgreSQL with the provided credentials

import postgres from "postgres"

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "employee_attrition",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "Pg@2025",
  ssl: process.env.DB_SSL === "true" ? "require" : false,
}

// Check if we should use PostgreSQL
const usePostgres = process.env.DATABASE_URL || process.env.DB_HOST

// Create SQL client
let sql: ReturnType<typeof postgres> | null = null

function getSql() {
  if (typeof window !== "undefined") return null
  if (!usePostgres) return null

  if (!sql) {
    if (process.env.DATABASE_URL) {
      sql = postgres(process.env.DATABASE_URL, {
        ssl: process.env.DB_SSL === "true" ? "require" : false,
        max: 20,
        idle_timeout: 30,
        connect_timeout: 10,
      })
    } else {
      sql = postgres({
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        username: dbConfig.username,
        password: dbConfig.password,
        ssl: dbConfig.ssl as any,
        max: 20,
        idle_timeout: 30,
        connect_timeout: 10,
      })
    }
  }
  return sql
}

// Check if database is available
export function isDatabaseEnabled(): boolean {
  return Boolean(usePostgres)
}

// Query helper function
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const sql = getSql()
  if (!sql) throw new Error("Database not configured")
  const result = await sql.unsafe(text, params)
  return result as T[]
}

// Single row query helper
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

// Close connection
export async function closeConnection(): Promise<void> {
  if (sql) {
    await sql.end()
    sql = null
  }
}

// HR User operations
export const dbHRUsers = {
  // Validate HR login - only authorized HRs can login
  async validate(username: string, password: string) {
    return queryOne(
      `SELECT id, username, email, full_name FROM hr_users 
       WHERE username = $1 AND password_hash = $2 AND is_active = true`,
      [username, password],
    )
  },

  async findByUsername(username: string) {
    return queryOne("SELECT * FROM hr_users WHERE username = $1", [username])
  },

  async findByEmail(email: string) {
    return queryOne("SELECT * FROM hr_users WHERE email = $1", [email])
  },

  async getAll() {
    return query("SELECT id, username, email, full_name, created_at FROM hr_users WHERE is_active = true")
  },
}

// Employee operations
export const dbEmployees = {
  async create(username: string, email: string, password: string, fullName: string, contactNumber: string) {
    return queryOne(
      `INSERT INTO employees (username, email, password_hash, full_name, contact_number) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, username, email, full_name, contact_number`,
      [username, email, password, fullName, contactNumber],
    )
  },

  async validate(username: string, password: string) {
    return queryOne(
      `SELECT id, username, email, full_name, contact_number FROM employees 
       WHERE username = $1 AND password_hash = $2 AND is_active = true`,
      [username, password],
    )
  },

  async findByUsername(username: string) {
    return queryOne("SELECT * FROM employees WHERE username = $1", [username])
  },

  async findByEmail(email: string) {
    return queryOne("SELECT * FROM employees WHERE email = $1", [email])
  },

  async getById(id: number) {
    return queryOne("SELECT * FROM employees WHERE id = $1", [id])
  },
}

// Employee Data operations
export const dbEmployeeData = {
  async create(employeeId: number, data: any) {
    return queryOne(
      `INSERT INTO employee_data (
        employee_id, full_name, age, contact_number, gender, education,
        department, job_role, monthly_income, years_at_company,
        distance_from_home, marital_status, is_submitted, submitted_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        employeeId,
        data.full_name,
        data.age,
        data.contact_number,
        data.gender,
        data.education,
        data.department,
        data.job_role,
        data.monthly_income,
        data.years_at_company,
        data.distance_from_home,
        data.marital_status,
      ],
    )
  },

  async getById(id: number) {
    return queryOne("SELECT * FROM employee_data WHERE id = $1", [id])
  },

  async getByEmployeeId(employeeId: number) {
    return queryOne("SELECT * FROM employee_data WHERE employee_id = $1 ORDER BY created_at DESC LIMIT 1", [employeeId])
  },

  async getAllSubmitted() {
    return query(
      `SELECT ed.*, e.username as employee_username, e.email as employee_email
       FROM employee_data ed
       JOIN employees e ON ed.employee_id = e.id
       WHERE ed.is_submitted = true
       ORDER BY ed.submitted_at DESC`,
    )
  },

  async updatePrediction(
    id: number,
    prediction: string,
    probability: number,
    riskLevel: string,
    jobSatisfaction: number,
  ) {
    return queryOne(
      `UPDATE employee_data SET 
        prediction_result = $1, 
        prediction_probability = $2, 
        risk_level = $3,
        job_satisfaction = $4,
        predicted_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [prediction, probability, riskLevel, jobSatisfaction, id],
    )
  },
}

// Predictions operations
export const dbPredictions = {
  async create(
    employeeDataId: number,
    hrUserId: number,
    prediction: string,
    probability: number,
    riskLevel: string,
    riskFactors: string[],
  ) {
    return queryOne(
      `INSERT INTO predictions (employee_data_id, hr_user_id, prediction, probability, risk_level, risk_factors)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [employeeDataId, hrUserId, prediction, probability, riskLevel, riskFactors],
    )
  },

  async getAll() {
    return query(
      `SELECT p.*, ed.full_name, ed.department, ed.job_role 
       FROM predictions p
       JOIN employee_data ed ON p.employee_data_id = ed.id
       ORDER BY p.created_at DESC`,
    )
  },
}
