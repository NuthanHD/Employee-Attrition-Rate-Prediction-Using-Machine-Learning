// API Client for Employee Attrition Prediction System
// Handles authentication and data management for HR and Employees

const API_BASE = "/api"

// Types
export interface HRUser {
  id: string
  username: string
  email: string
  full_name: string
  role: "hr"
}

export interface Employee {
  id: string
  username: string
  email: string
  full_name: string
  contact_number: string
  role: "employee"
}

export type User = HRUser | Employee

export interface EmployeeData {
  id: string
  employee_id: string
  full_name: string
  age: number
  contact_number: string
  gender: string
  education: string
  department: string
  job_role: string
  monthly_income: number
  years_at_company: number
  distance_from_home: number
  marital_status: string
  job_satisfaction?: number
  prediction_result?: string
  prediction_probability?: number
  risk_level?: string
  risk_factors?: string[]
  is_submitted: boolean
  submitted_at?: string
  predicted_at?: string
  employee_username?: string
  employee_email?: string
}

// Authorized HR credentials (hardcoded for validation)
const AUTHORIZED_HRS = [
  { username: "hr_manager", email: "manager4@gmail.com", password: "hradmin123", full_name: "Chaitra" },
  { username: "nuthanhd", email: "nuthanhd6@gmail.com", password: "nuth1234", full_name: "Nuthan" },
  { username: "admin", email: "admin3@gmail.com", password: "admin123", full_name: "Rajshekar" },
]

// Local storage helpers
function getStoredEmployees(): Map<string, { password: string; user: Employee }> {
  if (typeof window === "undefined") return new Map()
  try {
    const stored = localStorage.getItem("employees")
    if (stored) return new Map(JSON.parse(stored))
  } catch {}
  return new Map()
}

function saveStoredEmployees(employees: Map<string, { password: string; user: Employee }>) {
  if (typeof window === "undefined") return
  localStorage.setItem("employees", JSON.stringify(Array.from(employees.entries())))
}

function getStoredEmployeeData(): EmployeeData[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("employee_data")
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

function saveStoredEmployeeData(data: EmployeeData[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("employee_data", JSON.stringify(data))
}

// HR Login - only authorized HRs
export async function loginHR(username: string, password: string): Promise<{ user: HRUser }> {
  const hr = AUTHORIZED_HRS.find((h) => h.username === username && h.password === password)

  if (!hr) {
    throw new Error("Invalid HR credentials. Only authorized HR personnel can access this system.")
  }

  const user: HRUser = {
    id: username,
    username: hr.username,
    email: hr.email,
    full_name: hr.full_name,
    role: "hr",
  }

  localStorage.setItem("user", JSON.stringify(user))
  return { user }
}

// Employee Registration
export async function registerEmployee(
  username: string,
  email: string,
  password: string,
  fullName: string,
  contactNumber: string,
): Promise<{ user: Employee }> {
  const employees = getStoredEmployees()

  if (employees.has(username)) {
    throw new Error("Username already exists")
  }

  // Check if email exists
  for (const [, empData] of employees) {
    if (empData.user.email === email) {
      throw new Error("Email already exists")
    }
  }

  const user: Employee = {
    id: `emp_${Date.now()}`,
    username,
    email,
    full_name: fullName,
    contact_number: contactNumber,
    role: "employee",
  }

  employees.set(username, { password, user })
  saveStoredEmployees(employees)

  return { user }
}

// Employee Login
export async function loginEmployee(username: string, password: string): Promise<{ user: Employee }> {
  const employees = getStoredEmployees()
  const employeeData = employees.get(username)

  if (!employeeData || employeeData.password !== password) {
    throw new Error("Invalid employee credentials")
  }

  localStorage.setItem("user", JSON.stringify(employeeData.user))
  return { user: employeeData.user }
}

// Logout
export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}

// Get current user
export function getCurrentUser(): User | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  }
  return null
}

// Check if authenticated
export function isAuthenticated(): boolean {
  return !!getCurrentUser()
}

