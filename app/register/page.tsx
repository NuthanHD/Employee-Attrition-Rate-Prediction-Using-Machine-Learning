"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { registerEmployee } from "@/lib/api"
import {
  Brain,
  UserPlus,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
  Users,
  Phone,
  AlertCircle,
} from "lucide-react"

// Authorized HRs - cannot register, only these can login
const AUTHORIZED_HRS = [
  { username: "hr_manager", email: "manager4@gmail.com", full_name: "Chaitra" },
  { username: "nuthanhd", email: "nuthanhd6@gmail.com", full_name: "Nuthan" },
  { username: "admin", email: "admin3@gmail.com", full_name: "Rajshekar" },
]

export default function RegisterPage() {
  const router = useRouter()
  const [userType, setUserType] = useState<"hr" | "employee">("employee")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (userType === "hr") {
        // Check if this is an authorized HR
        const isAuthorized = AUTHORIZED_HRS.some((hr) => hr.username === username || hr.email === email)

        if (!isAuthorized) {
          throw new Error(
            "HR registration is not allowed. Only pre-authorized HR personnel can access the system. Please contact your administrator.",
          )
        }

        throw new Error("HR accounts are pre-configured. Please use the Login page with your authorized credentials.")
      }

      // Employee registration
      await registerEmployee(username, email, password, fullName, contactNumber)
      router.push("/login?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700" />
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl">
            <Brain className="w-10 h-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Create Account</CardTitle>
          <CardDescription className="text-slate-500 flex items-center justify-center gap-2 mt-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Employee Attrition Prediction System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            {/* User Type Selection */}
            <div className="space-y-3">
              <Label className="text-slate-700 font-semibold">Register As</Label>
              <RadioGroup
                value={userType}
                onValueChange={(value) => setUserType(value as "hr" | "employee")}
                className="grid grid-cols-2 gap-4"
              >
                <div
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    userType === "hr" ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <RadioGroupItem value="hr" id="hr-reg" className="border-blue-600 text-blue-600" />
                  <Label htmlFor="hr-reg" className="flex items-center gap-2 cursor-pointer font-medium">
                    <Shield className="w-5 h-5 text-blue-600" />
                    HR
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    userType === "employee" ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <RadioGroupItem value="employee" id="emp-reg" className="border-blue-600 text-blue-600" />
                  <Label htmlFor="emp-reg" className="flex items-center gap-2 cursor-pointer font-medium">
                    <Users className="w-5 h-5 text-blue-600" />
                    Employee
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {userType === "hr" && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  HR Registration Not Available
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Only pre-authorized HR personnel can access the system. If you are an authorized HR, please use the
                  login page.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-700 font-semibold">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="pl-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-700 font-semibold">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="pl-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="pl-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl"
                  required
                />
              </div>
            </div>

            {userType === "employee" && (
              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="text-slate-700 font-semibold">
                  Contact Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                  <Input
                    id="contactNumber"
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter your contact number"
                    className="pl-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl"
                    required
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg h-12 font-bold text-base rounded-xl transition-all"
              disabled={isLoading || userType === "hr"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  {userType === "hr" ? "HR Registration Not Allowed" : "Create Employee Account"}
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-blue-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
              >
                Sign in <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
