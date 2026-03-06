const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api"

export interface User {
  id: string
  username: string
  email: string
  is_admin: boolean
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

export async function register(username: string, email: string, password: string) {
  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Registration failed")
  }

  // Store user in localStorage
  if (typeof window !== "undefined" && data.user) {
    localStorage.setItem("user", JSON.stringify(data.user))
  }

  return data
}

export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Login failed")
  }

  if (typeof window !== "undefined" && data.user) {
    localStorage.setItem("user", JSON.stringify(data.user))
  }

  return data
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
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

export async function predict(input: PredictionInput) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Prediction failed")
  }

  return data
}

export async function getHistory(): Promise<Prediction[]> {
  const user = getCurrentUser()
  if (!user) throw new Error("Not authenticated")

  const response = await fetch(`${API_BASE}/history?user_id=${user.id}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch history")
  }

  return data
}

export async function deletePrediction(id: string) {
  const response = await fetch(`${API_BASE}/history/${id}`, {
    method: "DELETE",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete prediction")
  }

  return data
}

export async function getChartsData() {
  const user = getCurrentUser()
  if (!user) throw new Error("Not authenticated")

  const response = await fetch(`${API_BASE}/charts?user_id=${user.id}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch charts data")
  }

  return data
}

export async function getAnalysis() {
  const user = getCurrentUser()
  if (!user) throw new Error("Not authenticated")

  const response = await fetch(`${API_BASE}/analysis?user_id=${user.id}`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch analysis")
  }

  return data
}

export async function getAdminUsers() {
  const response = await fetch(`${API_BASE}/admin/users`)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch users")
  }

  return data
}

export async function deleteUser(id: string) {
  const response = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: "DELETE",
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || "Failed to delete user")
  }

  return data
}
