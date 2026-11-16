/* ==========================================================================
   SpeakerDraft Web — Main App Component
   The actual routing is handled by Router in app/router.tsx
   This file exists for compatibility and future app-level providers
   ========================================================================== */

import { ReactNode } from 'react';
import { ErrorBoundary } from './app/providers';

interface AppProps {
  children?: ReactNode;
}

export function App({ children }: AppProps) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}

export default App;