import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, role, companyName, companySlug, adminSecret } = body

    console.log("Registration attempt for:", email, "Role:", role)

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Validate admin role (requires secret key)
    let validRole = role
    if (role === "SUPER_ADMIN" || role === "ADMIN") {
      const validAdminSecret = "SNDBX_ADMIN_SECRET_2024"
      if (adminSecret !== validAdminSecret) {
        return NextResponse.json(
          { error: "Invalid admin secret" },
          { status: 403 }
        )
      }
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    console.log("Password hashed successfully")

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        role: validRole,
      }
    })

    console.log("User created:", user.id)

    // If role is COMPANY_REP, create company profile
    if (role === "COMPANY_REP") {
      if (!companyName) {
        await prisma.user.delete({ where: { id: user.id } })
        return NextResponse.json(
          { error: "Company name is required" },
          { status: 400 }
        )
      }

      const slug = companySlug || companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      
      const existingCompany = await prisma.company.findUnique({
        where: { slug }
      })

      if (existingCompany) {
        await prisma.user.delete({ where: { id: user.id } })
        return NextResponse.json(
          { error: "Company slug already taken" },
          { status: 400 }
        )
      }

      await prisma.company.create({
        data: {
          name: companyName,
          slug: slug,
          status: "PENDING",
          users: {
            connect: { id: user.id }
          }
        }
      })
      
      console.log("Company created")
    }

    // If role is CLIENT, create client profile
    if (role === "CLIENT") {
      await prisma.client.create({
        data: {
          companyName: name || "New Client",
          userId: user.id,
        }
      })
      console.log("Client profile created")
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "User created successfully",
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error: " + String(error) },
      { status: 500 }
    )
  }
}
