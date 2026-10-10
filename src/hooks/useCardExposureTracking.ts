import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import type { ViewToken } from 'react-native';

import type { ClassView } from '@/hooks/useTodaysClasses';
import { track } from '@/lib/analytics';

// Logs `class_card_viewed` for cards that were really on screen.
//
// - A card counts as viewed when at least 60% of it stays visible for half a second.
// - Each class is logged once per visit to Home. Coming back from a class
//   detail is a new visit, because the card may show different people now.
// - The event is built from the same ClassSocialView the card renders.

const viewabilityConfig = { itemVisiblePercentThreshold: 60, minimumViewTime: 500 };

function trackCardViewed(userId: string, view: ClassView) {
  const { social } = view;
  track('class_card_viewed', {
    user_id: userId,
    class_id: view.gymClass.id,
    attendee_count: social.attendeeCount,
    visible_attendee_count: social.cardExposure.visibleAttendeeIds.length,
    visible_attendee_ids: social.cardExposure.visibleAttendeeIds,
    familiar_attendee_count: social.familiarAttendeeCount,
    visible_familiar_attendee_count: social.cardExposure.visibleFamiliarAttendeeIds.length,
    visible_familiar_attendee_ids: social.cardExposure.visibleFamiliarAttendeeIds,
    social_summary_visible: social.summary !== null,
    user_is_attending: social.isViewerAttending,
  });
}

export function useCardExposureTracking(userId: string | undefined, classes: ClassView[]) {
  // Refs hold values that change without needing a re-render. The list requires
  // its viewability callback to stay the same function for its whole life, so
  // the callback reads the latest data from here instead of from props.
  const latest = useRef({ userId, classes });
  const onScreenIds = useRef(new Set<string>());
  const loggedIds = useRef(new Set<string>());

  useEffect(() => {
    latest.current = { userId, classes };
  });

  const logNewExposures = useCallback(() => {
    const { userId: currentUserId, classes: currentClasses } = latest.current;
    if (!currentUserId) return;
    for (const view of currentClasses) {
      const id = view.gymClass.id;
      if (onScreenIds.current.has(id) && !loggedIds.current.has(id)) {
        loggedIds.current.add(id);
        trackCardViewed(currentUserId, view);
      }
    }
  }, []);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<ClassView>[] }) => {
      onScreenIds.current = new Set(viewableItems.map((token) => token.item.gymClass.id));
      logNewExposures();
    },
    [logNewExposures],
  );

  useFocusEffect(
    useCallback(() => {
      loggedIds.current = new Set();
      logNewExposures();
    }, [logNewExposures]),
  );

  return { onViewableItemsChanged, viewabilityConfig };
}
