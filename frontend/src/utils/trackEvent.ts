import api from "../lib/axios";

export const trackEvent = async (
  eventType: string,
  metadata?: object,
) => {
  try {
    const token = localStorage.getItem("token");

    await api.post(
      "/events",
      { eventType, metadata },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Event tracking failed", error);
  }
};
