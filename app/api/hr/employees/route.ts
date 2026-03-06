import { NextResponse } from "next/server"
import { isDatabaseEnabled, dbEmployeeData } from "@/lib/db"

export async function GET() {
  try {
    console.log("[v0] Get employees API called")
    console.log("[v0] Database enabled:", isDatabaseEnabled())

    if (isDatabaseEnabled()) {
      const employees = await dbEmployeeData.getAllSubmitted()
      console.log("[v0] Fetched employees from database:", employees.length)
      return NextResponse.json(employees)
    }

    console.log("[v0] Database not enabled, returning empty array")
    return NextResponse.json([])
  } catch (error) {
    console.error("[v0] Get employees error:", error)
    return NextResponse.json({ error: "Failed to get employees" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("[v0] Create employee API called with data:", data)

    if (!isDatabaseEnabled()) {
      console.log("[v0] Database not enabled")
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    // Create employee data record
    const result = await dbEmployeeData.create(data.employee_id || 1, {
      full_name: data.full_name,
      age: data.age,
      contact_number: data.contact_number,
      gender: data.gender,
      education: data.education,
      department: data.department,
      job_role: data.job_role,
      monthly_income: data.monthly_income,
      years_at_company: data.years_at_company,
      distance_from_home: data.distance_from_home,
      marital_status: data.marital_status,
    })

    console.log("[v0] Employee created in database:", result)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Create employee error:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}
