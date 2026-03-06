"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAnalysis, isAuthenticated } from "@/lib/api"

interface AnalysisData {
  totalEmployees: number
  totalAttrition: number
  attritionRate: number
  averageAge: number
  averageIncome: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  topRiskFactors: Array<{
    factor: string
    impact: number
    description: string
  }>
  departmentRisk: Array<{
    department: string
    risk: number
    employees: number
  }>
  recommendations: string[]
  hasData?: boolean
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
    if (rate >= 25) return "text-red-600"
    if (rate >= 15) return "text-amber-500"
    return "text-emerald-600"
  }

  const getRiskBgColor = (rate: number) => {
    if (rate >= 25) return "bg-gradient-to-r from-red-500 to-orange-500"
    if (rate >= 15) return "bg-gradient-to-r from-amber-500 to-yellow-500"
    return "bg-gradient-to-r from-emerald-500 to-teal-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
            </div>
            My Prediction Analysis
          </h1>
          <p className="text-muted-foreground mt-2">Deep insights from your employee predictions</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : !data || !data.hasData ? (
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center shadow-inner">
                <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Predictions Yet</h3>
              <p className="text-muted-foreground mb-6">Make some predictions to see your analysis insights here</p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  Make a Prediction
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">My Predictions</p>
                      <p className="text-3xl font-black text-indigo-600">{data.totalEmployees.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div
                  className={`h-1.5 ${data.attritionRate >= 20 ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
                />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${data.attritionRate >= 20 ? "bg-gradient-to-br from-red-500 to-orange-500" : "bg-gradient-to-br from-emerald-500 to-teal-500"}`}
                    >
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            data.attritionRate >= 20
                              ? "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                              : "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          }
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Attrition Rate</p>
                      <p className={`text-3xl font-black ${getRiskColor(data.attritionRate)}`}>{data.attritionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Avg Income</p>
                      <p className="text-2xl font-black text-green-600">${data.averageIncome.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500" />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Avg Age</p>
                      <p className="text-3xl font-black text-blue-600">{data.averageAge} yrs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-red-500 to-orange-500" />
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground font-medium mb-2">High Risk</p>
                  <p className="text-4xl font-black text-red-600">{data.highRiskCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.totalEmployees > 0 ? Math.round((data.highRiskCount / data.totalEmployees) * 100) : 0}% of
                    predictions
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-amber-500 to-yellow-500" />
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground font-medium mb-2">Medium Risk</p>
                  <p className="text-4xl font-black text-amber-600">{data.mediumRiskCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.totalEmployees > 0 ? Math.round((data.mediumRiskCount / data.totalEmployees) * 100) : 0}% of
                    predictions
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground font-medium mb-2">Low Risk</p>
                  <p className="text-4xl font-black text-emerald-600">{data.lowRiskCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {data.totalEmployees > 0 ? Math.round((data.lowRiskCount / data.totalEmployees) * 100) : 0}% of
                    predictions
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              {data.departmentRisk.length > 0 && (
                <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  <CardHeader>
                    <CardTitle>Department Risk Analysis</CardTitle>
                    <CardDescription>Attrition risk by department</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.departmentRisk.map((dept) => (
                      <div
                        key={dept.department}
                        className="space-y-2 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{dept.department}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{dept.employees} predictions</span>
                            <span className={`font-black text-lg ${getRiskColor(dept.risk)}`}>{dept.risk}%</span>
                          </div>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getRiskBgColor(dept.risk)}`}
                            style={{ width: `${Math.min(dept.risk * 3, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {data.topRiskFactors.length > 0 && (
                <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                  <CardHeader>
                    <CardTitle>Top Risk Factors</CardTitle>
                    <CardDescription>Key patterns in your predictions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {data.topRiskFactors.map((factor, index) => (
                        <li
                          key={index}
                          className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{factor.factor}</span>
                            <span className="text-red-600 font-bold">{factor.impact}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500" />
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Action items based on your predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 shadow">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
