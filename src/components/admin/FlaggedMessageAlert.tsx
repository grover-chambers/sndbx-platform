'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Eye, MessageSquare } from 'lucide-react';

interface Props {
  messageId: string;
  engagementId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  matchedKeywords: string[];
  reason?: string;
  onReview: (action: 'APPROVE' | 'REJECT' | 'DEFER') => void;
}

export function FlaggedMessageAlert({ 
  messageId, 
  engagementId, 
  riskLevel, 
  matchedKeywords, 
  reason,
  onReview 
}: Props) {
  const getRiskStyles = () => {
    switch (riskLevel) {
      case 'HIGH': return 'border-red-200 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100';
      case 'MEDIUM': return 'border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100';
      default: return 'border-blue-200 bg-blue-50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100';
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'HIGH': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'MEDIUM': return <Shield className="h-4 w-4 text-amber-600" />;
      default: return <MessageSquare className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Alert className={`border-l-4 ${getRiskStyles()}`}>
      <div className="flex items-start gap-3">
        {getRiskIcon()}
        <div className="flex-1 min-w-0">
          <AlertTitle className="flex items-center gap-2">
            Message Flagged for Review
            <Badge variant={riskLevel === 'HIGH' ? 'destructive' : riskLevel === 'MEDIUM' ? 'secondary' : 'outline'}>
              {riskLevel} Risk
            </Badge>
          </AlertTitle>
          <AlertDescription className="space-y-2 mt-2">
            {reason && <p className="text-sm">{reason}</p>}
            
            <div className="flex flex-wrap gap-1">
              {matchedKeywords.map(kw => (
                <Badge key={kw} variant="outline" className="text-[10px]">
                  "{kw}"
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="default" onClick={() => onReview('APPROVE')}>
                <Eye className="h-3 w-3 mr-1" />
                Approve & Deliver
              </Button>
              <Button size="sm" variant="outline" onClick={() => onReview('REJECT')}>
                Reject
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onReview('DEFER')}>
                Defer to Senior Admin
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
