"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/star-rating"
import { useToast } from "@/hooks/use-toast"
import {
  isAuthenticated,
  isHR,
  getAllEmployeeData,
  predictAttrition,
  deleteEmployeeData,
  type EmployeeData,
} from "@/lib/api"
import {
  Users,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  User,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  IndianRupee,
  GraduationCap,
  Heart,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

export default function EmployeeDetailsPage() {
  const router = useRouter()
  const { toast } = useToast() // Added toast for notifications
  const [employees, setEmployees] = useState<EmployeeData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(null)
  const [jobSatisfaction, setJobSatisfaction] = useState(3)
  const [predicting, setPredicting] = useState(false)
  const [predictionResult, setPredictionResult] = useState<{
    prediction: string
    probability: number
    risk_level: string
    risk_factors: string[]
  } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null) // Added delete confirmation state

  useEffect(() => {
    if (!isAuthenticated() || !isHR()) {
      router.push("/login")
      return
    }
    loadEmployees()
  }, [router])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      console.log("[v0] Checking localStorage for employee data...")
      if (typeof window !== "undefined") {
        const storedData = localStorage.getItem("employee_data")
        console.log("[v0] Raw localStorage data:", storedData)
        if (storedData) {
          const parsed = JSON.parse(storedData)
          console.log("[v0] Parsed employee count:", parsed.length)
        }
      }

      const data = await getAllEmployeeData()
      console.log("[v0] Loaded employees:", data.length)
      setEmployees(data)
    } catch (error) {
      console.error("Failed to load employees:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePredict = async () => {
    if (!selectedEmployee) return
    setPredicting(true)
    setPredictionResult(null)

    try {
      const result = await predictAttrition(selectedEmployee.id, jobSatisfaction)
      setPredictionResult(result)
      await loadEmployees()
      toast({
        title: "Prediction Complete",
        description: `Attrition risk: ${result.risk_level} (${result.probability}%)`,
      })
    } catch (error) {
      console.error("Prediction failed:", error)
      toast({
        title: "Prediction Failed",
        description: "Unable to predict attrition. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPredicting(false)
    }
  }

  const handleDelete = async (employeeId: string) => {
    try {
      await deleteEmployeeData(employeeId)
      await loadEmployees()
      toast({
        title: "Deleted",
        description: "Employee data has been removed.",
      })
      setDeleteId(null)
    } catch (error) {
      console.error("Delete failed:", error)
      toast({
        title: "Delete Failed",
        description: "Unable to delete employee data.",
        variant: "destructive",
      })
    }
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.job_role?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            Employee Details
          </h1>
          <p className="text-slate-500 mt-2">
            View all submitted employee data and predict attrition ({employees.length} employees)
          </p>
        </div>

        {/* Search Bar and Refresh */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by name, department, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 border-slate-200 focus:border-blue-600"
            />
          </div>
          <Button onClick={loadEmployees} variant="outline" className="gap-2 h-12 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {employees.length === 0 ? (
          <Card className="shadow-xl border-0 bg-white">
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600">No Employee Data Yet</h3>
              <p className="text-slate-400 mt-2">Employees need to submit their details from their dashboard</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredEmployees.map((emp) => (
              <Card
                key={emp.id}
                className="shadow-lg border-0 bg-white hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div
                  className={`h-1 ${emp.prediction_result === "Yes" ? "bg-red-500" : emp.prediction_result === "No" ? "bg-emerald-500" : "bg-slate-300"}`}
                />
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 uppercase">Name</p>
                        <p className="font-semibold text-slate-800">{emp.full_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase">Age</p>
                        <p className="font-medium text-slate-700">{emp.age} years</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase">Department</p>
                        <p className="font-medium text-slate-700 truncate">{emp.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase">Job Role</p>
                        <p className="font-medium text-slate-700 truncate">{emp.job_role}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase">Income</p>
                        <p className="font-medium text-slate-700">{formatINR(emp.monthly_income)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase">Status</p>
                        {emp.prediction_result ? (
                          <Badge
                            variant={emp.prediction_result === "Yes" ? "destructive" : "default"}
                            className={
                              emp.prediction_result === "No"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : ""
                            }
                          >
                            {emp.prediction_result === "Yes" ? "At Risk" : "Stable"} ({emp.prediction_probability}%)
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedEmployee(emp)
                          setJobSatisfaction(emp.job_satisfaction || 3)
                          setPredictionResult(null)
                        }}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
                      >
                        <Sparkles className="w-4 h-4" />
                        Predict
                      </Button>
                      <Button
                        onClick={() => setDeleteId(emp.id)}
                        variant="destructive"
                        size="icon"
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Prediction Dialog */}
        <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Predict Attrition for {selectedEmployee?.full_name}
              </DialogTitle>
              <DialogDescription>
                Review employee details and set job satisfaction rating to predict attrition risk
              </DialogDescription>
            </DialogHeader>

            {selectedEmployee && (
              <div className="space-y-6 py-4">
                {/* Employee Details Grid */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Name:</strong> {selectedEmployee.full_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Age:</strong> {selectedEmployee.age} years
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Contact:</strong> {selectedEmployee.contact_number}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Gender:</strong> {selectedEmployee.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Education:</strong> {selectedEmployee.education}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Department:</strong> {selectedEmployee.department}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Job Role:</strong> {selectedEmployee.job_role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Income:</strong> {formatINR(selectedEmployee.monthly_income)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Years:</strong> {selectedEmployee.years_at_company}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Distance:</strong> {selectedEmployee.distance_from_home} km
                    </span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <Heart className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Marital Status:</strong> {selectedEmployee.marital_status}
                    </span>
                  </div>
                </div>

                {/* Job Satisfaction Star Rating */}
                <div className="space-y-3 p-5 rounded-xl bg-amber-50 border border-amber-200">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Set Job Satisfaction Rating (1-5 Stars)
                  </label>
                  <StarRating value={jobSatisfaction} onChange={setJobSatisfaction} size="lg" />
                  <p className="text-xs text-amber-600">
                    {jobSatisfaction === 1 && "Very Dissatisfied"}
                    {jobSatisfaction === 2 && "Dissatisfied"}
                    {jobSatisfaction === 3 && "Neutral"}
                    {jobSatisfaction === 4 && "Satisfied"}
                    {jobSatisfaction === 5 && "Very Satisfied"}
                  </p>
                </div>

                {/* Predict Button */}
                <Button
                  onClick={handlePredict}
                  disabled={predicting}
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 h-12 font-bold"
                >
                  {predicting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Predict Attrition
                    </>
                  )}
                </Button>

                {/* Prediction Result */}
                {predictionResult && (
                  <div
                    className={`p-6 rounded-xl ${
                      predictionResult.prediction === "Yes"
                        ? "bg-red-50 border border-red-200"
                        : "bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    <div className="text-center mb-4">
                      <div
                        className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                          predictionResult.prediction === "Yes"
                            ? "bg-red-100 text-red-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {predictionResult.prediction === "Yes" ? (
                          <AlertTriangle className="w-8 h-8" />
                        ) : (
                          <CheckCircle className="w-8 h-8" />
                        )}
                      </div>
                      <h3
                        className={`text-xl font-bold ${
                          predictionResult.prediction === "Yes" ? "text-red-700" : "text-emerald-700"
                        }`}
                      >
                        {predictionResult.prediction === "Yes" ? "High Attrition Risk" : "Low Attrition Risk"}
                      </h3>
                      <p className="text-3xl font-black mt-1">{predictionResult.probability}%</p>
                      <Badge
                        className={`mt-2 ${
                          predictionResult.risk_level === "High"
                            ? "bg-red-200 text-red-800"
                            : predictionResult.risk_level === "Medium"
                              ? "bg-amber-200 text-amber-800"
                              : "bg-emerald-200 text-emerald-800"
                        }`}
                      >
                        {predictionResult.risk_level} Risk
                      </Badge>
                    </div>

                    {predictionResult.risk_factors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-slate-700 mb-2">Risk Factors:</h4>
                        <ul className="space-y-1">
                          {predictionResult.risk_factors.map((factor, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-slate-500 mt-4 text-center">
                      This prediction has been saved. View it in the History page.
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this employee's data? This action cannot be undone.
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
