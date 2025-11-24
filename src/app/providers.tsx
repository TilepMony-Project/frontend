'use client';

import { StrictMode, useEffect } from 'react';
import TagManager from 'react-gtm-module';
import { setAutoFreeze } from 'immer';
import { ReactFlowProvider } from '@xyflow/react';
import '@/features/i18n';

// Disable immer's automatic object freezing because ReactFlow mutates objects under the hood
// and requires this to be turned off to function properly, especially when node size is updated
setAutoFreeze(false);

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize GTM if GTM_ID is available
    const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
    if (gtmId) {
      TagManager.initialize({
        gtmId,
      });
    }
  }, []);

  return (
    <StrictMode>
      <ReactFlowProvider>
        {children}
      </ReactFlowProvider>
    </StrictMode>
  );
}

