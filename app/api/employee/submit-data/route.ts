import { NextResponse } from "next/server"
import { isDatabaseEnabled, dbEmployeeData, dbEmployees } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    if (isDatabaseEnabled()) {
      const employee = await dbEmployees.findByUsername(data.employee_username || "guest")
      const employeeId = employee ? employee.id : 1 // Fallback to ID 1 if not found

      const result = await dbEmployeeData.create(employeeId, data)
      return NextResponse.json(result)
    }

    // Fallback to localStorage if database not enabled
    return NextResponse.json({
      id: Date.now().toString(),
      ...data,
      is_submitted: true,
      submitted_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Submit data error:", error)
    return NextResponse.json({ error: "Failed to submit data" }, { status: 500 })
  }
}
