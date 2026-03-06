"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getHistory, isAuthenticated, type Prediction } from "@/lib/api"
import Link from "next/link"

export default function ChartsPage() {
  const router = useRouter()
  const [latestPrediction, setLatestPrediction] = useState<Prediction | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const history = await getHistory()
      if (history.length > 0) {
        setLatestPrediction(history[0])
      }
    } catch (err) {
      console.error("Failed to fetch prediction data:", err)
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

  const getRiskColor = (probability: number) => {
    if (probability > 70) return "text-red-600"
    if (probability > 40) return "text-amber-500"
    return "text-emerald-600"
  }

  const getRiskBg = (probability: number) => {
    if (probability > 70) return "from-red-500 to-orange-500"
    if (probability > 40) return "from-amber-500 to-yellow-500"
    return "from-emerald-500 to-teal-500"
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            Employee Chart
          </h1>
          <p className="text-muted-foreground mt-2">Visual representation of the latest prediction</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : !latestPrediction ? (
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center shadow-inner">
                <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Predictions Yet</h3>
              <p className="text-muted-foreground mb-6">Make a prediction to see your employee chart here</p>
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                  Make a Prediction
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Employee Info Card */}
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${getRiskBg(latestPrediction.probability)}`} />
              <CardHeader>
                <CardTitle>Employee: {latestPrediction.employee_id}</CardTitle>
                <CardDescription>
                  {latestPrediction.job_role} - {latestPrediction.department}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="text-2xl font-bold text-indigo-600">{latestPrediction.age}</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <p className="text-sm text-muted-foreground">Income</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{latestPrediction.monthly_income.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <p className="text-sm text-muted-foreground">Years</p>
                    <p className="text-2xl font-bold text-blue-600">{latestPrediction.years_at_company}</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <p className="text-sm text-muted-foreground">Satisfaction</p>
                    <p className="text-2xl font-bold text-purple-600">{latestPrediction.job_satisfaction}/4</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Gauge */}
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <div className={`h-1.5 bg-gradient-to-r ${getRiskBg(latestPrediction.probability)}`} />
              <CardHeader>
                <CardTitle>Attrition Risk</CardTitle>
                <CardDescription>Probability of employee leaving</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center py-8">
                  <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${latestPrediction.probability * 2.51} 251`}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop
                            offset="0%"
                            stopColor={
                              latestPrediction.probability > 70
                                ? "#ef4444"
                                : latestPrediction.probability > 40
                                  ? "#f59e0b"
                                  : "#10b981"
                            }
                          />
                          <stop
                            offset="100%"
                            stopColor={
                              latestPrediction.probability > 70
                                ? "#f97316"
                                : latestPrediction.probability > 40
                                  ? "#fbbf24"
                                  : "#14b8a6"
                            }
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-black ${getRiskColor(latestPrediction.probability)}`}>
                        {latestPrediction.probability}%
                      </span>
                      <span className="text-sm text-muted-foreground">{latestPrediction.risk_level} Risk</span>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-lg font-semibold">
                      Prediction:{" "}
                      <span className={getRiskColor(latestPrediction.probability)}>
                        {latestPrediction.prediction === "Yes" ? "Likely to Leave" : "Likely to Stay"}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <CardHeader>
                <CardTitle>Employee Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-semibold">{latestPrediction.gender}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-muted-foreground">Marital Status</p>
                    <p className="font-semibold">{latestPrediction.marital_status}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-muted-foreground">Distance from Home</p>
                    <p className="font-semibold">{latestPrediction.distance_from_home} km</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-muted-foreground">Education</p>
                    <p className="font-semibold">{latestPrediction.education || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <p className="text-xs text-muted-foreground">Created At</p>
                    <p className="font-semibold">{new Date(latestPrediction.created_at).toLocaleDateString()}</p>
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
