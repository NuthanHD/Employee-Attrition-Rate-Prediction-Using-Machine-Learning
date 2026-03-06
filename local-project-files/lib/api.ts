const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

export interface User {
  id: string
  username: string
  email: string
  is_admin: boolean
}

export interface AdminUser {
  id: string
  username: string
  email: string
  is_admin: boolean
  created_at: string
  prediction_count: number
}

export interface Prediction {
  id: string
  employee_id: string
  age: number
  department: string
  job_role: string
  monthly_income: number
  years_at_company: number
  gender: string
  job_satisfaction: number
  marital_status: string
  distance_from_home: number
  education: string
  prediction: string
  probability: number
  risk_level: string
  created_at: string
  user_id: string
}

export interface PredictionInput {
  user_id: string
  employee_id: string
  age: number
  department: string
  job_role: string
  monthly_income: number
  years_at_company: number
  gender: string
  job_satisfaction: number
  marital_status: string
  distance_from_home: number
  education: string
}

function getStoredUsers(): Map<string, { password: string; user: User; created_at: string }> {
  if (typeof window === "undefined") return new Map()
  try {
    const stored = localStorage.getItem("app_users")
    if (stored) {
      const arr = JSON.parse(stored)
      return new Map(arr)
    }
  } catch {
    // Ignore
  }
  const now = new Date().toISOString()
  const defaultUsers = new Map<string, { password: string; user: User; created_at: string }>([
    [
      "demo",
      {
        password: "demo123",
        user: { id: "1", username: "demo", email: "demo@example.com", is_admin: false },
        created_at: now,
      },
    ],
    [
      "admin",
      {
        password: "admin123",
        user: { id: "2", username: "admin", email: "admin@example.com", is_admin: true },
        created_at: now,
      },
    ],
  ])
  saveStoredUsers(defaultUsers)
  return defaultUsers
}

function saveStoredUsers(users: Map<string, { password: string; user: User; created_at: string }>) {
  if (typeof window === "undefined") return
  localStorage.setItem("app_users", JSON.stringify(Array.from(users.entries())))
}

function getStoredPredictions(): Prediction[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("app_predictions")
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

function saveStoredPredictions(predictions: Prediction[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("app_predictions", JSON.stringify(predictions))
}

export async function register(username: string, email: string, password: string) {
  const users = getStoredUsers()
  if (users.has(username)) throw new Error("Username already exists")
  const newUser: User = { id: Date.now().toString(), username, email, is_admin: false }
  users.set(username, { password, user: newUser, created_at: new Date().toISOString() })
  saveStoredUsers(users)
  localStorage.setItem("user", JSON.stringify(newUser))
  return { message: "Registration successful", user: newUser }
}

export async function login(username: string, password: string) {
  const users = getStoredUsers()
  const userData = users.get(username)
  if (!userData || userData.password !== password) throw new Error("Invalid credentials")
  localStorage.setItem("user", JSON.stringify(userData.user))
  return { message: "Login successful", user: userData.user }
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem("user")
}

export function getCurrentUser(): User | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user")
    return user ? JSON.parse(user) : null
  }
  return null
}

export function isAuthenticated(): boolean {
  return !!getCurrentUser()
}

export async function predict(input: PredictionInput): Promise<Prediction> {
  let riskScore = 0
  if (input.age < 25) riskScore += 25
  else if (input.age < 30) riskScore += 15
  else if (input.age < 35) riskScore += 10
  if (input.job_satisfaction === 1) riskScore += 30
  else if (input.job_satisfaction === 2) riskScore += 15
  else if (input.job_satisfaction === 3) riskScore += 5
  if (input.years_at_company < 2) riskScore += 20
  else if (input.years_at_company < 5) riskScore += 10
  if (input.distance_from_home > 20) riskScore += 15
  else if (input.distance_from_home > 10) riskScore += 5
  if (input.monthly_income < 30000) riskScore += 20
  else if (input.monthly_income < 50000) riskScore += 10
  if (input.marital_status === "Single") riskScore += 10

  const probability = Math.min(Math.max(riskScore / 100, 0.05), 0.95)
  const prediction = probability > 0.5 ? "Yes" : "No"
  const riskLevel = probability > 0.7 ? "High" : probability > 0.4 ? "Medium" : "Low"

  const newPrediction: Prediction = {
    id: Date.now().toString(),
    ...input,
    prediction,
    probability: Math.round(probability * 100),
    risk_level: riskLevel,
    created_at: new Date().toISOString(),
  }

  const predictions = getStoredPredictions()
  predictions.unshift(newPrediction)
  saveStoredPredictions(predictions)
  return newPrediction
}

