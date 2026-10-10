import type { ClassBooking, GymClass } from '@/types';

// The attendee count is never stored. It is always calculated from bookings,
// so the number and the list of people can never disagree.

export function isActiveBooking(booking: ClassBooking): boolean {
  return booking.status === 'booked' || booking.status === 'attended';
}

export function activeBookingsForClass(bookings: ClassBooking[], classId: string): ClassBooking[] {
  return bookings.filter((b) => b.class_id === classId && isActiveBooking(b));
}

export function spotsLeft(gymClass: GymClass, bookings: ClassBooking[]): number {
  return Math.max(0, gymClass.capacity - activeBookingsForClass(bookings, gymClass.id).length);
}

export function hasStarted(gymClass: GymClass, now: Date): boolean {
  return new Date(gymClass.starts_at).getTime() <= now.getTime();
}

export type JoinState = 'open' | 'joined' | 'full' | 'started';

export function getJoinState(gymClass: GymClass, bookings: ClassBooking[], userId: string, now: Date): JoinState {
  const active = activeBookingsForClass(bookings, gymClass.id);
  if (active.some((b) => b.user_id === userId)) return 'joined';
  if (hasStarted(gymClass, now)) return 'started';
  if (active.length >= gymClass.capacity) return 'full';
  return 'open';
}

export type JoinCheck = { ok: true } | { ok: false; reason: string };

export function canJoinClass(gymClass: GymClass, bookings: ClassBooking[], userId: string, now: Date): JoinCheck {
  switch (getJoinState(gymClass, bookings, userId, now)) {
    case 'open':
      return { ok: true };
    case 'joined':
      return { ok: false, reason: 'You are already going to this class.' };
    case 'full':
      return { ok: false, reason: 'This class is full.' };
    case 'started':
      return { ok: false, reason: 'This class has already started.' };
  }
}
