"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAnalysis, isAuthenticated } from "@/lib/api"
import {
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertTriangle,
  Users,
  IndianRupee,
  Clock,
  Building2,
  Heart,
  PieChart,
  Lightbulb,
  Target,
} from "lucide-react"

interface AnalysisData {
  summary: {
    total_employees: number
    at_risk: number
    attrition_rate: number
    avg_satisfaction: number
    avg_tenure: number
    avg_income: number
  }
  risk_factors: string[]
  recommendations: string[]
  department_analysis: Array<{
    department: string
    total_employees: number
    at_risk: number
    attrition_rate: number
    avg_satisfaction: number
    avg_income: number
  }>
  satisfaction_analysis: Array<{
    level: number
    label: string
    count: number
    at_risk: number
    attrition_rate: number
  }>
}

export default function AnalysisPage() {
  const router = useRouter()
  const [data, setData] = useState<AnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const analysisData = await getAnalysis()
      setData(analysisData)
    } catch (err) {
      console.error("Failed to fetch analysis:", err)
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

  const getRiskColor = (rate: number) => {
    if (rate >= 50) return "text-red-600"
    if (rate >= 25) return "text-amber-500"
    return "text-emerald-600"
  }

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <PieChart className="w-8 h-8 text-white" />
            </div>
            Company Analysis
          </h1>
          <p className="text-muted-foreground mt-2">Deep insights based on your prediction history</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : !data || data.summary.total_employees === 0 ? (
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner">
                <PieChart className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Analysis Data</h3>
              <p className="text-muted-foreground">Make some predictions first to see company analysis.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Total Analyzed</p>
                      <p className="text-3xl font-black text-indigo-600">{data.summary.total_employees}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div
                  className={`h-1.5 ${data.summary.attrition_rate >= 30 ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
                />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                        data.summary.attrition_rate >= 30
                          ? "bg-gradient-to-br from-red-500 to-orange-500"
                          : "bg-gradient-to-br from-emerald-500 to-teal-500"
                      }`}
                    >
                      {data.summary.attrition_rate >= 30 ? (
                        <TrendingDown className="w-7 h-7 text-white" />
                      ) : (
                        <TrendingUp className="w-7 h-7 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Attrition Rate</p>
                      <p className={`text-3xl font-black ${getRiskColor(data.summary.attrition_rate)}`}>
                        {data.summary.attrition_rate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <IndianRupee className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Avg Income</p>
                      <p className="text-2xl font-black text-green-600">{formatINR(data.summary.avg_income)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <Clock className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Avg Tenure</p>
                      <p className="text-3xl font-black text-blue-600">{data.summary.avg_tenure} yrs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department and Satisfaction Analysis */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    Department Risk Analysis
                  </CardTitle>
                  <CardDescription>Attrition risk by department</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.department_analysis.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No department data</p>
                  ) : (
                    data.department_analysis.map((dept) => (
                      <div
                        key={dept.department}
                        className="space-y-2 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{dept.department}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{dept.total_employees} employees</span>
                            <span className={`font-black text-lg ${getRiskColor(dept.attrition_rate)}`}>
                              {dept.attrition_rate}%
                            </span>
                          </div>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              dept.attrition_rate >= 50
                                ? "bg-gradient-to-r from-red-500 to-orange-500"
                                : dept.attrition_rate >= 25
                                  ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                                  : "bg-gradient-to-r from-emerald-500 to-teal-500"
                            }`}
                            style={{ width: `${Math.min(dept.attrition_rate, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Job Satisfaction Analysis */}
              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    Satisfaction Impact
                  </CardTitle>
                  <CardDescription>How satisfaction affects attrition</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.satisfaction_analysis.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No satisfaction data</p>
                  ) : (
                    data.satisfaction_analysis.map((level) => (
                      <div
                        key={level.level}
                        className="space-y-2 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-pink-50 dark:from-slate-800 dark:to-pink-950 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            Level {level.level} ({level.label})
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{level.count} employees</span>
                            <span className={`font-black text-lg ${getRiskColor(level.attrition_rate)}`}>
                              {level.attrition_rate}%
                            </span>
                          </div>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              level.attrition_rate >= 50
                                ? "bg-gradient-to-r from-red-500 to-orange-500"
                                : level.attrition_rate >= 25
                                  ? "bg-gradient-to-r from-amber-500 to-yellow-500"
                                  : "bg-gradient-to-r from-emerald-500 to-teal-500"
                            }`}
                            style={{ width: `${Math.min(level.attrition_rate, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Risk Factors and Recommendations */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Risk Factors */}
              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Key Risk Factors
                  </CardTitle>
                  <CardDescription>Identified patterns affecting attrition</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.risk_factors.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Target className="w-8 h-8 text-emerald-600" />
                      </div>
                      <p className="text-muted-foreground font-medium">No significant risk factors identified</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {data.risk_factors.map((factor, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800"
                        >
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mt-1.5 flex-shrink-0 shadow" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-emerald-600" />
                    Recommendations
                  </CardTitle>
                  <CardDescription>Action items to improve retention</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {data.recommendations.map((rec, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800"
                      >
                        <span className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 mt-1.5 flex-shrink-0 shadow" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
