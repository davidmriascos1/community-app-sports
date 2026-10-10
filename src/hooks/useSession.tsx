import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Profile } from '@/types';

// Mock session: "logging in" just remembers which member you picked.
// Real Supabase auth will replace the inside of this provider; screens keep
// calling useSession() the same way.

interface Session {
  currentUser: Profile | null;
  logIn: (profile: Profile) => void;
  logOut: () => void;
}

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);

  return (
    <SessionContext.Provider
      value={{ currentUser, logIn: setCurrentUser, logOut: () => setCurrentUser(null) }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside SessionProvider');
  return session;
}
