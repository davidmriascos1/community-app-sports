import type { BookingStatus, ClassBooking, GymClass, Profile } from '@/types';

// Small builders so tests only spell out the fields they care about.

export function makeMember(id: string, fullName = id): Profile {
  return { id, full_name: fullName, avatar_url: null, gym_id: 'gym', created_at: '2026-01-01T00:00:00.000Z' };
}

export function makeClass(id: string, overrides: Partial<GymClass> = {}): GymClass {
  return {
    id,
    gym_id: 'gym',
    name: 'HYROX',
    description: '',
    coach_name: 'Coach Laura',
    class_type: 'hyrox',
    starts_at: '2026-10-09T18:00:00.000Z',
    duration_minutes: 60,
    capacity: 10,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

let nextBooking = 0;

/** Bookings are stamped in the order they are created. */
export function makeBooking(classId: string, userId: string, status: BookingStatus = 'booked'): ClassBooking {
  nextBooking += 1;
  return {
    id: `b-${nextBooking}`,
    class_id: classId,
    user_id: userId,
    status,
    booked_at: new Date(Date.UTC(2026, 9, 1, 0, nextBooking)).toISOString(),
  };
}
