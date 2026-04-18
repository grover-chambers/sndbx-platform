'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Shield, ArrowRight } from 'lucide-react';
import { Engagement, EngagementSupervision } from '@prisma/client';

interface Props {
  engagement: Engagement & { supervision: EngagementSupervision | null };
  hasUnreadMessages?: boolean;
  className?: string;
}

export function EngagementChatCTA({ engagement, hasUnreadMessages = false, className = '' }: Props) {
  const chatUrl = `/engagements/${engagement.id}#chat`;
  const supervision = engagement.supervision;
  
  const getStatusConfig = () => {
    if (!supervision) return { icon: '💬', label: 'Chat', variant: 'default' as const };
    if (supervision.contactApproved) return { icon: '💬', label: 'Direct Chat', variant: 'default' as const };
    return { icon: '🔒', label: 'Supervised Chat', variant: 'outline' as const };
  };
  
  const status = getStatusConfig();

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{status.icon}</span>
              <h4 className="font-medium text-sm truncate">
                Chat: {engagement.company.name}
              </h4>
              {hasUnreadMessages && (
                <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
              )}
            </div>
            
            <p className="text-xs text-muted-foreground mb-2">
              {supervision?.contactApproved 
                ? 'Direct messaging enabled' 
                : 'Admin-reviewed messages for quality assurance'}
            </p>
            
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="secondary" className="text-[10px]">
                Stage: {engagement.stage}
              </Badge>
              {supervision?.supervisionLevel && supervision.supervisionLevel !== 'NONE' && (
                <Badge variant="outline" className="text-[10px]">
                  {supervision.supervisionLevel}
                </Badge>
              )}
            </div>
          </div>
          
          <Button 
            asChild 
            size="sm" 
            variant={status.variant}
            className="flex-shrink-0"
          >
            <a href={chatUrl} className="flex items-center gap-1">
              Open
              <ArrowRight className="h-3 w-3" />
            </a>
          </Button>
        </div>
        
        {/* Quick action: Request direct contact */}
        {!supervision?.contactApproved && engagement.stage === 'ACTIVE' && (
          <div className="mt-3 pt-3 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={(e) => {
                e.preventDefault();
                // Could trigger a request to admin for contact approval
                alert('Request sent to admin for direct contact approval');
              }}
            >
              <Shield className="h-3 w-3 mr-1" />
              Request direct contact
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
