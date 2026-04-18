import { EngagementMessage } from '@prisma/client';

export class KeywordEscalationService {
  
  // Default escalation keywords - can be customized per engagement
  static readonly DEFAULT_KEYWORDS = [
    // Financial terms
    'payment', 'pay', 'invoice', 'bill', 'transfer', 'bank', 'account', 'wire',
    'fee', 'cost', 'price', 'quote', 'estimate', 'budget',
    
    // Legal/contract terms  
    'contract', 'agreement', 'nda', 'confidential', 'terms', 'sign', 'signature',
    'legal', 'lawyer', 'attorney', 'dispute', 'liability',
    
    // Bypass attempts
    'direct', 'email', 'phone', 'whatsapp', 'telegram', 'signal', 'contact',
    'outside', 'bypass', 'platform', 'sndbx', 'admin',
    
    // Sensitive data
    'password', 'credential', 'login', 'access', 'token', 'api', 'key',
    'personal', 'ssn', 'id number', 'passport'
  ];

  static analyzeMessage(content: string, customKeywords: string[] = []): {
    flagged: boolean;
    matchedKeywords: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    reason?: string;
  } {
    const keywords = [...this.DEFAULT_KEYWORDS, ...customKeywords];
    const lowerContent = content.toLowerCase();
    
    const matched = keywords.filter(kw => 
      lowerContent.includes(kw.toLowerCase())
    );
    
    if (matched.length === 0) {
      return { flagged: false, matchedKeywords: [], riskLevel: 'LOW' };
    }
    
    // Determine risk level based on keyword categories
    const financial = matched.filter(k => ['payment', 'invoice', 'bank', 'transfer'].includes(k));
    const legal = matched.filter(k => ['contract', 'nda', 'legal', 'dispute'].includes(k));
    const bypass = matched.filter(k => ['direct', 'email', 'phone', 'whatsapp', 'bypass'].includes(k));
    
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let reason = '';
    
    if (bypass.length > 0) {
      riskLevel = 'HIGH';
      reason = 'Potential platform bypass attempt detected';
    } else if (financial.length > 0 || legal.length > 0) {
      riskLevel = 'MEDIUM';
      reason = 'Sensitive financial/legal terms detected';
    } else {
      riskLevel = 'LOW';
      reason = 'Keyword match for admin awareness';
    }
    
    return {
      flagged: true,
      matchedKeywords: matched,
      riskLevel,
      reason
    };
  }

  static shouldAutoHold(analysis: ReturnType<typeof this.analyzeMessage>, supervisionLevel: string): boolean {
    if (supervisionLevel === 'NONE') return false;
    if (analysis.riskLevel === 'HIGH') return true;
    if (supervisionLevel === 'FULL' && analysis.flagged) return true;
    return false;
  }
}
