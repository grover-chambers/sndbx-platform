import { useCallback } from 'react';

export function useEngagementSupervision() {
  
  const initializeSupervision = useCallback(async (engagementId: string) => {
    try {
      const response = await fetch(`/api/engagements/${engagementId}/supervision/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to initialize supervision:', error);
      throw error;
    }
  }, []);

  return { initializeSupervision };
}
