"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getChartsData, isAuthenticated } from "@/lib/api"
import { BarChart3, Loader2, PieChart, TrendingUp, TrendingDown, Users } from "lucide-react"
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

interface ChartsData {
  total: number
  attrition_yes: number
  attrition_no: number
  department_data: Record<string, { yes: number; no: number }>
  satisfaction_data: Record<string, { yes: number; no: number }>
}

export default function ChartsPage() {
  const router = useRouter()
  const [data, setData] = useState<ChartsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const chartsData = await getChartsData()
      setData(chartsData)
    } catch (err) {
      console.error("Failed to fetch charts data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }
    fetchData()
  }, [router, fetchData])

  const COLORS = {
    yes: "#ef4444",
    no: "#22c55e",
  }

  const pieData =
    data && data.total > 0
      ? [
          { name: "Will Leave", value: data.attrition_yes || 0, color: COLORS.yes },
          { name: "Will Stay", value: data.attrition_no || 0, color: COLORS.no },
        ]
      : []

  const departmentData =
    data && data.department_data
      ? Object.entries(data.department_data).map(([name, values]) => ({
          name: name.length > 12 ? name.substring(0, 12) + "..." : name,
          fullName: name,
          "High Risk": values?.yes || 0,
          "Low Risk": values?.no || 0,
        }))
      : []

  const satisfactionData =
    data && data.satisfaction_data
      ? Object.entries(data.satisfaction_data)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([level, values]) => ({
            name: level === "1" ? "Low" : level === "2" ? "Medium" : level === "3" ? "High" : "Very High",
            "High Risk": values?.yes || 0,
            "Low Risk": values?.no || 0,
          }))
      : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            Prediction Charts
          </h1>
          <p className="text-muted-foreground mt-2">Visual analysis of your prediction data</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : !data || data.total === 0 ? (
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner">
                <PieChart className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Predictions Yet</h3>
              <p className="text-muted-foreground">Make some predictions to see your charts here.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total Predictions</p>
                      <p className="text-4xl font-black text-indigo-600">{data.total}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">High Risk</p>
                      <p className="text-4xl font-black text-red-600">{data.attrition_yes}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <TrendingDown className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Low Risk</p>
                      <p className="text-4xl font-black text-emerald-600">{data.attrition_no}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts - Fixed width/height issues */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-indigo-600" />
                    Attrition Distribution
                  </CardTitle>
                  <CardDescription>Overall prediction breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[320px]">
                    {pieData.length > 0 && pieData.some((d) => d.value > 0) ? (
                      <RechartsPie width={400} height={300}>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Department Bar Chart */}
              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    By Department
                  </CardTitle>
                  <CardDescription>Predictions grouped by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[320px]">
                    {departmentData.length > 0 ? (
                      <BarChart width={400} height={300} data={departmentData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="High Risk" fill={COLORS.yes} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Low Risk" fill={COLORS.no} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No department data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Satisfaction Bar Chart */}
              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden lg:col-span-2">
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    By Job Satisfaction Level
                  </CardTitle>
                  <CardDescription>How job satisfaction correlates with attrition risk</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[320px]">
                    {satisfactionData.length > 0 ? (
                      <BarChart width={800} height={300} data={satisfactionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="High Risk" fill={COLORS.yes} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Low Risk" fill={COLORS.no} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No satisfaction data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
