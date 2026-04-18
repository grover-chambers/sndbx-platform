import { prisma } from '@/lib/prisma';
import { EngagementStage, SupervisionLevel, MessageVisibility } from '@prisma/client';

export class EngagementSupervisionService {
  
  static async initializeSupervision(engagementId: string, adminUserId: string) {
    return prisma.engagementSupervision.create({
      data: {
        engagementId,
        supervisionLevel: SupervisionLevel.FULL,
        contactApproved: false,
        consentGiven: true,
        consentTimestamp: new Date(),
        supervisionNotice: 'All communications are supervised by SNDBX Admin to ensure quality and protect both parties.',
      },
    });
  }

  static async sendMessage({
    engagementId,
    senderId,
    content,
    messageType = 'TEXT',
    attachments = [],
  }: {
    engagementId: string;
    senderId: string;
    content: string;
    messageType?: string;
    attachments?: string[];
  }) {
    const engagement = await prisma.engagement.findUnique({
      where: { id: engagementId },
      include: { supervision: true, client: { include: { user: true }}, company: true }
    });

    if (!engagement || !engagement.supervision) {
      throw new Error('Engagement or supervision not found');
    }

    const { supervision } = engagement;
    let status = 'SENT';
    let requiresReview = false;

    if (supervision.supervisionLevel === SupervisionLevel.FULL) {
      requiresReview = true;
      status = 'PENDING_REVIEW';
    }

    const keywords = supervision.escalationKeywords || [];
    const hasKeyword = keywords.some(kw => 
      content.toLowerCase().includes(kw.toLowerCase())
    );
    if (hasKeyword) {
      requiresReview = true;
      status = 'PENDING_REVIEW';
    }

    if (engagement.dealValue && supervision.autoApproveThreshold) {
      if (engagement.dealValue < supervision.autoApproveThreshold) {
        requiresReview = false;
        status = 'SENT';
      }
    }

    const message = await prisma.engagementMessage.create({
      data: {
        engagementId,
        senderId,
        content,
        messageType,
        attachments,
        status,
        visibility: MessageVisibility.ALL,
      },
      include: { sender: { select: { id: true, name: true, email: true, role: true }}}
    });

    await prisma.supervisionEvent.create({
      data: {
        engagementId,
        eventType: 'MESSAGE_SENT',
        actorId: senderId,
        metadata: { messageId: message.id, requiresReview, status },
      },
    });

    return { message, requiresReview };
  }

  static async reviewMessage({
    messageId,
    adminUserId,
    action,
    notes,
    redactedContent,
  }: {
    messageId: string;
    adminUserId: string;
    action: 'APPROVE' | 'REJECT' | 'REDACT';
    notes?: string;
    redactedContent?: string;
  }) {
    const updateData: any = {
      status: action === 'APPROVE' ? 'SENT' : action === 'REJECT' ? 'REJECTED' : 'REDACTED',
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
    };

    if (action === 'REDACT' && redactedContent) {
      updateData.content = redactedContent;
    }
    if (action === 'REJECT' && notes) {
      updateData.rejectionReason = notes;
    }

    const updated = await prisma.engagementMessage.update({
      where: { id: messageId },
      data: updateData,
      include: { engagement: { include: { supervision: true }}}
    });

    await prisma.supervisionEvent.create({
      data: {
        engagementId: updated.engagementId,
        eventType: `MESSAGE_${action}`,
        actorId: adminUserId,
        notes,
        metadata: { messageId, originalStatus: updated.status },
      },
    });

    return updated;
  }

  static async approveContact({
    engagementId,
    adminUserId,
    reason,
  }: {
    engagementId: string;
    adminUserId: string;
    reason?: string;
  }) {
    const updated = await prisma.engagementSupervision.update({
      where: { engagementId },
      data: {
        contactApproved: true,
        contactApprovedAt: new Date(),
        contactApprovedBy: adminUserId,
        supervisionLevel: SupervisionLevel.AUDIT_ONLY,
      },
      include: { engagement: true }
    });

    await prisma.engagementMessage.create({
      data: {
        engagementId,
        senderId: adminUserId,
        content: `🎉 Direct contact approved! You may now share contact information. Reason: ${reason || 'Milestone reached'}`,
        messageType: 'SYSTEM',
        isAdminMessage: true,
        visibility: MessageVisibility.ALL,
      },
    });

    await prisma.supervisionEvent.create({
      data: {
        engagementId,
        eventType: 'CONTACT_APPROVED',
        actorId: adminUserId,
        notes: reason,
      },
    });

    return updated;
  }

  static async getMessagesForUser({
    engagementId,
    userId,
    userRole,
    limit = 50,
    cursor,
  }: {
    engagementId: string;
    userId: string;
    userRole: string;
    limit?: number;
    cursor?: string;
  }) {
    const where: any = { engagementId };

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Admins see everything
    } else if (userRole === 'CLIENT') {
      where.OR = [
        { visibility: MessageVisibility.ALL },
        { visibility: MessageVisibility.CLIENT_COMPANY },
        { isAdminMessage: true },
      ];
    } else if (userRole === 'COMPANY_REP') {
      where.OR = [
        { visibility: MessageVisibility.ALL },
        { visibility: MessageVisibility.CLIENT_COMPANY },
        { isAdminMessage: true },
      ];
    }

    return prisma.engagementMessage.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        sender: { select: { id: true, name: true, role: true }},
      },
    });
  }
}

// === KEYWORD ESCALATION INTEGRATION ===
import { KeywordEscalationService } from './keyword-escalation.service';

// Update the sendMessage method's review logic section:
/*
  // REPLACE the existing keyword check with this enhanced version:
  
  // Rule 2: Keyword escalation analysis
  const escalationAnalysis = KeywordEscalationService.analyzeMessage(
    content, 
    supervision.escalationKeywords || []
  );
  
  if (escalationAnalysis.flagged) {
    // Log the escalation event
    await prisma.supervisionEvent.create({
       {
        engagementId,
        eventType: 'KEYWORD_FLAGGED',
        actorId: senderId,
        meta {
          messageId: message.id,
          matchedKeywords: escalationAnalysis.matchedKeywords,
          riskLevel: escalationAnalysis.riskLevel,
          reason: escalationAnalysis.reason
        },
      },
    });
    
    // Auto-hold based on risk level and supervision settings
    if (KeywordEscalationService.shouldAutoHold(escalationAnalysis, supervision.supervisionLevel)) {
      requiresReview = true;
      status = 'PENDING_REVIEW';
    }
  }
*/
