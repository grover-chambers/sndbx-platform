import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EngagementSupervisionService } from '@/lib/services/engagement-supervision.service';
import { z } from 'zod';

const reviewSchema = z.object({
  adminUserId: z.string(),
  action: z.enum(['APPROVE', 'REJECT', 'REDACT']),
  notes: z.string().optional(),
  redactedContent: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, messageId } = params;
    const body = await request.json();
    const validated = reviewSchema.parse(body);

    // Verify message belongs to this engagement
    const message = await prisma.engagementMessage.findUnique({
      where: { id: messageId, engagementId },
      include: { engagement: { include: { supervision: true }}}
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Only allow reviewing pending messages
    if (message.status !== 'PENDING_REVIEW' && validated.action !== 'REDACT') {
      return NextResponse.json({ error: 'Message not pending review' }, { status: 400 });
    }

    const result = await EngagementSupervisionService.reviewMessage({
      messageId,
      adminUserId: validated.adminUserId,
      action: validated.action,
      notes: validated.notes,
      redactedContent: validated.redactedContent,
    });

    // Trigger real-time notification if using SSE/WebSocket (optional)
    // await notifyParticipants(id, 'MESSAGE_REVIEWED', { messageId, action: validated.action });

    return NextResponse.json({ 
      success: true, 
      message: result,
      action: validated.action 
    });

  } catch (error) {
    console.error('Message review error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
