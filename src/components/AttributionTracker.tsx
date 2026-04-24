import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { captureLeadAttribution } from "@/lib/leadAttribution";

/**
 * Registers lead attribution super-properties on mount so every event
 * emitted by the SPA carries `lead_ref` and the `lead_utm_*` tail.
 * Mount once inside the PostHog provider; renders nothing.
 */
const AttributionTracker = () => {
  const posthog = usePostHog();
  useEffect(() => {
    if (!posthog) return;
    captureLeadAttribution(posthog);
  }, [posthog]);
  return null;
};

export default AttributionTracker;
