import { buildClassSocialView } from '@/features/community/socialView';
import { makeBooking, makeMember } from '@/features/testHelpers';

const ids = ['me', 'male', 'matias', 'juanca', 'sofia', 'o1', 'o2', 'o3', 'o4', 'o5'];
const members = ids.map((id) => makeMember(id, id));
const book = (...userIds: string[]) => userIds.map((id) => makeBooking('c1', id));

describe('buildClassSocialView', () => {
  it('shows familiar members first and reports only what the card shows', () => {
    const bookings = book('o1', 'o2', 'male', 'o3', 'matias', 'o4', 'o5', 'sofia');
    const familiarity = new Map([
      ['male', 3],
      ['matias', 2],
      ['sofia', 1],
    ]);
    const view = buildClassSocialView('c1', bookings, members, 'me', familiarity);

    expect(view.attendeeCount).toBe(8);
    expect(view.shownAvatars.map((a) => a.profile.id)).toEqual(['male', 'matias', 'sofia']);
    expect(view.overflowCount).toBe(5);
    expect(view.summary).toBe('male, matias and 6 others are going');
    expect(view.familiarAttendeeCount).toBe(3);
    expect(view.cardExposure).toEqual({
      visibleAttendeeIds: ['male', 'matias', 'sofia'],
      visibleFamiliarAttendeeIds: ['male', 'matias', 'sofia'],
    });
  });

  it('does not count a familiar member hidden behind "+N" as visible on the card', () => {
    const bookings = book('o1', 'male', 'juanca', 'sofia', 'matias');
    const familiarity = new Map([
      ['male', 3],
      ['matias', 2],
      ['juanca', 1],
      ['sofia', 1],
    ]);
    const view = buildClassSocialView('c1', bookings, members, 'me', familiarity);

    expect(view.familiarAttendeeCount).toBe(4);
    expect(view.cardExposure.visibleFamiliarAttendeeIds).toEqual(['male', 'matias', 'juanca']);
    expect(view.cardExposure.visibleAttendeeIds).not.toContain('sofia');
    // Opening the full list is what makes the hidden members visible.
    expect(view.listExposure.visibleFamiliarAttendeeIds).toEqual(['male', 'matias', 'juanca', 'sofia']);
    expect(view.listExposure.visibleAttendeeIds).toEqual(['male', 'matias', 'juanca', 'sofia', 'o1']);
  });

  it('puts the viewer first after joining and never lists them as exposure', () => {
    const bookings = book('o1', 'male', 'matias', 'me');
    const view = buildClassSocialView('c1', bookings, members, 'me', new Map([['male', 1]]));

    expect(view.isViewerAttending).toBe(true);
    expect(view.attendeeCount).toBe(4);
    expect(view.shownAvatars.map((a) => a.profile.id)).toEqual(['me', 'male', 'o1']);
    expect(view.summary).toBe('You, male and 2 others are going');
    // The viewer's own avatar takes one of the three slots, so only two others are identifiable.
    expect(view.cardExposure.visibleAttendeeIds).toEqual(['male', 'o1']);
    expect(view.cardExposure.visibleFamiliarAttendeeIds).toEqual(['male']);
    expect(view.familiarAttendeeCount).toBe(1);
  });

  it('has nothing to show for an empty class', () => {
    const view = buildClassSocialView('c1', [], members, 'me', new Map());

    expect(view.attendeeCount).toBe(0);
    expect(view.summary).toBeNull();
    expect(view.shownAvatars).toEqual([]);
    expect(view.overflowCount).toBe(0);
    expect(view.cardExposure).toEqual({ visibleAttendeeIds: [], visibleFamiliarAttendeeIds: [] });
  });
});
