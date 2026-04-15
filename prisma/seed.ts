import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.engagementTimeline.deleteMany()
  await prisma.engagement.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.clientNeed.deleteMany()
  await prisma.client.deleteMany()
  await prisma.service.deleteMany()
  await prisma.company.deleteMany()
  await prisma.user.deleteMany()
  await prisma.space.deleteMany()
  await prisma.reminder.deleteMany()

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sndbx.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    }
  })
  console.log(`✅ Created admin: ${admin.email}`)

  // Create company users (3 company reps)
  const companyUsers = []
  for (let i = 1; i <= 3; i++) {
    const password = await bcrypt.hash('password123', 10)
    const user = await prisma.user.create({
      data: {
        email: `company${i}@example.com`,
        name: `Company Rep ${i}`,
        password,
        role: 'COMPANY_REP',
      }
    })
    companyUsers.push(user)
    console.log(`✅ Created company user: ${user.email}`)
  }

  // Create client users (7 clients)
  const clientUsers = []
  const clientNames = [
    'TechCorp Kenya', 'Creative Agency', 'FinTech Solutions', 'RetailCo', 
    'HealthPlus', 'EduSmart', 'GreenEnergy'
  ]
  
  for (let i = 1; i <= 7; i++) {
    const password = await bcrypt.hash('password123', 10)
    const user = await prisma.user.create({
      data: {
        email: `client${i}@example.com`,
        name: `Client User ${i}`,
        password,
        role: 'CLIENT',
      }
    })
    clientUsers.push(user)
    console.log(`✅ Created client user: ${user.email}`)
  }

  // Create companies
  const companiesData = [
    { name: 'TechSolutions Kenya', slug: 'techsolutions', field: 'IT & Development', desc: 'Full-stack development, mobile apps, and cloud solutions' },
    { name: 'Creative Studio', slug: 'creative-studio', field: 'Design & Creative', desc: 'Branding, UI/UX design, and digital marketing' },
    { name: 'Legal Experts Ltd', slug: 'legal-experts', field: 'Legal Services', desc: 'Corporate law, contracts, and compliance' },
    { name: 'FinTax Advisors', slug: 'fintax', field: 'Accounting & Tax', desc: 'Tax advisory, auditing, and financial planning' },
    { name: 'Digital Marketing Pros', slug: 'digital-marketing', field: 'Marketing & PR', desc: 'SEO, social media, and content marketing' },
    { name: 'BizConsult Group', slug: 'bizconsult', field: 'Business Consulting', desc: 'Strategy, operations, and business development' },
  ]

  const companies = []
  for (let i = 0; i < companiesData.length; i++) {
    const company = await prisma.company.create({
      data: {
        name: companiesData[i].name,
        slug: companiesData[i].slug,
        description: companiesData[i].desc,
        fieldOfExpertise: companiesData[i].field,
        status: i < 4 ? 'ACTIVE' : 'PENDING',
        email: `info@${companiesData[i].slug}.com`,
        phone: `+254 7${Math.floor(Math.random() * 90000000) + 10000000}`,
        location: 'Nairobi, Kenya',
        website: `https://${companiesData[i].slug}.com`,
        users: {
          connect: { id: companyUsers[i % companyUsers.length].id }
        }
      }
    })
    companies.push(company)
    console.log(`✅ Created company: ${company.name}`)

    // Add services for each company
    const services = [
      { title: `${companiesData[i].field} Consultation`, description: `Expert ${companiesData[i].field.toLowerCase()} consultation services`, pricing: 'KES 5,000 - 15,000/hour' },
      { title: `Custom ${companiesData[i].field} Solutions`, description: `Tailored solutions for your business needs`, pricing: 'Project-based' },
      { title: `${companiesData[i].field} Strategy`, description: `Strategic planning and execution`, pricing: 'KES 50,000 - 200,000' },
    ]
    
    for (const service of services) {
      await prisma.service.create({
        data: {
          title: service.title,
          description: service.description,
          pricing: service.pricing,
          companyId: company.id
        }
      })
    }
    console.log(`  📦 Added services for ${company.name}`)
  }

  // Create clients (one per client user)
  const clients = []
  const industries = ['Technology', 'Creative', 'Finance', 'Retail', 'Healthcare', 'Education', 'Energy']
  
  for (let i = 0; i < clientUsers.length; i++) {
    const client = await prisma.client.create({
      data: {
        companyName: clientNames[i],
        industry: industries[i % industries.length],
        size: ['1-10', '11-50', '51-200', '201-500'][i % 4],
        status: 'ACTIVE',
        userId: clientUsers[i].id,
      }
    })
    clients.push(client)
    console.log(`✅ Created client: ${client.companyName}`)

    // Add needs for each client
    const needs = [
      { title: 'Website Development', description: 'Need a modern e-commerce website', budgetRange: 'KES 200,000 - 500,000', timeline: '3 months', status: i % 2 === 0 ? 'OPEN' : 'MATCHED' },
      { title: 'Brand Identity Design', description: 'Complete rebranding package', budgetRange: 'KES 100,000 - 300,000', timeline: '2 months', status: 'OPEN' },
    ]
    
    for (let j = 0; j < 2; j++) {
      await prisma.clientNeed.create({
        data: {
          title: needs[j].title,
          description: needs[j].description,
          budgetRange: needs[j].budgetRange,
          timeline: needs[j].timeline,
          status: needs[j].status,
          clientId: client.id
        }
      })
    }
    console.log(`  📋 Added needs for ${client.companyName}`)
  }

  // Create spaces for booking
  const spaces = [
    { name: 'Executive Boardroom', type: 'BOARDROOM', capacity: 12, hourlyRate: 7500, dailyRate: 50000 },
    { name: 'Creative Studio', type: 'MEETING_ROOM', capacity: 8, hourlyRate: 4500, dailyRate: 30000 },
    { name: 'Private Office - A', type: 'OFFICE', capacity: 4, hourlyRate: 3500, dailyRate: 20000 },
    { name: 'Training Room', type: 'MEETING_ROOM', capacity: 20, hourlyRate: 10000, dailyRate: 70000 },
    { name: 'Virtual Office', type: 'OFFICE', capacity: 2, hourlyRate: 2500, dailyRate: 15000 },
  ]

  for (const space of spaces) {
    await prisma.space.create({
      data: {
        name: space.name,
        type: space.type as any,
        capacity: space.capacity,
        description: `Premium ${space.name} with modern amenities`,
        hourlyRate: space.hourlyRate,
        dailyRate: space.dailyRate,
        isActive: true,
      }
    })
  }
  console.log(`✅ Created ${spaces.length} spaces`)

  // Create engagements (matches between clients and companies)
  const stages = ['MATCHED', 'PROPOSAL', 'ACTIVE', 'COMPLETED', 'ARCHIVED']
  const engagementData = []
  
  for (let i = 0; i < 25; i++) {
    const client = clients[i % clients.length]
    const company = companies[i % companies.length]
    const stage = stages[Math.floor(Math.random() * stages.length)]
    const dealValue = Math.floor(Math.random() * 500000) + 50000
    const startedAt = new Date()
    startedAt.setMonth(startedAt.getMonth() - Math.floor(Math.random() * 6))
    
    const engagement = await prisma.engagement.create({
      data: {
        clientId: client.id,
        companyId: company.id,
        stage: stage as any,
        dealValue: dealValue,
        notes: `Initial discussion about ${stage === 'COMPLETED' ? 'successful project' : 'potential collaboration'}`,
        startedAt: startedAt,
        completedAt: stage === 'COMPLETED' ? new Date() : null,
        matchedBy: admin.id,
      }
    })
    engagementData.push(engagement)
    
    // Add timeline entries
    const timelineStages = ['MATCHED']
    if (stage !== 'MATCHED') timelineStages.push('PROPOSAL')
    if (stage === 'ACTIVE' || stage === 'COMPLETED') timelineStages.push('ACTIVE')
    if (stage === 'COMPLETED') timelineStages.push('COMPLETED')
    
    let currentDate = new Date(startedAt)
    for (let t = 0; t < timelineStages.length; t++) {
      currentDate.setDate(currentDate.getDate() + Math.floor(Math.random() * 14) + 3)
      await prisma.engagementTimeline.create({
        data: {
          engagementId: engagement.id,
          stage: timelineStages[t] as any,
          note: `Moved to ${timelineStages[t]} stage`,
          createdAt: currentDate
        }
      })
    }
  }
  console.log(`✅ Created ${engagementData.length} engagements`)

  // Create bookings
  const bookingStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
  const allSpaces = await prisma.space.findMany()
  
  for (let i = 0; i < 30; i++) {
    const client = clients[i % clients.length]
    const space = allSpaces[i % allSpaces.length]
    const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)]
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30))
    const endDate = new Date(startDate)
    endDate.setHours(startDate.getHours() + Math.floor(Math.random() * 4) + 1)
    
    await prisma.booking.create({
      data: {
        spaceId: space.id,
        clientId: client.id,
        createdById: admin.id,
        startTime: startDate,
        endTime: endDate,
        totalAmount: space.hourlyRate * Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)),
        status: status as any,
        notes: `Booking for ${client.companyName} team meeting`,
      }
    })
  }
  console.log(`✅ Created 30 bookings`)

  // Create notifications
  const allUsers = [...companyUsers, ...clientUsers, admin]
  for (let i = 0; i < 50; i++) {
    await prisma.notification.create({
      data: {
        title: i % 3 === 0 ? 'New Engagement Match' : i % 3 === 1 ? 'Booking Confirmed' : 'Message Received',
        message: i % 3 === 0 ? 'You have been matched with a new client' : i % 3 === 1 ? 'Your workspace booking has been confirmed' : 'You have a new message from a client',
        type: i % 3 === 0 ? 'MATCH_ALERT' : i % 3 === 1 ? 'BOOKING_CONFIRMATION' : 'MESSAGE',
        userId: allUsers[i % allUsers.length].id,
        isRead: Math.random() > 0.5,
      }
    })
  }
  console.log(`✅ Created 50 notifications`)

  // Create reminders
  for (let i = 0; i < 20; i++) {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 14))
    await prisma.reminder.create({
      data: {
        title: i % 3 === 0 ? 'Follow up with client' : i % 3 === 1 ? 'Submit proposal' : 'Complete onboarding',
        description: i % 3 === 0 ? 'Send proposal to matched client' : i % 3 === 1 ? 'Draft and send project proposal' : 'Complete company profile setup',
        dueDate: dueDate,
        isCompleted: Math.random() > 0.7,
        userId: allUsers[i % allUsers.length].id,
      }
    })
  }
  console.log(`✅ Created 20 reminders`)

  console.log('\n🎉 Database seeding completed!')
  console.log('\n📊 Test Credentials:')
  console.log('  🔐 Admin: admin@sndbx.com / Admin123!')
  console.log('  🏢 Company Rep: company1@example.com / password123')
  console.log('  👤 Client: client1@example.com / password123')
  console.log('\n📈 Test Data Summary:')
  console.log(`  - ${companies.length} companies (${companies.filter(c => c.status === 'ACTIVE').length} active)`)
  console.log(`  - ${clients.length} clients`)
  console.log(`  - ${engagementData.length} engagements`)
  console.log(`  - 30 bookings`)
  console.log(`  - ${spaces.length} spaces`)
  console.log(`  - 50 notifications`)
  console.log(`  - 20 reminders`)
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
