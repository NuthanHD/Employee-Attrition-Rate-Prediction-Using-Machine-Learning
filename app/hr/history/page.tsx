"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { isAuthenticated, isHR, getPredictedEmployees, deleteEmployeeData, type EmployeeData } from "@/lib/api"
import {
  History,
  Loader2,
  User,
  Calendar,
  Building2,
  Briefcase,
  IndianRupee,
  AlertTriangle,
  CheckCircle,
  Star,
  Clock,
  Phone,
  MapPin,
  GraduationCap,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function HistoryPage() {
  const router = useRouter()
  const { toast } = useToast() // Added toast for notifications
  const [predictions, setPredictions] = useState<EmployeeData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null) // Added delete confirmation state

  useEffect(() => {
    if (!isAuthenticated() || !isHR()) {
      router.push("/login")
      return
    }
    loadPredictions()
  }, [router])

  const loadPredictions = async () => {
    try {
      const data = await getPredictedEmployees()
      setPredictions(data)
    } catch (error) {
      console.error("Failed to load predictions:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderStars = (rating?: number) => {
    const stars = rating || 0
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`w-4 h-4 ${i <= stars ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
        ))}
      </div>
    )
  }

  const handleDelete = async (employeeId: string) => {
    try {
      await deleteEmployeeData(employeeId)
      await loadPredictions()
      toast({
        title: "Deleted",
        description: "Employee history has been removed.",
      })
      setDeleteId(null)
    } catch (error) {
      console.error("Delete failed:", error)
      toast({
        title: "Delete Failed",
        description: "Unable to delete employee history.",
        variant: "destructive",
      })
    }
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
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 shadow-lg">
              <History className="w-8 h-8 text-white" />
            </div>
            Prediction History
          </h1>
          <p className="text-slate-500 mt-2">View all past attrition predictions ({predictions.length} records)</p>
        </div>

        {predictions.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="py-16 text-center">
              <History className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600">No Predictions Yet</h3>
              <p className="text-slate-400 mt-2">Go to the Employees page and click Predict on employee records</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {predictions.map((emp) => (
              <Card
                key={emp.id}
                className="shadow-lg border-0 bg-white overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div
                  className={`h-1.5 ${
                    emp.prediction_result === "Yes"
                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500"
                  }`}
                />
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Employee Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`p-3 rounded-full ${
                            emp.prediction_result === "Yes" ? "bg-red-100" : "bg-emerald-100"
                          }`}
                        >
                          {emp.prediction_result === "Yes" ? (
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          ) : (
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-slate-800">{emp.full_name}</h3>
                          <p className="text-sm text-slate-500">{emp.employee_email}</p>
                        </div>
                        <Badge
                          className={`ml-auto text-sm px-3 py-1 ${
                            emp.prediction_result === "Yes"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {emp.prediction_result === "Yes" ? "At Risk" : "Stable"} - {emp.prediction_probability}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>
                            <strong>Age:</strong> {emp.age} years
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <Phone className="w-4 h-4 text-blue-600" />
                          <span>
                            <strong>Contact:</strong> {emp.contact_number}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <span className="truncate">
                            <strong>Edu:</strong> {emp.education}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span className="truncate">
                            <strong>Dept:</strong> {emp.department}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                          <span className="truncate">
                            <strong>Role:</strong> {emp.job_role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <IndianRupee className="w-4 h-4 text-blue-600" />
                          <span>
                            <strong>Income:</strong> {formatINR(emp.monthly_income)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>
                            <strong>Years:</strong> {emp.years_at_company}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>
                            <strong>Distance:</strong> {emp.distance_from_home} km
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium">Satisfaction:</span>
                          {renderStars(emp.job_satisfaction)}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">Predicted: {formatDate(emp.predicted_at)}</span>
                        </div>
                      </div>

                      {/* Risk Factors */}
                      {emp.risk_factors && emp.risk_factors.length > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs font-semibold text-amber-700 mb-2">Risk Factors:</p>
                          <div className="flex flex-wrap gap-2">
                            {emp.risk_factors.map((factor, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prediction Result Box */}
                    <div className="flex flex-col gap-4">
                      <div
                        className={`p-6 rounded-xl min-w-[160px] text-center flex flex-col justify-center ${
                          emp.prediction_result === "Yes"
                            ? "bg-red-50 border border-red-200"
                            : "bg-emerald-50 border border-emerald-200"
                        }`}
                      >
                        <p className="text-xs text-slate-500 uppercase font-medium">Risk Level</p>
                        <p
                          className={`text-2xl font-black mt-1 ${
                            emp.risk_level === "High"
                              ? "text-red-600"
                              : emp.risk_level === "Medium"
                                ? "text-amber-600"
                                : "text-emerald-600"
                          }`}
                        >
                          {emp.risk_level || "N/A"}
                        </p>
                        <p className="text-4xl font-black mt-2">{emp.prediction_probability}%</p>
                        <p className="text-xs text-slate-500 mt-1">Probability</p>
                      </div>

                      <Button onClick={() => setDeleteId(emp.id)} variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this employee's history? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-red-500 hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}
