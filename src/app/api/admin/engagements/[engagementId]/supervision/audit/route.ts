import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const auditQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  eventType: z.string().optional(),
  actorId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { engagementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { engagementId } = params;
    const { searchParams } = new URL(request.url);
    const validated = auditQuerySchema.parse(Object.fromEntries(searchParams));

    // Verify engagement exists and user has access
    const engagement = await prisma.engagement.findUnique({
      where: { id: engagementId },
      include: { 
        client: { include: { user: true }}, 
        company: { include: { users: true }} 
      }
    });

    if (!engagement) {
      return NextResponse.json({ error: 'Engagement not found' }, { status: 404 });
    }

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';
    const isClient = engagement.client.userId === session.user.id;
    const isCompanyRep = engagement.company.users.some(u => u.id === session.user.id);

    if (!isAdmin && !isClient && !isCompanyRep) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build where clause for filtering
    const where: any = { engagementId };
    
    if (validated.eventType) {
      where.eventType = validated.eventType;
    }
    if (validated.actorId) {
      where.actorId = validated.actorId;
    }
    if (validated.dateFrom || validated.dateTo) {
      where.createdAt = {};
      if (validated.dateFrom) where.createdAt.gte = new Date(validated.dateFrom);
      if (validated.dateTo) where.createdAt.lte = new Date(validated.dateTo);
    }
    if (validated.search) {
      where.OR = [
        { notes: { contains: validated.search, mode: 'insensitive' }},
        { eventType: { contains: validated.search, mode: 'insensitive' }},
      ];
    }

    // Fetch audit events with pagination
    const events = await prisma.supervisionEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: validated.limit + 1, // +1 to check for next page
      skip: validated.cursor ? 1 : 0,
      cursor: validated.cursor ? { id: validated.cursor } : undefined,
      include: {
        actor: { select: { id: true, name: true, email: true, role: true }},
      },
    });

    // Determine if there's a next page
    let nextCursor: string | undefined = undefined;
    if (events.length > validated.limit) {
      const nextItem = events.pop();
      nextCursor = nextItem?.id;
    }

    return NextResponse.json({
      events,
      pagination: {
        limit: validated.limit,
        nextCursor,
        hasMore: !!nextCursor,
      },
    });

  } catch (error) {
    console.error('Audit log fetch error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
