"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { isAuthenticated, isHR, getAllEmployeeData, type EmployeeData } from "@/lib/api"
import {
  LineChartIcon,
  Loader2,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Building2,
  IndianRupee,
  Star,
  Briefcase,
  Clock,
} from "lucide-react"
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
  AreaChart,
  Area,
} from "recharts"

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"]

export default function AnalyticsPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<EmployeeData[]>([])
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
      const data = await getAllEmployeeData()
      setEmployees(data)
    } catch (error) {
      console.error("Failed to load employees:", error)
    } finally {
      setLoading(false)
    }
  }

  // Analytics calculations
  const totalEmployees = employees.length
  const predictedEmployees = employees.filter((emp) => emp.prediction_result)
  const atRiskEmployees = predictedEmployees.filter((emp) => emp.prediction_result === "Yes")
  const stableEmployees = predictedEmployees.filter((emp) => emp.prediction_result === "No")
  const pendingPredictions = totalEmployees - predictedEmployees.length

  const avgSatisfaction =
    employees.length > 0 ? employees.reduce((sum, emp) => sum + (emp.job_satisfaction || 3), 0) / employees.length : 0
  const avgIncome =
    employees.length > 0 ? employees.reduce((sum, emp) => sum + emp.monthly_income, 0) / employees.length : 0
  const avgAge = employees.length > 0 ? employees.reduce((sum, emp) => sum + emp.age, 0) / employees.length : 0
  const avgYears =
    employees.length > 0 ? employees.reduce((sum, emp) => sum + emp.years_at_company, 0) / employees.length : 0

  // Department distribution
  const departmentData = () => {
    const deptMap = new Map<string, { total: number; atRisk: number }>()
    employees.forEach((emp) => {
      const dept = emp.department || "Unknown"
      const current = deptMap.get(dept) || { total: 0, atRisk: 0 }
      current.total++
      if (emp.prediction_result === "Yes") current.atRisk++
      deptMap.set(dept, current)
    })
    return Array.from(deptMap.entries())
      .map(([name, data]) => ({
        name: name.length > 12 ? name.substring(0, 12) + "..." : name,
        total: data.total,
        atRisk: data.atRisk,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
  }

  // Risk distribution pie
  const riskDistribution = [
    { name: "Stable", value: stableEmployees.length, fill: "#10b981" },
    { name: "At Risk", value: atRiskEmployees.length, fill: "#ef4444" },
    { name: "Pending", value: pendingPredictions, fill: "#94a3b8" },
  ].filter((item) => item.value > 0)

  // Satisfaction distribution
  const satisfactionData = () => {
    const satMap = [0, 0, 0, 0, 0]
    employees.forEach((emp) => {
      const sat = emp.job_satisfaction || 3
      if (sat >= 1 && sat <= 5) {
        satMap[sat - 1]++
      }
    })
    return [
      { rating: "1 Star", count: satMap[0], fill: "#ef4444" },
      { rating: "2 Stars", count: satMap[1], fill: "#f97316" },
      { rating: "3 Stars", count: satMap[2], fill: "#f59e0b" },
      { rating: "4 Stars", count: satMap[3], fill: "#84cc16" },
      { rating: "5 Stars", count: satMap[4], fill: "#10b981" },
    ]
  }

  // Age group analysis
  const ageGroupData = () => {
    const groups: Record<string, number> = { "18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "55+": 0 }
    employees.forEach((emp) => {
      if (emp.age <= 25) groups["18-25"]++
      else if (emp.age <= 35) groups["26-35"]++
      else if (emp.age <= 45) groups["36-45"]++
      else if (emp.age <= 55) groups["46-55"]++
      else groups["55+"]++
    })
    return Object.entries(groups).map(([name, value]) => ({ name, value }))
  }

  // Income range analysis
  const incomeRangeData = () => {
    const ranges: Record<string, number> = { "<25K": 0, "25-50K": 0, "50-75K": 0, "75-100K": 0, "100K+": 0 }
    employees.forEach((emp) => {
      const income = emp.monthly_income
      if (income < 25000) ranges["<25K"]++
      else if (income < 50000) ranges["25-50K"]++
      else if (income < 75000) ranges["50-75K"]++
      else if (income < 100000) ranges["75-100K"]++
      else ranges["100K+"]++
    })
    return Object.entries(ranges).map(([name, value]) => ({ name, value }))
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
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-700 shadow-lg">
              <LineChartIcon className="w-8 h-8 text-white" />
            </div>
            Employee Analytics
          </h1>
          <p className="text-slate-500 mt-2">Comprehensive analysis of all {totalEmployees} employee(s)</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Employees</p>
                  <p className="text-3xl font-black text-slate-800">{totalEmployees}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">At Risk</p>
                  <p className="text-3xl font-black text-red-600">{atRiskEmployees.length}</p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Stable</p>
                  <p className="text-3xl font-black text-emerald-600">{stableEmployees.length}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-100">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Avg Satisfaction</p>
                  <p className="text-3xl font-black text-amber-600">{avgSatisfaction.toFixed(1)}</p>
                </div>
                <div className="p-3 rounded-full bg-amber-100">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {employees.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="py-16 text-center">
              <LineChartIcon className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600">No Employee Data Yet</h3>
              <p className="text-slate-400 mt-2">Employees need to submit their details first</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Risk Distribution Pie */}
            <Card className="shadow-lg border-0 bg-white overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Risk Distribution
                </CardTitle>
                <CardDescription>Overall attrition risk status of all employees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Satisfaction Distribution */}
            <Card className="shadow-lg border-0 bg-white overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-600" />
                  Job Satisfaction Distribution
                </CardTitle>
                <CardDescription>Employee satisfaction ratings (1-5 stars)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={satisfactionData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {satisfactionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Department Analysis */}
            <Card className="shadow-lg border-0 bg-white overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Department Analysis
                </CardTitle>
                <CardDescription>Employees and risk by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData()} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="atRisk" fill="#ef4444" name="At Risk" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Age Group Analysis */}
            <Card className="shadow-lg border-0 bg-white overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Age Group Distribution
                </CardTitle>
                <CardDescription>Employee count by age groups</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ageGroupData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#c4b5fd" name="Employees" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Income Range Analysis */}
            <Card className="shadow-lg border-0 bg-white overflow-hidden md:col-span-2">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-emerald-600" />
                  Income Range Distribution
                </CardTitle>
                <CardDescription>Employee count by monthly income ranges (INR)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeRangeData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} name="Employees">
                        {incomeRangeData().map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <Card className="shadow-lg border-0 bg-white overflow-hidden md:col-span-2">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Summary Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <IndianRupee className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                    <p className="text-sm text-slate-500">Average Income</p>
                    <p className="text-xl font-black text-blue-600">₹{Math.round(avgIncome).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <Clock className="w-6 h-6 mx-auto text-purple-600 mb-2" />
                    <p className="text-sm text-slate-500">Avg Experience</p>
                    <p className="text-xl font-black text-purple-600">{avgYears.toFixed(1)} years</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <Users className="w-6 h-6 mx-auto text-amber-600 mb-2" />
                    <p className="text-sm text-slate-500">Avg Age</p>
                    <p className="text-xl font-black text-amber-600">{avgAge.toFixed(0)} years</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl border border-red-100">
                    <AlertTriangle className="w-6 h-6 mx-auto text-red-600 mb-2" />
                    <p className="text-sm text-slate-500">Risk Rate</p>
                    <p className="text-xl font-black text-red-600">
                      {predictedEmployees.length > 0
                        ? ((atRiskEmployees.length / predictedEmployees.length) * 100).toFixed(0)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
