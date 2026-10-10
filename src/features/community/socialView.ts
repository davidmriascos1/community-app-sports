import { activeBookingsForClass } from '@/features/classes/capacity';
import { getAttendees, summarizeAttendance, type Attendee } from '@/features/community/attendees';
import type { Familiarity } from '@/features/community/familiarity';
import type { ClassBooking, Profile } from '@/types';

// What the member can actually see about who is going to a class.
//
// The class card renders this object and analytics logs from this same object.
// That is how we keep the principle "measure what the user actually saw, not
// merely what existed in the database": there is no second calculation that
// could drift away from the screen.

export const CARD_AVATAR_LIMIT = 3;
export const CARD_SUMMARY_NAME_LIMIT = 2;

/** Members the viewer could individually identify, never including the viewer. */
export interface SocialExposure {
  visibleAttendeeIds: string[];
  visibleFamiliarAttendeeIds: string[];
}

export interface ClassSocialView {
  /** Everyone the viewer may see, in display order. The full list on the detail screen. */
  attendees: Attendee[];
  /** All active bookings: the "8" in "8 / 10". Includes the viewer if they joined. */
  attendeeCount: number;
  /** Attendees the viewer has trained with before, whether shown on the card or not. */
  familiarAttendeeCount: number;
  isViewerAttending: boolean;

  // Card presentation
  shownAvatars: Attendee[];
  /** The "+5" after the avatars: attendees with no avatar on the card. */
  overflowCount: number;
  summary: string | null;

  /** Identifiable on the card: has an avatar or is named in the summary. */
  cardExposure: SocialExposure;
  /** Identifiable on the detail screen, where the whole list is shown. */
  listExposure: SocialExposure;
}

function toExposure(shown: Attendee[]): SocialExposure {
  const others = shown.filter((a) => !a.isSelf);
  return {
    visibleAttendeeIds: others.map((a) => a.profile.id),
    visibleFamiliarAttendeeIds: others.filter((a) => a.isFamiliar).map((a) => a.profile.id),
  };
}

export function buildClassSocialView(
  classId: string,
  bookings: ClassBooking[],
  members: Profile[],
  viewerId: string,
  familiarity: Familiarity,
  hasStarted = false,
): ClassSocialView {
  const activeBookings = activeBookingsForClass(bookings, classId);
  const attendees = getAttendees(classId, bookings, members, viewerId, familiarity);
  const attendeeCount = activeBookings.length;

  const shownAvatars = attendees.slice(0, CARD_AVATAR_LIMIT);
  const named = attendees.slice(0, CARD_SUMMARY_NAME_LIMIT);
  // Names are taken from the front of the same ordered list as the avatars, so
  // "on the card" is whichever of the two slices is longer.
  const onCard = attendees.slice(0, Math.max(CARD_AVATAR_LIMIT, CARD_SUMMARY_NAME_LIMIT));

  return {
    attendees,
    attendeeCount,
    familiarAttendeeCount: activeBookings.filter((b) => b.user_id !== viewerId && familiarity.has(b.user_id)).length,
    isViewerAttending: activeBookings.some((b) => b.user_id === viewerId),
    shownAvatars,
    overflowCount: attendeeCount - shownAvatars.length,
    summary: summarizeAttendance(named, attendeeCount, hasStarted),
    cardExposure: toExposure(onCard),
    listExposure: toExposure(attendees),
  };
}
