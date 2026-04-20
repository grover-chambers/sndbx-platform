import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EngagementSupervisionService } from '@/lib/services/engagement-supervision.service';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1).max(5000),
  messageType: z.enum(['TEXT', 'FILE', 'ADMIN_NOTE']).optional().default('TEXT'),
  attachments: z.array(z.string().url()).optional().default([]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const validated = messageSchema.parse(body);

    const engagement = await prisma.engagement.findUnique({
      where: { id: id },
      include: { 
        client: { include: { user: true }}, 
        company: { include: { users: true }},
        supervision: true
      }
    });

    if (!engagement) {
      return NextResponse.json({ error: 'Engagement not found' }, { status: 404 });
    }

    const isClient = engagement.client.userId === session.user.id;
    const isCompanyRep = engagement.company.users.some(u => u.id === session.user.id);
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';

    if (!isClient && !isCompanyRep && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { message, requiresReview } = await EngagementSupervisionService.sendMessage({
      engagementId: id,
      senderId: session.user.id,
      content: validated.content,
      messageType: validated.messageType,
      attachments: validated.attachments,
    });

    if (requiresReview && !isAdmin) {
      return NextResponse.json({
        message: { ...message, status: 'PENDING_REVIEW', notice: 'Your message is pending admin review.' },
        requiresReview: true,
      }, { status: 202 });
    }

    return NextResponse.json({ message, requiresReview: false }, { status: 201 });

  } catch (error) {
    console.error('Message send error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { cursor, limit } = Object.fromEntries(request.nextUrl.searchParams);

    const engagement = await prisma.engagement.findUnique({
      where: { id: id },
      include: { client: { include: { user: true }}, company: { include: { users: true }}},
    });

    if (!engagement) {
      return NextResponse.json({ error: 'Engagement not found' }, { status: 404 });
    }

    const isClient = engagement.client.userId === session.user.id;
    const isCompanyRep = engagement.company.users.some(u => u.id === session.user.id);
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';

    if (!isClient && !isCompanyRep && !isAdmin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const messages = await EngagementSupervisionService.getMessagesForUser({
      engagementId: id,
      userId: session.user.id,
      userRole: session.user.role,
      limit: limit ? parseInt(limit) : 50,
      cursor: cursor as string | undefined,
    });

    if (isClient) {
      await prisma.engagementMessage.updateMany({
        where: { id, isReadByClient: false, senderId: { not: session.user.id }},
        data: { isReadByClient: true },
      });
    } else if (isCompanyRep) {
      await prisma.engagementMessage.updateMany({
        where: { id, isReadByCompany: false, senderId: { not: session.user.id }},
        data: { isReadByCompany: true },
      });
    }

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Message fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
