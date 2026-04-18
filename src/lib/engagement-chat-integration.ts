// Helper to integrate supervised chat into engagement pages
import { SupervisedChat } from '@/components/engagement/SupervisedChat';
import { SupervisionConsentModal } from '@/components/engagement/SupervisionConsentModal';
import { EngagementSupervisionPanel } from '@/components/admin/EngagementSupervisionPanel';

export { SupervisedChat, SupervisionConsentModal, EngagementSupervisionPanel };

// Usage example for your engagement/[id]/page.tsx:
/*
  // In your engagement page component:
  import { SupervisedChat, SupervisionConsentModal } from '@/lib/engagement-chat-integration';
  
  // Add state for consent modal
  const [showConsent, setShowConsent] = useState(!engagement.supervision?.consentGiven);
  
  // In your JSX:
  {showConsent && (
    <SupervisionConsentModal
      open={showConsent}
      onOpenChange={setShowConsent}
      onAccept={async () => {
        // Call API to record consent
        await fetch(`/api/engagements/${engagement.id}/supervision/consent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: session.user.id }),
        });
      }}
      engagementId={engagement.id}
    />
  )}
  
  {/* Chat Section */}
  <SupervisedChat
    engagementId={engagement.id}
    currentUser={{ id: session.user.id, name: session.user.name, role: session.user.role }}
    otherParty={{ 
      name: isClient ? engagement.company.name : engagement.client.user.name,
      role: isClient ? 'COMPANY_REP' : 'CLIENT'
    }}
    supervisionNotice={engagement.supervision?.supervisionNotice}
    contactApproved={engagement.supervision?.contactApproved}
  />
*/
