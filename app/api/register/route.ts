import { NextResponse } from "next/server"
import { isDatabaseEnabled, dbUsers } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    // If PostgreSQL is enabled, use it
    if (isDatabaseEnabled()) {
      // Check if user already exists
      const existingUser = await dbUsers.findByUsername(username)
      if (existingUser) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 })
      }

      const existingEmail = await dbUsers.findByEmail(email)
      if (existingEmail) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 })
      }

      // Create new user
      const newUser = await dbUsers.create(username, email, password)

      return NextResponse.json({
        user: newUser,
        message: "Registration successful",
      })
    }

    // Fallback: Return success for client-side auth
    return NextResponse.json({
      message: "Use client-side authentication",
      useClientAuth: true,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
