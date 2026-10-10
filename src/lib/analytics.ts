// Behavioural traces, console only for now. No storage, no experiments.
//
// Hypothesis we want to be able to analyse later: making other members'
// training intentions visible may increase the probability that a member
// commits to training, especially when the visible attendees are people they
// have trained with before.
//
// Principle: events describe what the member could actually see on screen,
// not merely what existed in the database.
//
// Eventual funnel (attendance is not measured yet):
//   social exposure -> class booking -> actual attendance -> repeat attendance

export interface AnalyticsEvents {
  /** A class card was on screen on Home. */
  class_card_viewed: {
    user_id: string;
    class_id: string;
    /** Everyone booked, as shown in "8 / 10". Includes the user if they joined. */
    attendee_count: number;
    /** Other members individually identifiable on the card (avatar or name). */
    visible_attendee_count: number;
    visible_attendee_ids: string[];
    /** Members the user has trained with who are booked, shown or not. */
    familiar_attendee_count: number;
    /** The subset of those that was identifiable on the card. Never includes members behind "+N". */
    visible_familiar_attendee_count: number;
    visible_familiar_attendee_ids: string[];
    social_summary_visible: boolean;
    user_is_attending: boolean;
  };
  /** The class detail screen opened and showed the full attendee list. */
  attendee_list_opened: {
    user_id: string;
    class_id: string;
    attendee_count: number;
    familiar_attendee_count: number;
    visible_attendee_ids: string[];
    visible_familiar_attendee_ids: string[];
  };
  class_joined: {
    user_id: string;
    class_id: string;
    attendee_count_before_join: number;
    familiar_attendee_count_at_join: number;
  };
}

export function track<E extends keyof AnalyticsEvents>(event: E, properties: AnalyticsEvents[E]): void {
  console.log('[analytics]', event, { ...properties, timestamp: new Date().toISOString() });
}
