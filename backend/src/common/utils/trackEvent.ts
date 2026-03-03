import Event from "../models/Event";

/**
 * Tracks a user event
 * @param userId - the ID of the user performing the action
 * @param eventType - a string describing the event
 * @param metadata - optional metadata
 */
export const trackEvent = async (
  userId: string,
  eventType: string,
  metadata: object = {}
) => {
  if (!userId) return;
  await Event.create({ user: userId, eventType, metadata });
};
