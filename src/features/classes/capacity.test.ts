import { activeBookingsForClass, canJoinClass, getJoinState, spotsLeft } from '@/features/classes/capacity';
import { makeBooking, makeClass } from '@/features/testHelpers';

const BEFORE = new Date('2026-10-09T17:00:00.000Z');
const AFTER = new Date('2026-10-09T18:30:00.000Z');

describe('capacity', () => {
  it('counts booked and attended, not cancelled or no-show', () => {
    const bookings = [
      makeBooking('c1', 'a', 'booked'),
      makeBooking('c1', 'b', 'attended'),
      makeBooking('c1', 'c', 'cancelled'),
      makeBooking('c1', 'd', 'no_show'),
      makeBooking('c2', 'e', 'booked'),
    ];
    expect(activeBookingsForClass(bookings, 'c1').map((b) => b.user_id)).toEqual(['a', 'b']);
    expect(spotsLeft(makeClass('c1', { capacity: 10 }), bookings)).toBe(8);
  });

  it('is open when there is room and the class has not started', () => {
    const gymClass = makeClass('c1', { capacity: 2 });
    expect(getJoinState(gymClass, [makeBooking('c1', 'a')], 'me', BEFORE)).toBe('open');
    expect(canJoinClass(gymClass, [], 'me', BEFORE)).toEqual({ ok: true });
  });

  it('is full at capacity, and a cancellation frees the spot', () => {
    const gymClass = makeClass('c1', { capacity: 2 });
    const full = [makeBooking('c1', 'a'), makeBooking('c1', 'b')];
    expect(getJoinState(gymClass, full, 'me', BEFORE)).toBe('full');
    expect(canJoinClass(gymClass, full, 'me', BEFORE).ok).toBe(false);

    const withCancellation = [makeBooking('c1', 'a'), makeBooking('c1', 'b', 'cancelled')];
    expect(getJoinState(gymClass, withCancellation, 'me', BEFORE)).toBe('open');
  });

  it('reports joined for a member who is already booked, even when full', () => {
    const gymClass = makeClass('c1', { capacity: 1 });
    expect(getJoinState(gymClass, [makeBooking('c1', 'me')], 'me', BEFORE)).toBe('joined');
  });

  it('cannot be joined once it has started', () => {
    expect(getJoinState(makeClass('c1'), [], 'me', AFTER)).toBe('started');
  });
});
