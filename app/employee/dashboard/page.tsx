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
import { StarRating } from "@/components/star-rating"
import { useToast } from "@/hooks/use-toast"
import {
  isAuthenticated,
  isEmployee,
  getCurrentUser,
  submitEmployeeData,
  getMyData,
  type EmployeeData,
} from "@/lib/api"
import { validateEmployeeForm } from "@/lib/validation"
import {
  User,
  Building2,
  Briefcase,
  IndianRupee,
  Calendar,
  Home,
  Loader2,
  GraduationCap,
  CheckCircle,
  Phone,
  ClipboardList,
  Heart,
  Star,
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
  "DevOps Engineer",
  "Cloud Architect",
  "Data Scientist",
  "Data Analyst",
  "ML Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "HR Executive",
  "Finance Executive",
  "Marketing Executive",
  "Intern",
]

const educationLevels = [
  "SSLC (10th)",
  "PUC (12th)",
  "Diploma",
  "Degree (B.A/B.Com/B.Sc)",
  "BCA",
  "Engineering (B.E/B.Tech)",
  "Masters (M.A/M.Com/M.Sc)",
  "MCA",
  "M.Tech/M.E",
  "MBA",
  "PhD",
]

interface FormData {
  full_name: string
  age: number
  contact_number: string
  gender: string
  education: string
  department: string
  job_role: string
  monthly_income: number
  years_at_company: number
  distance_from_home: number
  marital_status: string
  job_satisfaction: number // Added job satisfaction field
}

