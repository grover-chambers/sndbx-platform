'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  engagementId: string;
}

export function SupervisionConsentModal({ open, onOpenChange, onAccept, engagementId }: Props) {
  const [consent, setConsent] = useState(false);

  const handleAccept = () => {
    if (consent) {
      onAccept();
      onOpenChange(false);
      setConsent(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Communication Supervision
          </DialogTitle>
          <DialogDescription>
            To ensure quality and protect both parties, this engagement uses supervised communications.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-2">
              <p><strong>What this means:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Messages are reviewed by SNDBX Admin before delivery (initial phase)</li>
                <li>Admin has visibility into all communications for quality assurance</li>
                <li>Admin can intervene to provide guidance or resolve issues</li>
                <li>Direct contact can be approved after key milestones</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p><strong>Your privacy:</strong></p>
              <p className="text-muted-foreground">
                All data is encrypted and retained per our privacy policy. 
                You can request export or deletion of your engagement data at any time.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <Checkbox 
              id="consent" 
              checked={consent} 
              onCheckedChange={(checked) => setConsent(checked as boolean)} 
            />
            <label
              htmlFor="consent"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand and consent to supervised communications for this engagement
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAccept} disabled={!consent}>
            I Agree & Start Engagement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
