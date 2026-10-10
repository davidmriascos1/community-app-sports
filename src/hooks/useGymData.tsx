import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { useSession } from '@/hooks/useSession';
import * as repository from '@/lib/classesRepository';
import type { GymData } from '@/lib/classesRepository';
import type { Profile } from '@/types';

// Holds the gym's classes, members and bookings in memory for the logged-in
// member. Home and Class detail both read from here, so when a booking is added
// both screens update without talking to each other.

type GymDataState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: GymData };

interface GymDataContextValue {
  state: GymDataState;
  /** Books the current member into a class. Rejects with a readable message if it is not possible. */
  joinClass: (classId: string) => Promise<void>;
}

const GymDataContext = createContext<GymDataContextValue | null>(null);

const LOGGED_OUT: GymDataContextValue = {
  state: { status: 'loading' },
  joinClass: async () => {
    throw new Error('You need to log in first.');
  },
};

export function GymDataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useSession();

  if (!currentUser) {
    return <GymDataContext.Provider value={LOGGED_OUT}>{children}</GymDataContext.Provider>;
  }
  // The key gives each member a fresh copy of the provider, so nothing from
  // the previous member's session is left over after switching accounts.
  return (
    <LoadedGymDataProvider key={currentUser.id} user={currentUser}>
      {children}
    </LoadedGymDataProvider>
  );
}

function LoadedGymDataProvider({ user, children }: { user: Profile; children: ReactNode }) {
  const [state, setState] = useState<GymDataState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    repository
      .fetchGymData(user.gym_id)
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', message: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [user.gym_id]);

  async function joinClass(classId: string) {
    const booking = await repository.joinClass(classId, user.id);
    setState((current) =>
      current.status === 'ready'
        ? { status: 'ready', data: { ...current.data, bookings: [...current.data.bookings, booking] } }
        : current,
    );
  }

  return <GymDataContext.Provider value={{ state, joinClass }}>{children}</GymDataContext.Provider>;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

export function useGymData(): GymDataContextValue {
  const value = useContext(GymDataContext);
  if (!value) throw new Error('useGymData must be used inside GymDataProvider');
  return value;
}
