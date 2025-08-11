import { Client, ActivityType } from "discord.js";
import { pingAll } from "../services/heartbeat";

/**
 * Start a background job to update the bot's presence with service status
 * @param client The Discord client instance
 */
export function startHeartbeatPresence(client: Client) {
  console.log("[Heartbeat] Starting presence updater");
  
  const updatePresence = async () => {
    try {
      const { results } = await pingAll();
      const total = results.length;
      const up = results.filter(r => r.ok).length;
      const worstLatency = results.reduce((max, r) => Math.max(max, r.ms), 0);
      
      // Determine status color based on service health
      const status = up === total ? "online" : up > 0 ? "idle" : "dnd";
      
      // Create a status message
      const statusText = `UP ${up}/${total} • ${worstLatency}ms`;
      
      // Update the bot's presence
      client.user?.setPresence({
        status,
        activities: [{
          name: statusText,
          type: ActivityType.Watching
        }]
      });
      
      console.log(`[Heartbeat] Presence updated: ${statusText}`);
    } catch (error) {
      console.error("[Heartbeat] Error updating presence:", error);
      
      // Set error status if we can't update
      client.user?.setPresence({
        status: "dnd",
        activities: [{
          name: "Error checking services",
          type: ActivityType.Playing
        }]
      });
    }
  };
  
  // Run immediately and then every 60 seconds
  updatePresence();
  const interval = setInterval(updatePresence, 60000);
  
  // Cleanup function to stop the interval when the bot shuts down
  const cleanup = () => {
    clearInterval(interval);
    console.log("[Heartbeat] Stopped presence updater");
  };
  
  // Handle process termination
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  
  return cleanup;
}

export default {
  startHeartbeatPresence
};
