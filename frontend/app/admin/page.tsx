"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getAdminUsers, deleteUser, isAuthenticated, getCurrentUser } from "@/lib/api"
import { Users, Trash2, Loader2, Shield, Clock, BarChart, UserCheck } from "lucide-react"

interface AdminUser {
  id: number
  username: string
  email: string
  is_admin: boolean
  created_at: string
  prediction_count: number
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getAdminUsers()
      setUsers(data)
    } catch (err) {
      console.error("Failed to fetch users:", err)
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    const user = getCurrentUser()
    if (!user?.is_admin) {
      router.push("/dashboard")
      return
    }

    setCurrentUserId(user.id)
    fetchUsers()
  }, [router, fetchUsers])

  const handleDelete = async (id: number) => {
    if (id === currentUserId) return

    setDeletingId(id)
    try {
      await deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      console.error("Failed to delete user:", err)
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">Manage users and system settings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                  <p className="text-4xl font-black text-indigo-600">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Administrators</p>
                  <p className="text-4xl font-black text-amber-600">{users.filter((u) => u.is_admin).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                  <BarChart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Predictions</p>
                  <p className="text-4xl font-black text-emerald-600">
                    {users.reduce((sum, u) => sum + u.prediction_count, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
          <CardHeader className="bg-gradient-to-r from-slate-50 to-amber-50 dark:from-slate-800 dark:to-amber-950">
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <UserCheck className="w-5 h-5 text-amber-600" />
              User Management
            </CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-amber-50 dark:from-slate-800 dark:to-amber-950">
                      <TableHead className="font-bold">Username</TableHead>
                      <TableHead className="font-bold">Email</TableHead>
                      <TableHead className="font-bold">Role</TableHead>
                      <TableHead className="font-bold">Predictions</TableHead>
                      <TableHead className="font-bold">Joined</TableHead>
                      <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors"
                      >
                        <TableCell className="font-bold text-indigo-600">{user.username}</TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.is_admin
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow"
                                : "bg-gradient-to-r from-slate-400 to-slate-500 text-white border-0"
                            }
                          >
                            {user.is_admin ? "Admin" : "User"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-emerald-600">{user.prediction_count}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Clock className="w-3 h-3" />
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(user.id)}
                            disabled={deletingId === user.id || user.id === currentUserId}
                            className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950 disabled:opacity-30"
                            title={user.id === currentUserId ? "Cannot delete yourself" : "Delete user"}
                          >
                            {deletingId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
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
