import { useState } from 'react';

import { getJoinState, hasStarted, type JoinState } from '@/features/classes/capacity';
import { getFamiliarity, type Familiarity } from '@/features/community/familiarity';
import { buildClassSocialView, type ClassSocialView } from '@/features/community/socialView';
import { useGymData } from '@/hooks/useGymData';
import { useSession } from '@/hooks/useSession';
import type { GymData } from '@/lib/classesRepository';
import { isSameDay } from '@/lib/date';
import type { GymClass } from '@/types';

/** Everything a screen needs to draw one class. Screens do no calculation of their own. */
export interface ClassView {
  gymClass: GymClass;
  social: ClassSocialView;
  joinState: JoinState;
  hasStarted: boolean;
}

export function buildClassView(
  gymClass: GymClass,
  data: GymData,
  viewerId: string,
  familiarity: Familiarity,
  now: Date,
): ClassView {
  const started = hasStarted(gymClass, now);
  return {
    gymClass,
    social: buildClassSocialView(gymClass.id, data.bookings, data.members, viewerId, familiarity, started),
    joinState: getJoinState(gymClass, data.bookings, viewerId, now),
    hasStarted: started,
  };
}

export type Loadable<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; value: T };

/** Today's classes at the member's gym, earliest first. */
export function useTodaysClasses(): Loadable<ClassView[]> {
  const { currentUser } = useSession();
  const { state } = useGymData();
  // Read the clock once when the screen mounts, so every card agrees on "now".
  const [now] = useState(() => new Date());

  if (state.status !== 'ready' || !currentUser) {
    return state.status === 'error' ? state : { status: 'loading' };
  }

  const { data } = state;
  const familiarity = getFamiliarity(data.bookings, currentUser.id);
  const classes = data.classes
    .filter((c) => isSameDay(new Date(c.starts_at), now))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .map((c) => buildClassView(c, data, currentUser.id, familiarity, now));

  return { status: 'ready', value: classes };
}
