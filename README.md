# SNDBX Platform - Business Ecosystem Operations Platform

![SNDBX Platform](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-green)
![License](https://img.shields.io/badge/license-MIT-green)

## 📌 Overview

SNDBX Platform is a comprehensive digital operations platform for managed business hubs that operate across three distinct service lines: curated workspace leasing, specialist company ecosystem management, and active client-to-company deal facilitation.

The platform consolidates these operations into a single, role-based digital system with four core modules: Company Onboarding, Client Portal, Workspace Booking, and Admin Dashboard.

### Key Features

- **Multi-role Dashboard** (Admin, Company Rep, Client)
- **Company Management** with approval workflow
- **Client Management** with needs tracking
- **AI-Powered Matching System** - Suggests top 3 companies based on client needs
- **Workspace Booking** with calendar and real-time availability
- **Engagement Pipeline** tracking (Matched → Proposal → Active → Completed)
- **Financial Management** with automated invoicing
- **Support Ticket System** for clients and companies
- **Real-time Notifications**
- **Team Collaboration Features**

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts

### Backend
- **API Routes**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Validation**: Zod

### Key Libraries
- `react-hook-form` - Form handling
- `bcryptjs` - Password hashing
- `date-fns` - Date utilities
- `clsx` + `tailwind-merge` - Class management

## 📁 Project Structure
src/
├── app/
│ ├── admin/ # Admin dashboard
│ ├── auth/ # Authentication pages
│ ├── portal/ # User portal (client & company)
│ │ ├── client/ # Client dashboard
│ │ └── company/ # Company dashboard
│ ├── api/ # API routes
│ └── page.tsx # Landing page
├── components/ # Reusable components
├── lib/ # Utilities and configs
├── hooks/ # Custom React hooks
├── types/ # TypeScript types
└── styles/ # Global styles

text

## 👥 User Roles

| Role | Access Level | Key Capabilities |
|------|--------------|------------------|
| **Super Admin** | Full platform access | All modules, user management, platform settings |
| **Admin** | Platform management | Company approval, matching, booking management |
| **Company Rep** | Company-scoped access | Profile management, services, client engagements |
| **Client** | Client-scoped access | Browse companies, bookings, engagement tracking |

## 🏗️ Key Modules

### 1. Company Onboarding
- Company registration and profile management
- Service catalogue management
- Document vault for credentials
- Admin approval workflow

### 2. Client Portal
- Company directory browsing
- Needs intake form
- Match dashboard
- Engagement timeline tracking

### 3. Workspace Booking
- Real-time availability checking
- Automated invoice generation
- Booking confirmation workflow
- Calendar integration

### 4. Admin Dashboard
- Platform analytics and metrics
- Company approval queue
- Client-company matching interface
- Financial overview
- Support ticket management

## 🔧 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/sndbx-platform.git
cd sndbx-platform
Install dependencies

bash
npm install --legacy-peer-deps
Set up environment variables

bash
cp .env.example .env
# Edit .env with your database URL and auth secrets
Set up the database

bash
npx prisma generate
npx prisma db push
npx prisma db seed
Run the development server

bash
npm run dev
Open http://localhost:3000

🔐 Environment Variables
env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/sndbx_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
📊 Test Credentials
Role	Email	Password
Super Admin	admin@sndbx.com	Admin123!
Company Rep	company1@example.com	password123
Client	client1@example.com	password123
🚢 Deployment
Deploy to Vercel
Push your code to GitHub

Import the project on Vercel

Add environment variables

Deploy

Deploy to Railway (Database)
Create a PostgreSQL database on Railway

Copy the connection string

Add to your environment variables

📈 Seed Data
The platform includes seed data for testing:

6 companies (4 active, 2 pending)

7 clients

25 engagements

30 bookings

5 bookable spaces

🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
SNDBX International for the vision and ecosystem concept

Next.js team for the amazing framework

All contributors and supporters

📧 Contact
For support or inquiries, please contact: hello@sndbx.com

Built with ❤️ for the SNDBX Ecosystem
