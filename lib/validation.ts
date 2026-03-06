// Job roles mapped to minimum education requirements
export const JOB_ROLE_EDUCATION_REQUIREMENTS: Record<string, string[]> = {
  "Engineering Manager": ["Engineering (B.E/B.Tech)", "M.Tech/M.E", "MCA", "PhD"],
  "Cloud Architect": ["Engineering (B.E/B.Tech)", "M.Tech/M.E", "MCA", "PhD"],
  "Technical Lead": ["Engineering (B.E/B.Tech)", "M.Tech/M.E", "MCA", "BCA"],
  "Senior Software Engineer": ["Engineering (B.E/B.Tech)", "M.Tech/M.E", "MCA", "BCA"],
  "DevOps Engineer": ["Engineering (B.E/B.Tech)", "M.Tech/M.E", "MCA", "BCA"],
  "Senior QA Engineer": ["Engineering (B.E/B.Tech)", "M.Tech/M.E", "MCA", "BCA", "Diploma"],
  "Software Engineer": ["Engineering (B.E/B.Tech)", "MCA", "BCA", "Diploma"],
  "Junior Developer": ["Engineering (B.E/B.Tech)", "MCA", "BCA", "Diploma", "Degree (B.A/B.Com/B.Sc)"],
  "Data Analyst": ["Engineering (B.E/B.Tech)", "MCA", "BCA", "Masters (M.A/M.Com/M.Sc)", "Degree (B.A/B.Com/B.Sc)"],
  "Data Scientist": ["Engineering (B.E/B.Tech)", "M.Tech/M.E", "MCA", "Masters (M.A/M.Com/M.Sc)", "PhD"],
  "ML Engineer": ["Engineering (B.E/B.Tech)", "M.Tech/M.E", "MCA", "Masters (M.A/M.Com/M.Sc)", "PhD"],
  "Product Manager": [
    "Engineering (B.E/B.Tech)",
    "M.Tech/M.E",
    "Masters (M.A/M.Com/M.Sc)",
    "Degree (B.A/B.Com/B.Sc)",
    "MCA",
    "MBA",
  ],
  "Tech Lead": ["Engineering (B.E/B.Tech)", "M.Tech/M.E", "Masters (M.A/M.Com/M.Sc)", "MCA", "BCA"],
  "Research Director": ["M.Tech/M.E", "PhD", "Masters (M.A/M.Com/M.Sc)"],
  "Research Scientist": ["M.Tech/M.E", "PhD", "Masters (M.A/M.Com/M.Sc)", "Engineering (B.E/B.Tech)"],
  "Manufacturing Director": [
    "Engineering (B.E/B.Tech)",
    "M.Tech/M.E",
    "Masters (M.A/M.Com/M.Sc)",
    "Degree (B.A/B.Com/B.Sc)",
  ],
  Manager: [
    "Degree (B.A/B.Com/B.Sc)",
    "Masters (M.A/M.Com/M.Sc)",
    "Engineering (B.E/B.Tech)",
    "M.Tech/M.E",
    "MCA",
    "BCA",
    "MBA",
  ],
  "QA Engineer": ["Engineering (B.E/B.Tech)", "MCA", "BCA", "Diploma", "Degree (B.A/B.Com/B.Sc)"],
  "UI/UX Designer": ["Degree (B.A/B.Com/B.Sc)", "BCA", "Engineering (B.E/B.Tech)", "Diploma"],
  "Frontend Developer": ["Engineering (B.E/B.Tech)", "MCA", "BCA", "Diploma"],
  "Backend Developer": ["Engineering (B.E/B.Tech)", "MCA", "BCA", "Diploma"],
  "Full Stack Developer": ["Engineering (B.E/B.Tech)", "MCA", "BCA", "Diploma"],
  "HR Executive": ["Degree (B.A/B.Com/B.Sc)", "Masters (M.A/M.Com/M.Sc)", "MBA", "Diploma"],
  "Finance Executive": ["Degree (B.A/B.Com/B.Sc)", "Masters (M.A/M.Com/M.Sc)", "MBA"],
  "Marketing Executive": ["Degree (B.A/B.Com/B.Sc)", "Masters (M.A/M.Com/M.Sc)", "MBA", "Diploma"],
  Intern: [
    "SSLC (10th)",
    "PUC (12th)",
    "Diploma",
    "Degree (B.A/B.Com/B.Sc)",
    "BCA",
    "Engineering (B.E/B.Tech)",
    "Masters (M.A/M.Com/M.Sc)",
    "MCA",
  ],
}

export interface ValidationResult {
  isValid: boolean
  error?: string
}

// Validate years at company based on age
export function validateYearsAtCompany(age: number, yearsAtCompany: number): ValidationResult {
  const maxYears = age - 18

  if (age < 18) {
    return {
      isValid: false,
      error: "Employee must be at least 18 years old",
    }
  }

  if (yearsAtCompany > maxYears) {
    return {
      isValid: false,
      error: `Years at company cannot exceed ${maxYears} years. A person aged ${age} can have maximum ${maxYears} years of experience (starting from age 18).`,
    }
  }

  if (yearsAtCompany < 0) {
    return {
      isValid: false,
      error: "Years at company cannot be negative",
    }
  }

  return { isValid: true }
}

// Validate job role based on education
export function validateJobRoleEducation(jobRole: string, education: string): ValidationResult {
  const requiredEducation = JOB_ROLE_EDUCATION_REQUIREMENTS[jobRole]

  if (!requiredEducation) {
    // If job role not in list, allow any education
    return { isValid: true }
  }

  if (!requiredEducation.includes(education)) {
    return {
      isValid: false,
      error: `${jobRole} requires one of the following education levels: ${requiredEducation.join(", ")}`,
    }
  }

  return { isValid: true }
}

// Comprehensive form validation
export function validateEmployeeForm(formData: {
  age: number
  years_at_company: number
  job_role: string
  education: string
}): ValidationResult {
  // Validate years at company
  const yearsValidation = validateYearsAtCompany(formData.age, formData.years_at_company)
  if (!yearsValidation.isValid) {
    return yearsValidation
  }

  // Validate job role and education
  const roleEducationValidation = validateJobRoleEducation(formData.job_role, formData.education)
  if (!roleEducationValidation.isValid) {
    return roleEducationValidation
  }

  return { isValid: true }
}
