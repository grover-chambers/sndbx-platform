import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sndbx.com' },
    update: {},
    create: {
      email: 'admin@sndbx.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      status: 'active',
    },
  })
  console.log('Admin created:', admin.email)

  // Create company user
  const companyPassword = await bcrypt.hash('password123', 10)
  const companyUser = await prisma.user.upsert({
    where: { email: 'company1@example.com' },
    update: {},
    create: {
      email: 'company1@example.com',
      name: 'Tech Corp',
      password: companyPassword,
      role: 'COMPANY_REP',
      status: 'active',
      company: {
        create: {
          name: 'Tech Corp',
          slug: 'tech-corp',
          status: 'APPROVED',
          fieldOfExpertise: 'Software Development',
        }
      }
    },
  })
  console.log('Company user created:', companyUser.email)

  // Create client user
  const clientPassword = await bcrypt.hash('password123', 10)
  const clientUser = await prisma.user.upsert({
    where: { email: 'client1@example.com' },
    update: {},
    create: {
      email: 'client1@example.com',
      name: 'John Client',
      password: clientPassword,
      role: 'CLIENT',
      status: 'active',
      clientProfile: {
        create: {
          companyName: 'Client Company Inc',
          status: 'ACTIVE',
        }
      }
    },
  })
  console.log('Client user created:', clientUser.email)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
