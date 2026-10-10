import type { BookingStatus, ClassBooking, Gym, GymClass, Profile } from '@/types';

// Mock data for the first prototype. Only classesRepository.ts imports this file.
//
// Class times are generated relative to "now" so there are always classes today.
// Very late at night the upcoming classes are clamped to 11:30 PM and will show
// as started; that is a limitation of the mock, not of the app.

const HOUR = 60 * 60 * 1000;
const now = new Date();

function todayAt(offsetHours: number): string {
  const date = new Date(now.getTime() + offsetHours * HOUR);
  date.setMinutes(date.getMinutes() < 30 ? 0 : 30, 0, 0);

  const earliest = new Date(now);
  earliest.setHours(0, 0, 0, 0);
  const latest = new Date(now);
  latest.setHours(23, 30, 0, 0);

  const clamped = Math.min(Math.max(date.getTime(), earliest.getTime()), latest.getTime());
  return new Date(clamped).toISOString();
}

function daysAgoAt(days: number, hour: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

const CREATED_AT = daysAgoAt(90, 9);
const GYM_ID = 'gym-forja';

export const gyms: Gym[] = [{ id: GYM_ID, name: 'Forja Training Club', created_at: CREATED_AT }];

function member(id: string, full_name: string): Profile {
  return { id, full_name, avatar_url: null, gym_id: GYM_ID, created_at: CREATED_AT };
}

export const profiles: Profile[] = [
  member('u-david', 'David Riascos'),
  member('u-male', 'Male Gómez'),
  member('u-matias', 'Matias Herrera'),
  member('u-juanca', 'Juanca Pérez'),
  member('u-sofia', 'Sofía Vargas'),
  member('u-daniel', 'Daniel Castro'),
  member('u-camila', 'Camila Torres'),
  member('u-andres', 'Andrés Molina'),
  member('u-valentina', 'Valentina Ruiz'),
  member('u-felipe', 'Felipe Ortiz'),
  member('u-isabela', 'Isabela Mejía'),
  member('u-tomas', 'Tomás Londoño'),
  member('u-paula', 'Paula Arango'),
];

function gymClass(
  id: string,
  name: string,
  class_type: string,
  coach_name: string,
  starts_at: string,
  capacity: number,
  description: string,
): GymClass {
  return {
    id,
    gym_id: GYM_ID,
    name,
    description,
    coach_name,
    class_type,
    starts_at,
    duration_minutes: 60,
    capacity,
    created_at: CREATED_AT,
  };
}

export const classes: GymClass[] = [
  // Today
  gymClass(
    'c-today-crossfit-early',
    'CrossFit',
    'crossfit',
    'Coach Camilo',
    todayAt(-3),
    12,
    'Barbell complex followed by a 15-minute AMRAP.',
  ),
  gymClass(
    'c-today-hyrox',
    'HYROX',
    'hyrox',
    'Coach Laura',
    todayAt(1),
    10,
    'Race simulation: 4 rounds of 1 km run plus sled push, burpee broad jumps and wall balls.',
  ),
  gymClass(
    'c-today-strength',
    'Strength',
    'strength',
    'Coach Camilo',
    todayAt(2),
    8,
    'Back squat 5x5 and accessory work. Small group, coached lifts.',
  ),
  gymClass(
    'c-today-mobility',
    'Mobility & Recovery',
    'mobility',
    'Coach Ana',
    todayAt(3),
    12,
    'Hips, shoulders and breathing. A good session for the day after a hard workout.',
  ),
  gymClass(
    'c-today-crossfit-late',
    'CrossFit',
    'crossfit',
    'Coach Laura',
    todayAt(4),
    14,
    'Partner workout: row, kettlebell swings and box jumps.',
  ),
  // Earlier this week. These exist to give members a training history together.
  gymClass('c-past-hyrox', 'HYROX', 'hyrox', 'Coach Laura', daysAgoAt(1, 18), 10, 'Sled and run intervals.'),
  gymClass('c-past-crossfit', 'CrossFit', 'crossfit', 'Coach Camilo', daysAgoAt(3, 18), 12, 'Team WOD.'),
  gymClass('c-past-strength', 'Strength', 'strength', 'Coach Camilo', daysAgoAt(5, 7), 8, 'Deadlift day.'),
];

let bookingNumber = 0;

// Each booking is stamped one minute after the previous one, so the order
// written below is also the order in which members booked.
function bookAll(classId: string, status: BookingStatus, userIds: string[]): ClassBooking[] {
  return userIds.map((userId) => {
    bookingNumber += 1;
    return {
      id: `b-${bookingNumber}`,
      class_id: classId,
      user_id: userId,
      status,
      booked_at: new Date(now.getTime() - 48 * HOUR + bookingNumber * 60 * 1000).toISOString(),
    };
  });
}

export const bookings: ClassBooking[] = [
  // History: David has trained with Male (3x), Matias (2x), Juanca, Sofía and Daniel (1x each).
  ...bookAll('c-past-hyrox', 'attended', ['u-david', 'u-male', 'u-matias', 'u-juanca']),
  ...bookAll('c-past-crossfit', 'attended', ['u-david', 'u-male', 'u-sofia', 'u-daniel']),
  ...bookAll('c-past-crossfit', 'no_show', ['u-valentina']),
  ...bookAll('c-past-strength', 'attended', ['u-david', 'u-matias', 'u-male']),
  ...bookAll('c-past-strength', 'cancelled', ['u-felipe']),

  // Today, already finished.
  ...bookAll('c-today-crossfit-early', 'attended', ['u-paula', 'u-tomas', 'u-isabela', 'u-felipe', 'u-andres']),

  // Today, 8 / 10. Three members David has trained with.
  ...bookAll('c-today-hyrox', 'booked', [
    'u-camila',
    'u-andres',
    'u-male',
    'u-valentina',
    'u-matias',
    'u-felipe',
    'u-juanca',
    'u-isabela',
  ]),

  // Today, full.
  ...bookAll('c-today-strength', 'booked', [
    'u-sofia',
    'u-daniel',
    'u-tomas',
    'u-paula',
    'u-camila',
    'u-andres',
    'u-felipe',
    'u-valentina',
  ]),

  // c-today-mobility has no bookings yet.

  // Today, 6 / 14. Four members David has trained with, so one of them
  // ends up hidden behind the "+N" on the card.
  ...bookAll('c-today-crossfit-late', 'booked', ['u-tomas', 'u-male', 'u-paula', 'u-juanca', 'u-sofia', 'u-daniel']),
];