// Check if user is HR
export function isHR(): boolean {
  const user = getCurrentUser()
  return user?.role === "hr"
}

// Check if user is Employee
export function isEmployee(): boolean {
  const user = getCurrentUser()
  return user?.role === "employee"
}

// Submit Employee Data
export async function submitEmployeeData(
  data: Omit<EmployeeData, "id" | "employee_id" | "is_submitted" | "submitted_at">,
): Promise<EmployeeData> {
  const user = getCurrentUser()
  if (!user || user.role !== "employee") throw new Error("Not authorized")

  const employeeDataList = getStoredEmployeeData()

  // Check if employee already submitted data
  const existingIndex = employeeDataList.findIndex((d) => d.employee_id === user.id)

  const newData: EmployeeData = {
    ...data,
    id: existingIndex >= 0 ? employeeDataList[existingIndex].id : `data_${Date.now()}`,
    employee_id: user.id,
    is_submitted: true,
    submitted_at: new Date().toISOString(),
    employee_username: user.username,
    employee_email: user.email,
  }

  if (existingIndex >= 0) {
    // Update existing data
    employeeDataList[existingIndex] = { ...employeeDataList[existingIndex], ...newData }
  } else {
    // Add new data
    employeeDataList.push(newData)
  }

  saveStoredEmployeeData(employeeDataList)
  return newData
}

// Get all employee data (for HR)
export async function getAllEmployeeData(): Promise<EmployeeData[]> {
  const user = getCurrentUser()
  if (!user || user.role !== "hr") throw new Error("Not authorized")

  return getStoredEmployeeData().filter((d) => d.is_submitted)
}

// Get predicted employees only (for History)
export async function getPredictedEmployees(): Promise<EmployeeData[]> {
  const user = getCurrentUser()
  if (!user || user.role !== "hr") throw new Error("Not authorized")

  return getStoredEmployeeData()
    .filter((d) => d.is_submitted && d.prediction_result)
    .sort((a, b) => {
      const dateA = a.predicted_at ? new Date(a.predicted_at).getTime() : 0
      const dateB = b.predicted_at ? new Date(b.predicted_at).getTime() : 0
      return dateB - dateA
    })
}

// Get employee's own data
export async function getMyData(): Promise<EmployeeData | null> {
  const user = getCurrentUser()
  if (!user || user.role !== "employee") throw new Error("Not authorized")

  const allData = getStoredEmployeeData()
  return allData.find((d) => d.employee_id === user.id) || null
}

// Predict attrition (for HR)
export async function predictAttrition(
  employeeDataId: string,
  jobSatisfaction: number,
): Promise<{
  prediction: string
  probability: number
  risk_level: string
  risk_factors: string[]
}> {
  const user = getCurrentUser()
  if (!user || user.role !== "hr") throw new Error("Not authorized")

  const allData = getStoredEmployeeData()
  const empData = allData.find((d) => d.id === employeeDataId)

  if (!empData) {
    throw new Error("Employee data not found")
  }

  const response = await fetch("/api/hr/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      employeeDataId: employeeDataId,
      employeeData: empData,
      hrUserId: 1,
      jobSatisfaction,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Prediction API call failed")
  }

  const result = await response.json()

  const index = allData.findIndex((d) => d.id === employeeDataId)
  if (index !== -1) {
    allData[index] = {
      ...allData[index],
      job_satisfaction: jobSatisfaction,
      prediction_result: result.prediction,
      prediction_probability: result.probability,
      risk_level: result.risk_level,
      risk_factors: result.risk_factors,
      predicted_at: new Date().toISOString(),
    }
    saveStoredEmployeeData(allData)
  }

  return result
}

// Delete Employee Data (for HR)
export async function deleteEmployeeData(employeeDataId: string): Promise<void> {
  const user = getCurrentUser()
  if (!user || user.role !== "hr") throw new Error("Not authorized")

  const allData = getStoredEmployeeData()
  const updatedData = allData.filter((d) => d.id !== employeeDataId)
  saveStoredEmployeeData(updatedData)
}
