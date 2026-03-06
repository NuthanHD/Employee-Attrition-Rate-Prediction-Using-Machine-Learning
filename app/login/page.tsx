"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { loginHR, loginEmployee } from "@/lib/api"
import { Brain, LogIn, Lock, User, ArrowRight, Loader2, CheckCircle, Sparkles, Shield, Users } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"hr" | "employee">("hr")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (userType === "hr") {
        await loginHR(username, password)
        router.push("/hr/dashboard")
      } else {
        await loginEmployee(username, password)
        router.push("/employee/dashboard")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700" />
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl">
          <Brain className="w-10 h-10" />
        </div>
        <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back</CardTitle>
        <CardDescription className="text-slate-500 flex items-center justify-center gap-2 mt-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Employee Attrition Prediction System
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {showSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Registration successful! Please login.</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* User Type Selection */}
          <div className="space-y-3">
            <Label className="text-slate-700 font-semibold">Login As</Label>
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
                <RadioGroupItem value="hr" id="hr" className="border-blue-600 text-blue-600" />
                <Label htmlFor="hr" className="flex items-center gap-2 cursor-pointer font-medium">
                  <Shield className="w-5 h-5 text-blue-600" />
                  HR Login
                </Label>
              </div>
              <div
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  userType === "employee" ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem value="employee" id="employee" className="border-blue-600 text-blue-600" />
                <Label htmlFor="employee" className="flex items-center gap-2 cursor-pointer font-medium">
                  <Users className="w-5 h-5 text-blue-600" />
                  Employee Login
                </Label>
              </div>
            </RadioGroup>
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
                placeholder="Enter your username"
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
                placeholder="Enter your password"
                className="pl-11 h-12 border-slate-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg h-12 font-bold text-base rounded-xl transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In as {userType === "hr" ? "HR" : "Employee"}
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-bold text-blue-600 hover:text-indigo-700 inline-flex items-center gap-1 transition-colors"
            >
              Register here <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>

        {userType === "hr" && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-700 text-center">Only authorized HR personnel can access this system</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />

      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