export async function getHistory(): Promise<Prediction[]> {
  const user = getCurrentUser()
  if (!user) throw new Error("Not authenticated")
  const predictions = getStoredPredictions()
  return predictions.filter((p) => p.user_id === user.id)
}

export async function deletePrediction(id: string) {
  const predictions = getStoredPredictions()
  const filtered = predictions.filter((p) => p.id !== id)
  saveStoredPredictions(filtered)
  return { message: "Prediction deleted" }
}

export async function getChartsData() {
  const user = getCurrentUser()
  if (!user) throw new Error("Not authenticated")
  const predictions = getStoredPredictions().filter((p) => p.user_id === user.id)
  if (predictions.length === 0) {
    return { departmentDistribution: [], riskDistribution: [], summary: { totalEmployees: 0 }, hasData: false }
  }
  return { hasData: true, summary: { totalEmployees: predictions.length } }
}

export async function getAnalysis() {
  const user = getCurrentUser()
  if (!user) throw new Error("Not authenticated")
  const predictions = getStoredPredictions().filter((p) => p.user_id === user.id)

  if (predictions.length === 0) {
    return {
      totalEmployees: 0,
      totalAttrition: 0,
      attritionRate: 0,
      averageAge: 0,
      averageIncome: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      topRiskFactors: [],
      departmentRisk: [],
      recommendations: ["Start by making predictions to see analytics"],
      hasData: false,
    }
  }

  const totalPredictions = predictions.length
  const attritionYes = predictions.filter((p) => p.prediction === "Yes").length
  const attritionRate = Math.round((attritionYes / totalPredictions) * 1000) / 10
  const avgAge = Math.round((predictions.reduce((sum, p) => sum + p.age, 0) / totalPredictions) * 10) / 10
  const avgIncome = Math.round(predictions.reduce((sum, p) => sum + p.monthly_income, 0) / totalPredictions)
  const highRiskCount = predictions.filter((p) => p.risk_level === "High").length
  const mediumRiskCount = predictions.filter((p) => p.risk_level === "Medium").length
  const lowRiskCount = predictions.filter((p) => p.risk_level === "Low").length

  const deptMap = new Map<string, { total: number; attrition: number }>()
  predictions.forEach((p) => {
    const current = deptMap.get(p.department) || { total: 0, attrition: 0 }
    current.total++
    if (p.prediction === "Yes") current.attrition++
    deptMap.set(p.department, current)
  })
  const departmentRisk = Array.from(deptMap.entries()).map(([department, data]) => ({
    department,
    risk: Math.round((data.attrition / data.total) * 1000) / 10,
    employees: data.total,
  }))

  const recommendations: string[] = []
  if (highRiskCount > 0) recommendations.push(`Review ${highRiskCount} high-risk employee(s)`)
  if (attritionRate > 20) recommendations.push("Consider broad retention initiatives")
  if (recommendations.length === 0) recommendations.push("Continue monitoring employee satisfaction")

  const topRiskFactors = []
  if (highRiskCount > 0) {
    topRiskFactors.push({
      factor: "High Risk Employees",
      impact: Math.round((highRiskCount / totalPredictions) * 100),
      description: `${highRiskCount} employees are high risk`,
    })
  }

  return {
    totalEmployees: totalPredictions,
    totalAttrition: attritionYes,
    attritionRate,
    averageAge: avgAge,
    averageIncome: avgIncome,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    topRiskFactors,
    departmentRisk,
    recommendations,
    hasData: true,
  }
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const users = getStoredUsers()
  const predictions = getStoredPredictions()
  const adminUsers: AdminUser[] = []
  users.forEach((data) => {
    const userPredictions = predictions.filter((p) => p.user_id === data.user.id)
    adminUsers.push({
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      is_admin: data.user.is_admin,
      created_at: data.created_at || new Date().toISOString(),
      prediction_count: userPredictions.length,
    })
  })
  return adminUsers
}

export async function deleteUser(id: string) {
  const users = getStoredUsers()
  let usernameToDelete: string | null = null
  users.forEach((data, username) => {
    if (data.user.id === id) usernameToDelete = username
  })
  if (usernameToDelete) {
    users.delete(usernameToDelete)
    saveStoredUsers(users)
  }
  return { message: "User deleted" }
}
