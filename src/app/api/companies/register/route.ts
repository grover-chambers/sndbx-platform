import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

interface Account {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface Profile {
  name: string
  slug: string
  website: string
  description: string
  fieldOfExpertise: string
  phone: string
  location: string
  teamSize: string
}

interface Documents {
  businessCertUrl: string
  taxComplianceUrl: string
  professionalLicenseUrl: string
  insuranceUrl: string
  portfolioUrls: string[]
}

interface Service {
  title: string
  description: string
  pricing: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { account, profile, documents, services } = body as {
      account: Account
      profile: Profile
      documents: Documents
      services: Service[]
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: account.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Check if company slug exists
    const existingCompany = await prisma.company.findUnique({
      where: { slug: profile.slug }
    })

    if (existingCompany) {
      return NextResponse.json({ error: "Company slug already taken" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(account.password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: account.name,
        email: account.email,
        password: hashedPassword,
        role: "COMPANY_REP",
      }
    })

    // Create company
    const company = await prisma.company.create({
      data: {
        name: profile.name,
        slug: profile.slug,
        description: profile.description,
        fieldOfExpertise: profile.fieldOfExpertise,
        website: profile.website,
        phone: profile.phone,
        location: profile.location,
        status: "PENDING",
        users: { connect: { id: user.id } },
      }
    })

    // Create verification record
    await prisma.companyVerification.create({
      data: {
        companyId: company.id,
        businessCertUrl: documents.businessCertUrl,
        taxComplianceUrl: documents.taxComplianceUrl,
        professionalLicenseUrl: documents.professionalLicenseUrl,
        insuranceUrl: documents.insuranceUrl,
        portfolioUrls: documents.portfolioUrls,
        verificationStatus: "DOCUMENTS_SUBMITTED",
      }
    })

    // Create services
    for (const service of services.filter(s => s.title)) {
      await prisma.service.create({
        data: {
          title: service.title,
          description: service.description,
          pricing: service.pricing,
          companyId: company.id,
        }
      })
    }

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } }
    })

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: "New Company Registration",
          message: `${company.name} has registered and is pending verification.`,
          type: "COMPANY_REGISTRATION",
        }))
      })
    }

    return NextResponse.json({ success: true, companyId: company.id })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
