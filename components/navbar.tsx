"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout, getCurrentUser, isAuthenticated } from "@/lib/api"
import { LayoutDashboard, Users, LogOut, Brain, Menu, X, Sparkles, History, BarChart3, LineChart } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getCurrentUser())
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const hrNavItems = [
    { href: "/hr/dashboard", label: "Prediction", icon: Sparkles },
    { href: "/hr/employees", label: "Employees", icon: Users },
    { href: "/hr/history", label: "History", icon: History },
    { href: "/hr/charts", label: "Charts", icon: BarChart3 },
    { href: "/hr/analytics", label: "Analytics", icon: LineChart },
  ]

  const employeeNavItems = [{ href: "/employee/dashboard", label: "My Dashboard", icon: LayoutDashboard }]

  const navItems = user?.role === "hr" ? hrNavItems : employeeNavItems

  if (!user) return null

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg">
              <Brain className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-800 hidden sm:block">Attrition Predictor</span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                user.role === "hr" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {user.role === "hr" ? "HR" : "Employee"}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-2 transition-all font-semibold rounded-lg",
                      isActive
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-slate-600 hover:text-blue-600 hover:bg-white/50",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="px-4 py-2 rounded-full bg-slate-100 text-sm border border-slate-200">
              <span className="text-slate-500">Welcome, </span>
              <span className="font-bold text-slate-800">{user.full_name || user.username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600 hover:text-blue-600 hover:bg-blue-100"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 font-semibold",
                      isActive ? "bg-blue-100 text-blue-600" : "text-slate-600",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            <div className="pt-2 border-t border-slate-200">
              <p className="text-sm text-slate-500 px-4 py-2">
                Logged in as <span className="font-bold text-slate-800">{user.full_name || user.username}</span>
              </p>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start gap-2 bg-red-50 border-red-200 text-red-600 hover:bg-red-100 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
