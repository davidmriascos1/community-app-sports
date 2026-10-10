import { useState } from 'react';

import { getFamiliarity } from '@/features/community/familiarity';
import { useGymData } from '@/hooks/useGymData';
import { useSession } from '@/hooks/useSession';
import { buildClassView, type ClassView, type Loadable } from '@/hooks/useTodaysClasses';

/** One class, built the same way as the cards on Home. `null` if the class does not exist. */
export function useClassDetail(classId: string): Loadable<ClassView | null> {
  const { currentUser } = useSession();
  const { state } = useGymData();
  const [now] = useState(() => new Date());

  if (state.status !== 'ready' || !currentUser) {
    return state.status === 'error' ? state : { status: 'loading' };
  }

  const { data } = state;
  const gymClass = data.classes.find((c) => c.id === classId);
  if (!gymClass) return { status: 'ready', value: null };

  const familiarity = getFamiliarity(data.bookings, currentUser.id);
  return { status: 'ready', value: buildClassView(gymClass, data, currentUser.id, familiarity, now) };
}
