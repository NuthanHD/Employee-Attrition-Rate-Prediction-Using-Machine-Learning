"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { predict, isAuthenticated, type PredictionInput } from "@/lib/api"
import {
  User,
  Building2,
  Briefcase,
  IndianRupee,
  Calendar,
  Heart,
  Home,
  Loader2,
  TrendingUp,
  TrendingDown,
  Sparkles,
  GraduationCap,
} from "lucide-react"

const departments = [
  "Software Development",
  "Quality Assurance",
  "DevOps & Cloud",
  "Data Science & Analytics",
  "IT Infrastructure",
  "Product Management",
  "UI/UX Design",
  "Cybersecurity",
  "Technical Support",
  "Human Resources",
  "Finance & Accounts",
  "Marketing",
]

const jobRoles = [
  "Software Engineer",
  "Senior Software Engineer",
  "Tech Lead",
  "Engineering Manager",
  "QA Engineer",
  "Senior QA Engineer",
  "QA Lead",
  "DevOps Engineer",
  "Cloud Architect",
  "Data Scientist",
  "Data Analyst",
  "ML Engineer",
  "Product Manager",
  "Senior Product Manager",
  "UI/UX Designer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Mobile Developer",
  "Security Engineer",
  "System Administrator",
  "Network Engineer",
  "Technical Support Engineer",
  "HR Executive",
  "HR Manager",
  "Finance Executive",
  "Marketing Executive",
  "Business Analyst",
  "Project Manager",
  "Intern",
]

