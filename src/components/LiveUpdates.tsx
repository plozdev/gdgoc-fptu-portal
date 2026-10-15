import React from "react";
import { PollingUpdates } from "./PollingUpdates";

/**
 * Headless data sync component.
 * Replaces legacy SSE with robust ~30s revision polling (/api/sync/status)
 * as specified in POLLING_PLAN.md.
 */
export const LiveUpdates: React.FC = () => {
  return <PollingUpdates />;
};
