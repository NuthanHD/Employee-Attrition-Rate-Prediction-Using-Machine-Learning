"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout, getCurrentUser, isAuthenticated } from "@/lib/api"
import { LayoutDashboard, History, BarChart3, PieChart, Users, LogOut, Brain, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

function classNames(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ username: string; is_admin: boolean } | null>(null)
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

  const navItems = [
    { href: "/dashboard", label: "Prediction", icon: LayoutDashboard },
    { href: "/history", label: "History", icon: History },
    { href: "/charts", label: "Charts", icon: BarChart3 },
    { href: "/analysis", label: "Analysis", icon: PieChart },
  ]

  if (user?.is_admin) {
    navItems.push({ href: "/admin", label: "Admin", icon: Users })
  }

  if (!user) return null

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30">
              <Brain className="w-6 h-6" />
            </div>
            <span className="font-black text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hidden sm:block">
              Attrition Predictor
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={classNames(
                      "gap-2 transition-all font-semibold rounded-lg",
                      isActive
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-md"
                        : "text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-white/50",
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
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-sm border border-indigo-200 dark:border-indigo-800">
              <span className="text-slate-500 dark:text-slate-400">Welcome, </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{user.username}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 font-semibold shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-600 hover:text-indigo-600 hover:bg-indigo-100"
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
                    className={classNames(
                      "w-full justify-start gap-2 font-semibold",
                      isActive
                        ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-muted-foreground px-4 py-2">
                Logged in as <span className="font-bold text-indigo-600">{user.username}</span>
              </p>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start gap-2 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 font-semibold"
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