export default function EmployeeDashboardPage() {
  const router = useRouter()
  const { toast } = useToast() // Added toast for notifications
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingData, setExistingData] = useState<EmployeeData | null>(null)
  const [checkingData, setCheckingData] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    age: 25,
    contact_number: "",
    gender: "Male",
    education: "",
    department: "",
    job_role: "",
    monthly_income: 30000,
    years_at_company: 1,
    distance_from_home: 5,
    marital_status: "Single",
    job_satisfaction: 3, // Default satisfaction rating
  })

  useEffect(() => {
    if (!isAuthenticated() || !isEmployee()) {
      router.push("/login")
      return
    }

    const currentUser = getCurrentUser()
    setUser(currentUser)

    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        full_name: currentUser.full_name || "",
        contact_number: currentUser.contact_number || "",
      }))
    }

    checkExistingData()
  }, [router])

  const checkExistingData = async () => {
    try {
      const data = await getMyData()
      if (data) {
        setExistingData(data)
        setSubmitted(true)
      }
    } catch (error) {
      console.error("Error checking existing data:", error)
    } finally {
      setCheckingData(false)
    }
  }

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await submitEmployeeData(formData)
      setSubmitted(true)
      toast({
        title: "Success!",
        description: "Your details have been submitted successfully.",
      })
    } catch (error) {
      console.error("Failed to submit:", error)
      toast({
        title: "Submission Failed",
        description: "Failed to submit details. Please try again.",
        variant: "destructive",
      })
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

  if (checkingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg">
              <ClipboardList className="w-8 h-8 text-white" />
            </div>
            Employee Dashboard
          </h1>
          <p className="text-slate-500 mt-2">
            {submitted
              ? "Your details have been submitted successfully"
              : "Submit your details for HR review and attrition prediction"}
          </p>
        </div>

        {submitted && existingData ? (
          <Card className="shadow-xl border-0 bg-white overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-teal-700" />
            <CardHeader className="bg-emerald-50 border-b">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="w-5 h-5" />
                Your Details - Submitted
              </CardTitle>
              <CardDescription>Your information has been submitted for review</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <User className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Full Name</p>
                      <p className="font-semibold">{existingData.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Age</p>
                      <p className="font-semibold">{existingData.age} years</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Contact Number</p>
                      <p className="font-semibold">{existingData.contact_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <User className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Gender</p>
                      <p className="font-semibold">{existingData.gender}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Education</p>
                      <p className="font-semibold">{existingData.education}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Heart className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Marital Status</p>
                      <p className="font-semibold">{existingData.marital_status}</p>
                    </div>
                  </div>
                  {existingData.job_satisfaction && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <Star className="w-5 h-5 text-amber-500" />
                      <div>
                        <p className="text-xs text-slate-400">Job Satisfaction</p>
                        <div className="flex gap-0.5 mt-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i <= existingData.job_satisfaction! ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Department</p>
                      <p className="font-semibold">{existingData.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Job Role</p>
                      <p className="font-semibold">{existingData.job_role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Monthly Income</p>
                      <p className="font-semibold">{formatINR(existingData.monthly_income)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Years at Company</p>
                      <p className="font-semibold">{existingData.years_at_company} years</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Home className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-slate-400">Distance from Home</p>
                      <p className="font-semibold">{existingData.distance_from_home} km</p>
                    </div>
                  </div>
                  {existingData.prediction_result && (
                    <div
                      className={`p-4 rounded-lg ${
                        existingData.prediction_result === "Yes"
                          ? "bg-red-50 border border-red-200"
                          : "bg-emerald-50 border border-emerald-200"
                      }`}
                    >
                      <p className="text-xs text-slate-400">Prediction Status</p>
                      <p
                        className={`font-bold ${
                          existingData.prediction_result === "Yes" ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {existingData.prediction_result === "Yes" ? "At Risk" : "Stable"} (
                        {existingData.prediction_probability}%)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Your details have been submitted. HR will review and perform attrition
                  prediction. Check back later for results.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl border-0 bg-white overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-600 to-teal-700" />
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Submit Your Details
              </CardTitle>
              <CardDescription>Fill in your information for HR review</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-sm font-semibold">
                      Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => updateField("full_name", e.target.value)}
                        placeholder="Enter your full name"
                        className="pl-10 border-slate-200 focus:border-emerald-600"
                        required
                      />
                    </div>
                  </div>

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
                      onChange={(e) => updateField("age", Number.parseInt(e.target.value) || 0)}
                      required
                      className="border-slate-200 focus:border-emerald-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_number" className="text-sm font-semibold">
                      Contact Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <Input
                        id="contact_number"
                        value={formData.contact_number}
                        onChange={(e) => updateField("contact_number", e.target.value)}
                        placeholder="Enter contact number"
                        className="pl-10 border-slate-200 focus:border-emerald-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <Label className="text-sm font-semibold">Gender</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => updateField("gender", value)}
                      className="flex gap-8"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Male" id="male" className="border-emerald-600 text-emerald-600" />
                        <Label htmlFor="male" className="font-normal cursor-pointer">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Female" id="female" className="border-emerald-600 text-emerald-600" />
                        <Label htmlFor="female" className="font-normal cursor-pointer">
                          Female
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Education</Label>
                    <Select
                      value={formData.education}
                      onValueChange={(value) => updateField("education", value)}
                      required
                    >
                      <SelectTrigger className="border-slate-200 focus:border-emerald-600">
                        <GraduationCap className="w-4 h-4 mr-2 text-emerald-600" />
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

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => updateField("department", value)}
                      required
                    >
                      <SelectTrigger className="border-slate-200 focus:border-emerald-600">
                        <Building2 className="w-4 h-4 mr-2 text-emerald-600" />
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

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Job Role</Label>
                    <Select
                      value={formData.job_role}
                      onValueChange={(value) => updateField("job_role", value)}
                      required
                    >
                      <SelectTrigger className="border-slate-200 focus:border-emerald-600">
                        <Briefcase className="w-4 h-4 mr-2 text-emerald-600" />
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

                  <div className="space-y-2">
                    <Label htmlFor="monthly_income" className="text-sm font-semibold">
                      Monthly Income (INR)
                    </Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <Input
                        id="monthly_income"
                        type="number"
                        min={10000}
                        max={1000000}
                        step={1000}
                        value={formData.monthly_income || ""}
                        onChange={(e) => updateField("monthly_income", Number.parseFloat(e.target.value) || 0)}
                        className="pl-10 border-slate-200 focus:border-emerald-600"
                        required
                      />
                    </div>
                    <p className="text-xs text-emerald-600 font-medium">
                      {formData.monthly_income ? formatINR(formData.monthly_income) : "₹0"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="years_at_company" className="text-sm font-semibold">
                      Years of Working
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <Input
                        id="years_at_company"
                        type="number"
                        min={0}
                        max={Math.max(0, formData.age - 18)}
                        value={formData.years_at_company || ""}
                        onChange={(e) => updateField("years_at_company", Number.parseInt(e.target.value) || 0)}
                        className="pl-10 border-slate-200 focus:border-emerald-600"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Maximum: {Math.max(0, formData.age - 18)} years (based on age {formData.age})
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance_from_home" className="text-sm font-semibold">
                      Distance from Home (km)
                    </Label>
                    <div className="relative">
                      <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                      <Input
                        id="distance_from_home"
                        type="number"
                        min={1}
                        max={100}
                        value={formData.distance_from_home || ""}
                        onChange={(e) => updateField("distance_from_home", Number.parseInt(e.target.value) || 0)}
                        className="pl-10 border-slate-200 focus:border-emerald-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <Label className="text-sm font-semibold">Marital Status</Label>
                    <RadioGroup
                      value={formData.marital_status}
                      onValueChange={(value) => updateField("marital_status", value)}
                      className="flex flex-wrap gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Single" id="single" className="border-emerald-600 text-emerald-600" />
                        <Label htmlFor="single" className="font-normal cursor-pointer">
                          Single
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Married" id="married" className="border-emerald-600 text-emerald-600" />
                        <Label htmlFor="married" className="font-normal cursor-pointer">
                          Married
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value="Divorced"
                          id="divorced"
                          className="border-emerald-600 text-emerald-600"
                        />
                        <Label htmlFor="divorced" className="font-normal cursor-pointer">
                          Divorced
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3 p-4 rounded-xl bg-amber-50 border border-amber-200 md:col-span-2">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Job Satisfaction Rating
                    </Label>
                    <StarRating
                      value={formData.job_satisfaction}
                      onChange={(value) => updateField("job_satisfaction", value)}
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
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-lg h-14 text-lg font-bold transition-all"
                  disabled={isLoading || !formData.department || !formData.job_role || !formData.education}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Details
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
