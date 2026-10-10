import { getAttendees, summarizeAttendance } from '@/features/community/attendees';
import { makeBooking, makeMember } from '@/features/testHelpers';

const members = ['me', 'ana', 'male', 'matias', 'zoe'].map((id) => makeMember(id, `${id} Surname`));

describe('getAttendees', () => {
  it('orders the viewer first, then familiar members by shared classes, then by booking time', () => {
    const bookings = [
      makeBooking('c1', 'zoe'),
      makeBooking('c1', 'matias'),
      makeBooking('c1', 'ana'),
      makeBooking('c1', 'male'),
      makeBooking('c1', 'me'),
      makeBooking('c1', 'ghost', 'cancelled'),
    ];
    const familiarity = new Map([
      ['matias', 1],
      ['male', 3],
    ]);
    const attendees = getAttendees('c1', bookings, members, 'me', familiarity);

    expect(attendees.map((a) => a.profile.id)).toEqual(['me', 'male', 'matias', 'zoe', 'ana']);
    expect(attendees.map((a) => a.isFamiliar)).toEqual([false, true, true, false, false]);
    expect(attendees[0].isSelf).toBe(true);
  });
});

describe('summarizeAttendance', () => {
  const attendees = getAttendees(
    'c1',
    [makeBooking('c1', 'male'), makeBooking('c1', 'matias'), makeBooking('c1', 'me')],
    members,
    'me',
    new Map(),
  );
  const [me, male, matias] = attendees;

  it('returns nothing for an empty class', () => {
    expect(summarizeAttendance([], 0)).toBeNull();
  });

  it('names members and counts the rest', () => {
    expect(summarizeAttendance([male, matias], 8)).toBe('male, matias and 6 others are going');
    expect(summarizeAttendance([male, matias], 3)).toBe('male, matias and 1 other are going');
    expect(summarizeAttendance([male], 4)).toBe('male and 3 others are going');
  });

  it('handles classes where everyone is named', () => {
    expect(summarizeAttendance([male], 1)).toBe('male is going');
    expect(summarizeAttendance([male, matias], 2)).toBe('male and matias are going');
  });

  it('says "You" for the viewer', () => {
    expect(summarizeAttendance([me], 1)).toBe('You are going');
    expect(summarizeAttendance([me, male], 9)).toBe('You, male and 7 others are going');
  });

  it('falls back to a count when nobody can be named', () => {
    expect(summarizeAttendance([], 5)).toBe('5 members are going');
  });

  it('uses the past tense once the class has started', () => {
    expect(summarizeAttendance([male, matias], 8, true)).toBe('male, matias and 6 others trained');
    expect(summarizeAttendance([male], 1, true)).toBe('male trained');
    expect(summarizeAttendance([me], 1, true)).toBe('You trained');
    expect(summarizeAttendance([], 5, true)).toBe('5 members trained');
  });
});
