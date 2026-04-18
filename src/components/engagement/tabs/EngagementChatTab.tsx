'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { SupervisedChat } from '../SupervisedChat';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, MessageSquare, Clock } from 'lucide-react';
import { Engagement, EngagementSupervision, User } from '@prisma/client';

interface Props {
  engagement: Engagement & {
    supervision: EngagementSupervision | null;
    client: { user: Pick<User, 'id' | 'name' | 'email'> };
    company: { name: string; users: Pick<User, 'id' | 'name'>[] };
  };
}

export function EngagementChatTab({ engagement }: Props) {
  const {  session } = useSession();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!session?.user) return null;

  const currentUser = {
    id: session.user.id,
    name: session.user.name,
    role: session.user.role
  };

  const otherParty = session.user.role === 'CLIENT' 
    ? { name: engagement.company.name, role: 'COMPANY_REP' as const }
    : { name: engagement.client.user.name, role: 'CLIENT' as const };

  const supervision = engagement.supervision;

  return (
    <Card className="border-t-0 rounded-t-none">
      <CardContent className="p-4 space-y-4">
        {/* Tab Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Engagement Chat</h3>
            {!supervision?.contactApproved && (
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                <Shield className="h-3 w-3 mr-1" />
                Supervised
              </Badge>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            {isExpanded ? '▼ Collapse' : '▶ Expand'}
          </button>
        </div>

        {/* Supervision Status Banner */}
        {!supervision?.contactApproved && supervision?.supervisionNotice && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm text-blue-900 dark:text-blue-100">
            <p className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {supervision.supervisionNotice}
            </p>
          </div>
        )}

        {/* Chat Component (conditionally rendered) */}
        {isExpanded && (
          <SupervisedChat
            engagementId={engagement.id}
            currentUser={currentUser}
            otherParty={otherParty}
            supervisionNotice={supervision?.supervisionNotice}
            contactApproved={supervision?.contactApproved}
          />
        )}

        {/* Quick Status Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Messages reviewed by admin
            </span>
            {supervision?.contactApproved && (
              <span className="text-green-600 flex items-center gap-1">
                ✓ Direct contact enabled
              </span>
            )}
          </div>
          <span>Stage: {engagement.stage}</span>
        </div>
      </CardContent>
    </Card>
  );
}
