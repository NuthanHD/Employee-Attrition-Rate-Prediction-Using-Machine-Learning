"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { isAuthenticated, isHR, getCurrentUser, type EmployeeData } from "@/lib/api"
import { StarRating } from "@/components/star-rating"
import { validateEmployeeForm } from "@/lib/validation"
import {
  Brain,
  User,
  Building2,
  Briefcase,
  IndianRupee,
  Calendar,
  MapPin,
  GraduationCap,
  Heart,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
} from "lucide-react"

function getStoredEmployeeData(): EmployeeData[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("employee_data")
    if (stored) return JSON.parse(stored)
  } catch {}
  return []
}

function saveStoredEmployeeData(data: EmployeeData[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("employee_data", JSON.stringify(data))
}

const departments = [
  "Sales",
  "Research & Development",
  "Human Resources",
  "Marketing",
  "IT",
  "Finance",
  "Operations",
  "Customer Service",
  "Engineering",
  "Product Management",
  "DevOps & Cloud",
  "Technical Support",
]

const jobRoles = [
  "Sales Executive",
  "Research Scientist",
  "Laboratory Technician",
  "Manufacturing Director",
  "Healthcare Representative",
  "Manager",
  "Sales Representative",
  "Research Director",
  "Human Resources",
  "Software Engineer",
  "Senior Developer",
  "Junior Developer",
  "Data Analyst",
  "Product Manager",
  "Team Lead",
  "Engineering Manager",
  "Cloud Architect",
  "DevOps Engineer",
  "Senior QA Engineer",
  "Technical Lead",
]

const educationLevels = [
  "Below College",
  "PUC (12th)",
  "Diploma",
  "Degree (B.A/B.Com/B.Sc)",
  "BCA",
  "B.Tech/B.E",
  "MCA",
  "Masters (M.A/M.Com/M.Sc)",
  "M.Tech/M.E",
  "PhD/Doctorate",
]

export default function HRDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ full_name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    prediction: string
    probability: number
    risk_level: string
    risk_factors: string[]
  } | null>(null)

  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    age: 30,
    gender: "Male",
    education: "Degree (B.A/B.Com/B.Sc)",
    department: "Sales",
    job_role: "Sales Executive",
    monthly_income: 50000,
    years_at_company: 3,
    distance_from_home: 10,
    marital_status: "Single",
    contact_number: "",
    job_satisfaction: 3,
  })

  useEffect(() => {
    if (!isAuthenticated() || !isHR()) {
      router.push("/login")
      return
    }
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser({ full_name: currentUser.full_name })
    }
  }, [router])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateEmployeeForm({
      age: formData.age,
      years_at_company: formData.years_at_company,
      job_role: formData.job_role,
      education: formData.education,
    })

    if (!validation.isValid) {
      alert(validation.error)
      return
    }

    setIsLoading(true)

    try {
      let riskScore = 0
      const riskFactors: string[] = []

      // Age factor
      if (formData.age < 25) {
        riskScore += 25
        riskFactors.push("Young employee (under 25)")
      } else if (formData.age < 30) {
        riskScore += 15
        riskFactors.push("Early career (25-30)")
      }

      // Job satisfaction (1-5 stars)
      if (formData.job_satisfaction === 1) {
        riskScore += 35
        riskFactors.push("Very low job satisfaction (1 star)")
      } else if (formData.job_satisfaction === 2) {
        riskScore += 25
        riskFactors.push("Low job satisfaction (2 stars)")
      } else if (formData.job_satisfaction === 3) {
        riskScore += 10
        riskFactors.push("Average job satisfaction (3 stars)")
      }

      // Years at company
      if (formData.years_at_company < 2) {
        riskScore += 20
        riskFactors.push("New to company (less than 2 years)")
      } else if (formData.years_at_company < 5) {
        riskScore += 10
        riskFactors.push("Less than 5 years at company")
      }

      // Distance from home
      if (formData.distance_from_home > 25) {
        riskScore += 20
        riskFactors.push("Long commute (over 25 km)")
      } else if (formData.distance_from_home > 15) {
        riskScore += 10
        riskFactors.push("Moderate commute (15-25 km)")
      }

      // Income factor
      if (formData.monthly_income < 25000) {
        riskScore += 25
        riskFactors.push("Below average income")
      } else if (formData.monthly_income < 40000) {
        riskScore += 15
        riskFactors.push("Moderate income level")
      }

      // Marital status
      if (formData.marital_status === "Single") {
        riskScore += 10
        riskFactors.push("Single status")
      }

      const probability = Math.min(Math.max(riskScore, 5), 95)
      const prediction = probability >= 50 ? "Yes" : "No"
      const risk_level = probability >= 70 ? "High" : probability >= 40 ? "Medium" : "Low"

      const allData = getStoredEmployeeData()
      const newPrediction: EmployeeData = {
        id: `pred_${Date.now()}`,
        employee_id: formData.employee_id || `EMP_${Date.now()}`,
        full_name: formData.full_name,
        age: formData.age,
        contact_number: formData.contact_number || "N/A",
        gender: formData.gender,
        education: formData.education,
        department: formData.department,
        job_role: formData.job_role,
        monthly_income: formData.monthly_income,
        years_at_company: formData.years_at_company,
        distance_from_home: formData.distance_from_home,
        marital_status: formData.marital_status,
        job_satisfaction: formData.job_satisfaction,
        prediction_result: prediction,
        prediction_probability: probability,
        risk_level: risk_level,
        risk_factors: riskFactors,
        is_submitted: true,
        submitted_at: new Date().toISOString(),
        predicted_at: new Date().toISOString(),
        employee_username: "hr_manual_entry",
        employee_email: "manual@entry.com",
      }

      allData.push(newPrediction)
      saveStoredEmployeeData(allData)

      setResult({
        prediction,
        probability,
        risk_level,
        risk_factors: riskFactors,
      })
    } catch (err) {
      console.error("Prediction failed:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      employee_id: "",
      full_name: "",
      age: 30,
      gender: "Male",
      education: "Degree (B.A/B.Com/B.Sc)",
      department: "Sales",
      job_role: "Sales Executive",
      monthly_income: 50000,
      years_at_company: 3,
      distance_from_home: 10,
      marital_status: "Single",
      contact_number: "",
      job_satisfaction: 3,
    })
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            Prediction Dashboard
          </h1>
          <p className="text-slate-500 mt-2">
            Welcome back, <span className="font-semibold text-blue-600">{user?.full_name}</span>! Manually enter
            employee details to predict attrition.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Prediction Form */}
          <Card className="lg:col-span-2 shadow-xl border-0 bg-white overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Employee Attrition Prediction Form
              </CardTitle>
              <CardDescription>Enter employee details to predict attrition risk (saves to History)</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Employee ID */}
                  <div className="space-y-2">
                    <Label htmlFor="employee_id" className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Employee ID
                    </Label>
                    <Input
                      id="employee_id"
                      value={formData.employee_id}
                      onChange={(e) => handleInputChange("employee_id", e.target.value)}
                      placeholder="E.g., EMP001"
                      className="h-11"
                    />
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Full Name *
                    </Label>
                    <Input
                      id="full_name"
                      required
                      value={formData.full_name}
                      onChange={(e) => handleInputChange("full_name", e.target.value)}
                      placeholder="Employee full name"
                      className="h-11"
                    />
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Age *
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      required
                      min={18}
                      max={65}
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", Number.parseInt(e.target.value) || 18)}
                      className="h-11"
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-2">
                    <Label htmlFor="contact_number" className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Contact Number
                    </Label>
                    <Input
                      id="contact_number"
                      value={formData.contact_number}
                      onChange={(e) => handleInputChange("contact_number", e.target.value)}
                      placeholder="E.g., 9876543210"
                      className="h-11"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Gender *
                    </Label>
                    <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Education */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      Education *
                    </Label>
                    <Select value={formData.education} onValueChange={(v) => handleInputChange("education", v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((edu) => (
                          <SelectItem key={edu} value={edu}>
                            {edu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Department *
                    </Label>
                    <Select value={formData.department} onValueChange={(v) => handleInputChange("department", v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Job Role */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Job Role *
                    </Label>
                    <Select value={formData.job_role} onValueChange={(v) => handleInputChange("job_role", v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {jobRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Monthly Income */}
                  <div className="space-y-2">
                    <Label htmlFor="monthly_income" className="text-sm font-semibold flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-blue-600" />
                      Monthly Income (INR) *
                    </Label>
                    <Input
                      id="monthly_income"
                      type="number"
                      required
                      min={10000}
                      max={500000}
                      value={formData.monthly_income}
                      onChange={(e) => handleInputChange("monthly_income", Number.parseInt(e.target.value) || 10000)}
                      className="h-11"
                    />
                  </div>

                  {/* Years at Company */}
                  <div className="space-y-2">
                    <Label htmlFor="years_at_company" className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Years at Company *
                    </Label>
                    <Input
                      id="years_at_company"
                      type="number"
                      required
                      min={0}
                      max={Math.max(0, formData.age - 18)}
                      value={formData.years_at_company}
                      onChange={(e) => handleInputChange("years_at_company", Number.parseInt(e.target.value) || 0)}
                      className="h-11"
                    />
                    <p className="text-xs text-slate-500">
                      Maximum: {Math.max(0, formData.age - 18)} years (based on age {formData.age})
                    </p>
                  </div>

                  {/* Distance from Home */}
                  <div className="space-y-2">
                    <Label htmlFor="distance_from_home" className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Distance from Home (km) *
                    </Label>
                    <Input
                      id="distance_from_home"
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={formData.distance_from_home}
                      onChange={(e) => handleInputChange("distance_from_home", Number.parseInt(e.target.value) || 1)}
                      className="h-11"
                    />
                  </div>

                  {/* Marital Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Heart className="w-4 h-4 text-blue-600" />
                      Marital Status *
                    </Label>
                    <Select
                      value={formData.marital_status}
                      onValueChange={(v) => handleInputChange("marital_status", v)}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Job Satisfaction - Star Rating */}
                <div className="space-y-3 p-5 rounded-xl bg-amber-50 border border-amber-200">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Job Satisfaction Rating (1-5 Stars) *
                  </Label>
                  <StarRating
                    value={formData.job_satisfaction}
                    onChange={(v) => handleInputChange("job_satisfaction", v)}
                    size="lg"
                  />
                  <p className="text-xs text-amber-600">
                    {formData.job_satisfaction === 1 && "Very Dissatisfied"}
                    {formData.job_satisfaction === 2 && "Dissatisfied"}
                    {formData.job_satisfaction === 3 && "Neutral"}
                    {formData.job_satisfaction === 4 && "Satisfied"}
                    {formData.job_satisfaction === 5 && "Very Satisfied"}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isLoading || !formData.full_name}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 font-bold text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Predict Attrition
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="h-12 px-6 bg-transparent border-slate-300"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Result Panel */}
          <div className="space-y-6">
            <Card
              className={`shadow-xl border-0 overflow-hidden transition-all ${result ? "bg-white" : "bg-slate-50"}`}
            >
              <div
                className={`h-1.5 ${
                  result
                    ? result.prediction === "Yes"
                      ? "bg-gradient-to-r from-red-500 to-orange-500"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-slate-200"
                }`}
              />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result ? (
                    result.prediction === "Yes" ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    )
                  ) : (
                    <Brain className="w-5 h-5 text-slate-400" />
                  )}
                  Prediction Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    <div
                      className={`p-6 rounded-xl text-center ${
                        result.prediction === "Yes"
                          ? "bg-red-50 border border-red-200"
                          : "bg-emerald-50 border border-emerald-200"
                      }`}
                    >
                      <div
                        className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                          result.prediction === "Yes" ? "bg-red-100" : "bg-emerald-100"
                        }`}
                      >
                        {result.prediction === "Yes" ? (
                          <AlertTriangle className="w-10 h-10 text-red-600" />
                        ) : (
                          <CheckCircle className="w-10 h-10 text-emerald-600" />
                        )}
                      </div>
                      <h3
                        className={`text-xl font-bold mb-2 ${
                          result.prediction === "Yes" ? "text-red-700" : "text-emerald-700"
                        }`}
                      >
                        {result.prediction === "Yes" ? "High Attrition Risk" : "Low Attrition Risk"}
                      </h3>
                      <p className="text-5xl font-black">{result.probability}%</p>
                      <p className="text-slate-500 text-sm mt-1">Probability</p>
                      <div
                        className={`inline-block px-4 py-1 rounded-full text-sm font-bold mt-3 ${
                          result.risk_level === "High"
                            ? "bg-red-200 text-red-800"
                            : result.risk_level === "Medium"
                              ? "bg-amber-200 text-amber-800"
                              : "bg-emerald-200 text-emerald-800"
                        }`}
                      >
                        {result.risk_level} Risk
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {result.risk_factors.length > 0 && (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Risk Factors
                        </h4>
                        <ul className="space-y-2">
                          {result.risk_factors.map((factor, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <p className="text-xs text-emerald-600 text-center bg-emerald-50 p-2 rounded-lg">
                      This prediction has been saved to History!
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>Fill in the employee details and click &quot;Predict Attrition&quot; to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
