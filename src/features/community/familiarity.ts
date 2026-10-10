import type { ClassBooking } from '@/types';

// Training familiarity: a familiar member is someone the user has attended
// classes with before. This is not friendship. Nobody chose it; it is derived
// from attendance history. An explicit follow/friend relationship can be added
// later next to this without changing it.

/** Member id -> number of classes that member and the user both attended. */
export type Familiarity = Map<string, number>;

export function getFamiliarity(bookings: ClassBooking[], userId: string): Familiarity {
  const attended = bookings.filter((b) => b.status === 'attended');
  const myClassIds = new Set(attended.filter((b) => b.user_id === userId).map((b) => b.class_id));

  const familiarity: Familiarity = new Map();
  for (const booking of attended) {
    if (booking.user_id === userId || !myClassIds.has(booking.class_id)) continue;
    familiarity.set(booking.user_id, (familiarity.get(booking.user_id) ?? 0) + 1);
  }
  return familiarity;
}
