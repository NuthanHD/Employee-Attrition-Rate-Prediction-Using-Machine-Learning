"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getHistory, deletePrediction, isAuthenticated, type Prediction } from "@/lib/api"
import { Input } from "@/components/ui/input"

export default function HistoryPage() {
  const router = useRouter()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [filteredPredictions, setFilteredPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getHistory()
      setPredictions(data)
      setFilteredPredictions(data)
    } catch (err) {
      console.error("Failed to fetch history:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }
    fetchHistory()
  }, [router, fetchHistory])

  useEffect(() => {
    const filtered = predictions.filter(
      (p) =>
        p.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.job_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.education && p.education.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    setFilteredPredictions(filtered)
  }, [searchTerm, predictions])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deletePrediction(id)
      setPredictions((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error("Failed to delete prediction:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
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
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            Prediction History
          </h1>
          <p className="text-muted-foreground mt-2">View and manage all your previous predictions</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <div>
              <CardTitle className="text-slate-800 dark:text-slate-200">All Predictions</CardTitle>
              <CardDescription>
                {predictions.length} total prediction{predictions.length !== 1 && "s"}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                placeholder="Search by ID, department, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            ) : filteredPredictions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner">
                  <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {searchTerm ? "No Matches Found" : "No Predictions Yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try a different search term" : "Make some predictions to see them here"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950">
                      <TableHead className="font-bold">Employee ID</TableHead>
                      <TableHead className="font-bold">Age</TableHead>
                      <TableHead className="font-bold">Department</TableHead>
                      <TableHead className="font-bold">Job Role</TableHead>
                      <TableHead className="font-bold">Income</TableHead>
                      <TableHead className="font-bold">Years</TableHead>
                      <TableHead className="font-bold">Prediction</TableHead>
                      <TableHead className="font-bold">Confidence</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPredictions.map((prediction) => (
                      <TableRow
                        key={prediction.id}
                        className="hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors"
                      >
                        <TableCell className="font-bold text-indigo-600">{prediction.employee_id}</TableCell>
                        <TableCell>{prediction.age}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{prediction.department}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{prediction.job_role}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatINR(prediction.monthly_income)}
                        </TableCell>
                        <TableCell>{prediction.years_at_company}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              prediction.prediction === "Yes"
                                ? "bg-gradient-to-r from-red-500 to-orange-500 text-white border-0 shadow"
                                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow"
                            }
                          >
                            {prediction.prediction === "Yes" ? "High Risk" : "Low Risk"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold">{(prediction.probability * 100).toFixed(1)}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {formatDate(prediction.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(prediction.id)}
                            disabled={deletingId === prediction.id}
                            className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950"
                          >
                            {deletingId === prediction.id ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
