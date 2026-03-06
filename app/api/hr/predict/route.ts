import { NextResponse } from "next/server"
import { isDatabaseEnabled, dbEmployeeData, dbPredictions } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { employeeDataId, employeeData, hrUserId, jobSatisfaction } = await request.json()

    let empData: any = null

    if (isDatabaseEnabled()) {
      const numericId = Number(employeeDataId)
      if (!isNaN(numericId)) {
        const result = await dbEmployeeData.getById(numericId)
        empData = result
      }
    }

    if (!empData && employeeData) {
      empData = employeeData
    }

    if (!empData) {
      return NextResponse.json({ error: "Employee data not found" }, { status: 404 })
    }

    let riskScore = 0
    const riskFactors: string[] = []

    // Age factor
    if (empData.age < 25) {
      riskScore += 25
      riskFactors.push("Young employee (under 25)")
    } else if (empData.age < 30) {
      riskScore += 15
      riskFactors.push("Early career (25-30)")
    }

    // Job satisfaction (1-5 stars)
    if (jobSatisfaction === 1) {
      riskScore += 35
      riskFactors.push("Very low job satisfaction (1 star)")
    } else if (jobSatisfaction === 2) {
      riskScore += 25
      riskFactors.push("Low job satisfaction (2 stars)")
    } else if (jobSatisfaction === 3) {
      riskScore += 10
      riskFactors.push("Average job satisfaction (3 stars)")
    }

    // Years at company
    if (empData.years_at_company < 2) {
      riskScore += 20
      riskFactors.push("New to company (less than 2 years)")
    } else if (empData.years_at_company < 5) {
      riskScore += 10
      riskFactors.push("Less than 5 years at company)")
    }

    // Distance from home
    if (empData.distance_from_home > 25) {
      riskScore += 20
      riskFactors.push("Long commute (over 25 km)")
    } else if (empData.distance_from_home > 15) {
      riskScore += 10
      riskFactors.push("Moderate commute (15-25 km)")
    }

    // Income factor
    if (empData.monthly_income < 25000) {
      riskScore += 25
      riskFactors.push("Below average income")
    } else if (empData.monthly_income < 40000) {
      riskScore += 15
      riskFactors.push("Moderate income level")
    }

    // Marital status
    if (empData.marital_status === "Single") {
      riskScore += 10
      riskFactors.push("Single status")
    }

    const probability = Math.min(Math.max(riskScore, 5), 95)
    const prediction = probability >= 50 ? "Yes" : "No"
    const riskLevel = probability >= 70 ? "High" : probability >= 40 ? "Medium" : "Low"

    if (isDatabaseEnabled()) {
      const numericId = Number(employeeDataId)
      if (!isNaN(numericId)) {
        await dbEmployeeData.updatePrediction(numericId, prediction, probability, riskLevel, jobSatisfaction)
        await dbPredictions.create(numericId, hrUserId || 1, prediction, probability, riskLevel, riskFactors)
      }
    }

    return NextResponse.json({
      prediction,
      probability,
      risk_level: riskLevel,
      risk_factors: riskFactors,
    })
  } catch (error) {
    console.error("[v0] Prediction error:", error)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}
