import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 10MB" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, or PDF" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`

    // Determine folder based on document type
    let folder = 'sndbx/verification'
    switch (type) {
      case 'businessCert': folder = 'sndbx/verification/business_certs'; break
      case 'taxCompliance': folder = 'sndbx/verification/tax'; break
      case 'professionalLicense': folder = 'sndbx/verification/licenses'; break
      case 'insurance': folder = 'sndbx/verification/insurance'; break
      case 'portfolio': folder = 'sndbx/verification/portfolio'; break
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'auto',
    })

    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
