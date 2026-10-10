import { getFamiliarity } from '@/features/community/familiarity';
import { makeBooking } from '@/features/testHelpers';

describe('getFamiliarity', () => {
  it('counts classes both members attended', () => {
    const bookings = [
      makeBooking('c1', 'me', 'attended'),
      makeBooking('c1', 'male', 'attended'),
      makeBooking('c1', 'matias', 'attended'),
      makeBooking('c2', 'me', 'attended'),
      makeBooking('c2', 'male', 'attended'),
    ];
    const familiarity = getFamiliarity(bookings, 'me');
    expect(familiarity.get('male')).toBe(2);
    expect(familiarity.get('matias')).toBe(1);
    expect(familiarity.has('me')).toBe(false);
  });

  it('ignores bookings where either member did not actually attend', () => {
    const bookings = [
      makeBooking('c1', 'me', 'attended'),
      makeBooking('c1', 'noshow', 'no_show'),
      makeBooking('c1', 'cancelled', 'cancelled'),
      // A future class both are booked into is an intention, not shared history.
      makeBooking('c2', 'me', 'booked'),
      makeBooking('c2', 'booked', 'booked'),
      // A class I missed.
      makeBooking('c3', 'me', 'no_show'),
      makeBooking('c3', 'stranger', 'attended'),
    ];
    expect(getFamiliarity(bookings, 'me').size).toBe(0);
  });
});
