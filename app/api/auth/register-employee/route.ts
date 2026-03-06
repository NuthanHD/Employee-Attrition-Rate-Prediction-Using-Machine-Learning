import { NextResponse } from "next/server"
import { isDatabaseEnabled, dbEmployees } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { username, email, password, fullName, contactNumber } = await request.json()

    if (isDatabaseEnabled()) {
      // Check if username exists
      const existingUser = await dbEmployees.findByUsername(username)
      if (existingUser) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 })
      }

      // Check if email exists
      const existingEmail = await dbEmployees.findByEmail(email)
      if (existingEmail) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 })
      }

      // Create employee
      const newEmployee = await dbEmployees.create(username, email, password, fullName, contactNumber)

      return NextResponse.json({
        user: {
          ...newEmployee,
          role: "employee",
        },
        message: "Registration successful",
      })
    }

    return NextResponse.json({
      message: "Use client-side authentication",
      useClientAuth: true,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
