import { NextResponse } from "next/server"
import { isDatabaseEnabled, dbEmployees } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (isDatabaseEnabled()) {
      const employee = await dbEmployees.validate(username, password)

      if (!employee) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      return NextResponse.json({
        user: {
          id: employee.id,
          username: employee.username,
          email: employee.email,
          full_name: employee.full_name,
          contact_number: employee.contact_number,
          role: "employee",
        },
        message: "Login successful",
      })
    }

    return NextResponse.json({
      message: "Use client-side authentication",
      useClientAuth: true,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
