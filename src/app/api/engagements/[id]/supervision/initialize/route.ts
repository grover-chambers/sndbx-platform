import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EngagementSupervisionService } from '@/lib/services/engagement-supervision.service';
import { z } from 'zod';

const initSchema = z.object({
  adminUserId: z.string(),
  supervisionLevel: z.enum(['FULL', 'AUDIT_ONLY', 'NONE']).optional().default('FULL'),
  escalationKeywords: z.array(z.string()).optional().default([]),
  autoApproveThreshold: z.number().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const validated = initSchema.parse(body);

    // Check if supervision already exists
    const existing = await prisma.engagementSupervision.findUnique({
      where: { engagementId: id }
    });

    if (existing) {
      return NextResponse.json({ 
        success: true, 
        supervision: existing,
        message: 'Supervision already initialized' 
      });
    }

    const result = await EngagementSupervisionService.initializeSupervision(id, validated.adminUserId);

    // Update with custom settings if provided
    if (validated.escalationKeywords.length > 0 || validated.autoApproveThreshold) {
      await prisma.engagementSupervision.update({
        where: { engagementId: id },
        data: {
          escalationKeywords: validated.escalationKeywords,
          autoApproveThreshold: validated.autoApproveThreshold,
          supervisionLevel: validated.supervisionLevel,
        }
      });
    }

    return NextResponse.json({ success: true, supervision: result }, { status: 201 });

  } catch (error) {
    console.error('Supervision init error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
