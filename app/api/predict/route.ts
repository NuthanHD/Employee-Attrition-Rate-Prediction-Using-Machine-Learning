import { NextResponse } from "next/server"

// Simple attrition prediction algorithm
function predictAttrition(data: any) {
  let riskScore = 0
  const riskFactors: string[] = []

  // Age factor
  if (data.age < 25 || data.age > 55) {
    riskScore += 10
    riskFactors.push("Age outside typical range")
  }

  // Overtime factor
  if (data.overtime === "Yes") {
    riskScore += 20
    riskFactors.push("Works overtime regularly")
  }

  // Job satisfaction factor
  if (data.job_satisfaction <= 2) {
    riskScore += 25
    riskFactors.push("Low job satisfaction")
  }

  // Distance from home factor
  if (data.distance_from_home > 20) {
    riskScore += 15
    riskFactors.push("Long commute distance")
  }

  // Years at company factor
  if (data.years_at_company < 2) {
    riskScore += 15
    riskFactors.push("New to company")
  }

  // Monthly income factor
  if (data.monthly_income < 3000) {
    riskScore += 15
    riskFactors.push("Below average income")
  }

  // Marital status factor
  if (data.marital_status === "Single") {
    riskScore += 5
    riskFactors.push("Single status")
  }

  // Cap at 100
  riskScore = Math.min(riskScore, 100)

  return {
    prediction: riskScore >= 50 ? "Yes" : "No",
    probability: riskScore,
    riskFactors,
  }
}

export async function POST(request: Request) {
  try {
    const input = await request.json()

    const result = predictAttrition(input)

    const predictionResult = {
      id: crypto.randomUUID(),
      ...input,
      prediction: result.prediction,
      probability: result.probability / 100,
      risk_level: result.probability >= 50 ? "High" : result.probability >= 30 ? "Medium" : "Low",
      risk_factors: result.riskFactors,
      created_at: new Date().toISOString(),
    }

    return NextResponse.json(predictionResult)
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Prediction failed" }, { status: 500 })
  }
}
