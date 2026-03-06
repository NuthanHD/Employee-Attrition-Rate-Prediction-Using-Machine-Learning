"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isAuthenticated, isHR, getPredictedEmployees, type EmployeeData } from "@/lib/api"
import { BarChart3, Loader2, User, Star, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

export default function ChartsPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated() || !isHR()) {
      router.push("/login")
      return
    }
    loadEmployees()
  }, [router])

  const loadEmployees = async () => {
    try {
      const data = await getPredictedEmployees()
      setEmployees(data)
      if (data.length > 0) {
        setSelectedEmployeeId(data[0].id)
      }
    } catch (error) {
      console.error("Failed to load employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const currentEmployee = employees.find((emp) => emp.id === selectedEmployeeId)

  // Prepare chart data for selected employee
  const getRiskFactorsData = () => {
    if (!currentEmployee) return []

    return [
      {
        name: "Age Risk",
        value: currentEmployee.age < 25 ? 80 : currentEmployee.age < 30 ? 60 : currentEmployee.age < 40 ? 40 : 20,
        fill: "#3b82f6",
      },
      {
        name: "Satisfaction",
        value: (currentEmployee.job_satisfaction || 3) * 20,
        fill: "#f59e0b",
      },
      {
        name: "Income Level",
        value: Math.min((currentEmployee.monthly_income / 100000) * 100, 100),
        fill: "#10b981",
      },
      {
        name: "Experience",
        value: Math.min(currentEmployee.years_at_company * 12, 100),
        fill: "#8b5cf6",
      },
      {
        name: "Commute Score",
        value: Math.max(100 - currentEmployee.distance_from_home * 2.5, 10),
        fill: "#ef4444",
      },
    ]
  }

  const getPredictionPieData = () => {
    if (!currentEmployee) return []
    const probability = currentEmployee.prediction_probability || 50
    return [
      { name: "Risk", value: probability, fill: "#ef4444" },
      { name: "Safe", value: 100 - probability, fill: "#10b981" },
    ]
  }

  const getRadarData = () => {
    if (!currentEmployee) return []
    return [
      { factor: "Age", value: currentEmployee.age < 25 ? 30 : currentEmployee.age < 35 ? 60 : 80, fullMark: 100 },
      { factor: "Satisfaction", value: (currentEmployee.job_satisfaction || 3) * 20, fullMark: 100 },
      { factor: "Income", value: Math.min((currentEmployee.monthly_income / 80000) * 100, 100), fullMark: 100 },
      { factor: "Experience", value: Math.min(currentEmployee.years_at_company * 15, 100), fullMark: 100 },
      { factor: "Commute", value: Math.max(100 - currentEmployee.distance_from_home * 3, 10), fullMark: 100 },
      { factor: "Stability", value: currentEmployee.marital_status === "Married" ? 80 : 50, fullMark: 100 },
    ]
  }

  const renderStars = (rating?: number) => {
    const stars = rating || 0
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-5 h-5 ${i <= stars ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
        ))}
      </div>
    )
  }

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            Employee Prediction Charts
          </h1>
          <p className="text-slate-500 mt-2">View detailed prediction charts for individual employees</p>
        </div>

        {employees.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="py-16 text-center">
              <BarChart3 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600">No Predictions Available</h3>
              <p className="text-slate-400 mt-2">Go to Employees page and predict attrition first</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Employee Selector */}
            <Card className="shadow-lg border-0 bg-white mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Select Employee to View Charts
                    </label>
                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                      <SelectTrigger className="w-full md:w-96">
                        <User className="w-4 h-4 mr-2 text-blue-600" />
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name} - {emp.department} ({emp.prediction_result === "Yes" ? "At Risk" : "Stable"}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {currentEmployee && (
                    <div className="flex items-center gap-4">
                      <div
                        className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                          currentEmployee.prediction_result === "Yes"
                            ? "bg-red-100 text-red-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {currentEmployee.prediction_result === "Yes" ? (
                          <AlertTriangle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        <span className="font-bold">
                          {currentEmployee.prediction_result === "Yes" ? "At Risk" : "Stable"}
                        </span>
                        <span className="font-black">{currentEmployee.prediction_probability}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Satisfaction:</span>
                        {renderStars(currentEmployee.job_satisfaction)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {currentEmployee && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Prediction Pie Chart */}
                <Card className="shadow-lg border-0 bg-white overflow-hidden">
                  <div
                    className={`h-1.5 ${
                      currentEmployee.prediction_result === "Yes"
                        ? "bg-gradient-to-r from-red-500 to-orange-500"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500"
                    }`}
                  />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {currentEmployee.prediction_result === "Yes" ? (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      )}
                      Attrition Risk Distribution
                    </CardTitle>
                    <CardDescription>Probability of {currentEmployee.full_name} leaving</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getPredictionPieData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {getPredictionPieData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="text-center mt-4 p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500">Risk Probability</p>
                      <p
                        className={`text-4xl font-black ${currentEmployee.prediction_result === "Yes" ? "text-red-600" : "text-emerald-600"}`}
                      >
                        {currentEmployee.prediction_probability}%
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Factors Bar Chart */}
                <Card className="shadow-lg border-0 bg-white overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Risk Factor Analysis
                    </CardTitle>
                    <CardDescription>Score breakdown of contributing factors (higher is better)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getRiskFactorsData()} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="name" type="category" width={100} />
                          <Tooltip formatter={(value) => `${value}/100`} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {getRiskFactorsData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Radar Chart */}
                <Card className="shadow-lg border-0 bg-white overflow-hidden md:col-span-2">
                  <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-purple-600" />
                      Employee Profile Radar
                    </CardTitle>
                    <CardDescription>
                      Multi-dimensional analysis of {currentEmployee.full_name} (higher values are better)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={getRadarData()}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="factor" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name={currentEmployee.full_name}
                            dataKey="value"
                            stroke="#8b5cf6"
                            fill="#8b5cf6"
                            fillOpacity={0.5}
                          />
                          <Tooltip />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Employee Details Summary */}
                <Card className="shadow-lg border-0 bg-white overflow-hidden md:col-span-2">
                  <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      {currentEmployee.full_name} - Complete Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400">Age</p>
                        <p className="font-bold text-lg">{currentEmployee.age} years</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400">Gender</p>
                        <p className="font-bold text-lg">{currentEmployee.gender}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400">Education</p>
                        <p className="font-bold text-sm">{currentEmployee.education}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400">Department</p>
                        <p className="font-bold text-sm">{currentEmployee.department}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400">Job Role</p>
                        <p className="font-bold text-sm">{currentEmployee.job_role}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400">Monthly Income</p>
                        <p className="font-bold text-lg">{formatINR(currentEmployee.monthly_income)}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400">Years at Company</p>
                        <p className="font-bold text-lg">{currentEmployee.years_at_company}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400">Distance from Home</p>
                        <p className="font-bold text-lg">{currentEmployee.distance_from_home} km</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400">Marital Status</p>
                        <p className="font-bold text-lg">{currentEmployee.marital_status}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400">Contact</p>
                        <p className="font-bold text-sm">{currentEmployee.contact_number}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                        <p className="text-xs text-slate-400">Job Satisfaction</p>
                        <div className="mt-1">{renderStars(currentEmployee.job_satisfaction)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
