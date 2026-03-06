import { NextResponse } from "next/server"
import { isDatabaseEnabled, dbUsers } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // If PostgreSQL is enabled, use it
    if (isDatabaseEnabled()) {
      const user = await dbUsers.validate(username, password)

      if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      return NextResponse.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          is_admin: user.is_admin,
        },
        message: "Login successful",
      })
    }

    // Fallback: Return success for client-side auth
    // The actual validation happens in lib/api.ts on the client
    return NextResponse.json({
      message: "Use client-side authentication",
      useClientAuth: true,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