const educationLevels = [
  "SSLC (10th)",
  "PUC (12th)",
  "Diploma",
  "Degree (B.A/B.Com/B.Sc)",
  "Engineering (B.E/B.Tech)",
  "Masters (M.A/M.Com/M.Sc)",
  "M.Tech/M.E",
  "MBA",
  "PhD",
]

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    prediction: string
    probability: number
  } | null>(null)

  const [formData, setFormData] = useState<PredictionInput>({
    employee_id: "",
    age: 30,
    department: "",
    job_role: "",
    monthly_income: 50000,
    years_at_company: 5,
    gender: "Male",
    job_satisfaction: 3,
    marital_status: "Single",
    distance_from_home: 10,
    education: "",
  })

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  const updateField = (field: keyof PredictionInput, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await predict(formData)
      setResult({
        prediction: response.prediction,
        probability: response.probability,
      })
    } catch (err) {
      console.error("Prediction failed:", err)
    } finally {
      setIsLoading(false)
    }
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
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            IT Employee Attrition Prediction
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter employee details to predict attrition risk in your IT organization
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Employee Information
                </CardTitle>
                <CardDescription>Fill in the employee details for prediction</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Employee ID */}
                    <div className="space-y-2">
                      <Label htmlFor="employee_id" className="text-sm font-semibold">
                        Employee ID
                      </Label>
                      <Input
                        id="employee_id"
                        value={formData.employee_id}
                        onChange={(e) => updateField("employee_id", e.target.value)}
                        placeholder="e.g., EMP001"
                        required
                        className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-sm font-semibold">
                        Age
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        min={18}
                        max={65}
                        value={formData.age || ""}
                        onChange={(e) => updateField("age", e.target.value ? Number.parseInt(e.target.value) : 0)}
                        required
                        className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Education - NEW FIELD */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Education</Label>
                      <Select
                        value={formData.education}
                        onValueChange={(value) => updateField("education", value)}
                        required
                      >
                        <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                          <GraduationCap className="w-4 h-4 mr-2 text-indigo-500" />
                          <SelectValue placeholder="Select education level" />
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
                      <Label className="text-sm font-semibold">Department</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => updateField("department", value)}
                        required
                      >
                        <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                          <Building2 className="w-4 h-4 mr-2 text-indigo-500" />
                          <SelectValue placeholder="Select department" />
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
                      <Label className="text-sm font-semibold">Job Role</Label>
                      <Select
                        value={formData.job_role}
                        onValueChange={(value) => updateField("job_role", value)}
                        required
                      >
                        <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                          <Briefcase className="w-4 h-4 mr-2 text-indigo-500" />
                          <SelectValue placeholder="Select job role" />
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
                      <Label htmlFor="monthly_income" className="text-sm font-semibold">
                        Monthly Income (INR)
                      </Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                        <Input
                          id="monthly_income"
                          type="number"
                          min={10000}
                          max={1000000}
                          step={1000}
                          value={formData.monthly_income || ""}
                          onChange={(e) =>
                            updateField("monthly_income", e.target.value ? Number.parseFloat(e.target.value) : 0)
                          }
                          className="pl-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      <p className="text-xs text-indigo-600 font-medium">
                        {formData.monthly_income ? formatINR(formData.monthly_income) : "₹0"}
                      </p>
                    </div>

                    {/* Years at Company */}
                    <div className="space-y-2">
                      <Label htmlFor="years_at_company" className="text-sm font-semibold">
                        Year(s) at Company
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                        <Input
                          id="years_at_company"
                          type="number"
                          min={0}
                          max={40}
                          value={formData.years_at_company || ""}
                          onChange={(e) =>
                            updateField("years_at_company", e.target.value ? Number.parseInt(e.target.value) : 0)
                          }
                          className="pl-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Distance from Home */}
                    <div className="space-y-2">
                      <Label htmlFor="distance_from_home" className="text-sm font-semibold">
                        Distance from Home (km)
                      </Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                        <Input
                          id="distance_from_home"
                          type="number"
                          min={1}
                          max={100}
                          value={formData.distance_from_home || ""}
                          onChange={(e) =>
                            updateField("distance_from_home", e.target.value ? Number.parseInt(e.target.value) : 0)
                          }
                          className="pl-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Job Satisfaction */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Job Satisfaction</Label>
                      <Select
                        value={formData.job_satisfaction?.toString() || ""}
                        onValueChange={(value) => updateField("job_satisfaction", Number.parseInt(value))}
                        required
                      >
                        <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                          <Heart className="w-4 h-4 mr-2 text-pink-500" />
                          <SelectValue placeholder="Select satisfaction level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Low</SelectItem>
                          <SelectItem value="2">2 - Medium</SelectItem>
                          <SelectItem value="3">3 - High</SelectItem>
                          <SelectItem value="4">4 - Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Gender Radio */}
                  <div className="space-y-3 p-5 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950 border border-slate-200 dark:border-slate-700">
                    <Label className="text-sm font-semibold">Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => updateField("gender", value)}
                      className="flex gap-8"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Male" id="male" className="border-indigo-500 text-indigo-600" />
                        <Label htmlFor="male" className="font-normal cursor-pointer">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Female" id="female" className="border-indigo-500 text-indigo-600" />
                        <Label htmlFor="female" className="font-normal cursor-pointer">
                          Female
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Marital Status Radio */}
                  <div className="space-y-3 p-5 rounded-xl bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-800 dark:to-purple-950 border border-slate-200 dark:border-slate-700">
                    <Label className="text-sm font-semibold">Marital Status</Label>
                    <RadioGroup
                      value={formData.marital_status}
                      onValueChange={(value) => updateField("marital_status", value)}
                      className="flex flex-wrap gap-8"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Single" id="single" className="border-purple-500 text-purple-600" />
                        <Label htmlFor="single" className="font-normal cursor-pointer">
                          Single
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Married" id="married" className="border-purple-500 text-purple-600" />
                        <Label htmlFor="married" className="font-normal cursor-pointer">
                          Married
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Divorced" id="divorced" className="border-purple-500 text-purple-600" />
                        <Label htmlFor="divorced" className="font-normal cursor-pointer">
                          Divorced
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-xl shadow-indigo-500/25 h-14 text-lg font-bold transition-all duration-300 hover:scale-[1.02]"
                    disabled={isLoading || !formData.department || !formData.job_role || !formData.education}
                  >
                    {isLoading ? (
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
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-1">
            <Card
              className={`shadow-2xl border-0 transition-all duration-500 sticky top-24 overflow-hidden backdrop-blur-sm ${
                result
                  ? result.prediction === "Yes"
                    ? "bg-gradient-to-br from-red-50 via-red-100 to-orange-50 dark:from-red-950 dark:via-red-900 dark:to-orange-950"
                    : "bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50 dark:from-emerald-950 dark:via-green-900 dark:to-teal-950"
                  : "bg-white/80 dark:bg-slate-900/80"
              }`}
            >
              {result && (
                <div
                  className={`h-1.5 ${result.prediction === "Yes" ? "bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" : "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"}`}
                />
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result ? (
                    result.prediction === "Yes" ? (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    )
                  ) : (
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                  )}
                  Prediction Result
                </CardTitle>
                <CardDescription>ML-powered attrition risk analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-6">
                    <div className="text-center py-6">
                      <div
                        className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 shadow-2xl ${
                          result.prediction === "Yes"
                            ? "bg-gradient-to-br from-red-500 to-orange-500 text-white"
                            : "bg-gradient-to-br from-emerald-500 to-teal-500 text-white"
                        }`}
                      >
                        {result.prediction === "Yes" ? (
                          <TrendingDown className="w-16 h-16" />
                        ) : (
                          <TrendingUp className="w-16 h-16" />
                        )}
                      </div>
                      <h3
                        className={`text-3xl font-black ${result.prediction === "Yes" ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}
                      >
                        {result.prediction === "Yes" ? "HIGH RISK" : "LOW RISK"}
                      </h3>
                      <p className="text-muted-foreground mt-1 font-medium">
                        {result.prediction === "Yes" ? "Employee likely to leave" : "Employee likely to stay"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground font-medium">Confidence Level</span>
                        <span
                          className={`font-black text-2xl ${result.prediction === "Yes" ? "text-red-600" : "text-emerald-600"}`}
                        >
                          {(result.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full transition-all duration-1000 rounded-full ${
                            result.prediction === "Yes"
                              ? "bg-gradient-to-r from-red-500 to-orange-500"
                              : "bg-gradient-to-r from-emerald-500 to-teal-500"
                          }`}
                          style={{ width: `${result.probability * 100}%` }}
                        />
                      </div>
                    </div>

                    <div
                      className={`p-5 rounded-xl ${result.prediction === "Yes" ? "bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-800" : "bg-emerald-100/80 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800"}`}
                    >
                      <h4
                        className={`font-bold mb-2 ${result.prediction === "Yes" ? "text-red-800 dark:text-red-300" : "text-emerald-800 dark:text-emerald-300"}`}
                      >
                        {result.prediction === "Yes" ? "Recommended Actions:" : "Positive Indicators:"}
                      </h4>
                      <ul className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                        {result.prediction === "Yes" ? (
                          <>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>Schedule a one-on-one meeting</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>Review compensation package</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>Discuss career growth opportunities</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-red-500 mt-0.5">•</span>
                              <span>Consider work-life balance initiatives</span>
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>Employee shows strong retention indicators</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>Continue current engagement strategies</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>Consider for leadership development</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-emerald-500 mt-0.5">•</span>
                              <span>Recognize and reward contributions</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-inner">
                      <Sparkles className="w-12 h-12 text-slate-400" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      Fill the form and click predict to see the attrition risk analysis
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low Risk Tips Card */}
            <Card className="mt-6 shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader>
                <CardTitle className="text-lg text-blue-800 dark:text-blue-300">Tips for Low Risk Prediction</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                <p>
                  <span className="font-semibold text-emerald-600">Age:</span> 30-45 years
                </p>
                <p>
                  <span className="font-semibold text-emerald-600">Education:</span> Engineering/Masters/MBA
                </p>
                <p>
                  <span className="font-semibold text-emerald-600">Income:</span> Above ₹80,000/month
                </p>
                <p>
                  <span className="font-semibold text-emerald-600">Years at Company:</span> 5+ years
                </p>
                <p>
                  <span className="font-semibold text-emerald-600">Job Satisfaction:</span> High (3) or Very High (4)
                </p>
                <p>
                  <span className="font-semibold text-emerald-600">Distance:</span> Less than 10 km
                </p>
                <p>
                  <span className="font-semibold text-emerald-600">Marital Status:</span> Married
                </p>
                <p>
                  <span className="font-semibold text-emerald-600">Role:</span> Senior/Lead/Manager positions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
