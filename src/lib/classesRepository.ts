import { canJoinClass } from '@/features/classes/capacity';
import * as mock from '@/lib/mockData';
import type { ClassBooking, Gym, GymClass, Profile } from '@/types';

// The only place the app reads or writes data. Everything is async, exactly as
// it will be with Supabase, so replacing the mock means rewriting this file only.

export interface GymData {
  gym: Gym;
  members: Profile[];
  classes: GymClass[];
  bookings: ClassBooking[];
}

// In-memory "database". It lives as long as the app is open and resets on reload.
const bookings: ClassBooking[] = [...mock.bookings];

function simulateNetwork(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 150));
}

export async function listMembers(): Promise<Profile[]> {
  await simulateNetwork();
  return mock.profiles;
}

export async function fetchGymData(gymId: string): Promise<GymData> {
  await simulateNetwork();
  const gym = mock.gyms.find((g) => g.id === gymId);
  if (!gym) throw new Error('Gym not found.');

  const classes = mock.classes.filter((c) => c.gym_id === gymId);
  const classIds = new Set(classes.map((c) => c.id));

  return {
    gym,
    members: mock.profiles.filter((p) => p.gym_id === gymId),
    classes,
    bookings: bookings.filter((b) => classIds.has(b.class_id)),
  };
}

// With Supabase this check-then-insert must become one atomic database operation
// (unique class_id + user_id, capacity checked in the database). Otherwise two
// members can take the last spot at the same time.
export async function joinClass(classId: string, userId: string): Promise<ClassBooking> {
  await simulateNetwork();
  const gymClass = mock.classes.find((c) => c.id === classId);
  if (!gymClass) throw new Error('Class not found.');

  const check = canJoinClass(gymClass, bookings, userId, new Date());
  if (!check.ok) throw new Error(check.reason);

  const booking: ClassBooking = {
    id: `b-new-${bookings.length + 1}`,
    class_id: classId,
    user_id: userId,
    status: 'booked',
    booked_at: new Date().toISOString(),
  };
  bookings.push(booking);
  return booking;
}
