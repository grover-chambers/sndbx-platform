'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertTriangle, CheckCircle, MessageSquare, User, Building2, Clock } from 'lucide-react';
import { Engagement, EngagementSupervision, User } from '@prisma/client';

interface Props {
  engagement: Engagement & {
    supervision: EngagementSupervision | null;
    client: { user: Pick<User, 'id' | 'name' | 'email'> };
    company: { name: string; users: Pick<User, 'id' | 'name'>[] };
  };
  adminUser: Pick<User, 'id' | 'name'>;
}

export function EngagementSupervisionPanel({ engagement, adminUser }: Props) {
  const [reviewNote, setReviewNote] = useState('');
  const [pendingMessages, setPendingMessages] = useState<any[]>([]);

  const supervision = engagement.supervision;

  const handleApproveContact = async () => {
    const res = await fetch(`/api/engagements/${engagement.id}/supervision/approve-contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        adminUserId: adminUser.id, 
        reason: reviewNote || 'Manual approval by admin' 
      }),
    });
    if (res.ok) {
      window.location.reload();
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Shield className="h-5 w-5" />
            Engagement Supervision
          </CardTitle>
          <Badge variant={supervision?.contactApproved ? 'default' : 'secondary'}>
            {supervision?.contactApproved ? '✅ Contact Approved' : '🔒 Supervised'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Client:</span>
            <span>{engagement.client.user.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Company:</span>
            <span>{engagement.company.name}</span>
          </div>
        </div>

        <div className="space-y-3 p-3 bg-white dark:bg-slate-900 rounded-lg border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Supervision Level</span>
            <Badge variant="outline">{supervision?.supervisionLevel || 'FULL'}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Direct Contact Allowed</span>
            <Badge variant={supervision?.contactApproved ? 'default' : 'destructive'}>
              {supervision?.contactApproved ? 'Yes' : 'No'}
            </Badge>
          </div>

          {!supervision?.contactApproved && (
            <Button 
              size="sm" 
              variant="default" 
              className="w-full"
              onClick={handleApproveContact}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Direct Contact
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Admin Note (optional)</label>
          <Textarea
            placeholder="Add context for your action..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            className="min-h-[60px]"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Post as Admin
          </Button>
          <Button variant="outline" size="sm" className="text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Flag for Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// === AUDIT LOG TAB INTEGRATION ===

// Add this import:
// import { SupervisionAuditLog } from './audit/SupervisionAuditLog';

// Add state for active tab:
// const [activeTab, setActiveTab] = useState<'chat' | 'audit'>('chat');

// Add tab navigation in the component JSX:
/*
  <div className="flex border-b mb-4">
    <button
      className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
        activeTab === 'chat' 
          ? 'border-primary text-primary' 
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
      onClick={() => setActiveTab('chat')}
    >
      Chat Review
    </button>
    <button
      className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
        activeTab === 'audit' 
          ? 'border-primary text-primary' 
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
      onClick={() => setActiveTab('audit')}
    >
      Audit Log
    </button>
  </div>
  
  {activeTab === 'audit' && (
    <SupervisionAuditLog engagementId={engagement.id} />
  )}
*/
