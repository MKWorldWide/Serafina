import pLimit from "p-limit";
import { getJson } from "../utils/http";

export type HeartbeatTarget = { 
  name: string; 
  url: string 
};

/**
 * Parse service targets from environment variable
 */
const parseTargets = (): HeartbeatTarget[] => {
  try { 
    return JSON.parse(process.env.SERVICES || "[]"); 
  } catch (e) { 
    console.error("Failed to parse SERVICES env var:", e);
    return []; 
  }
};

/**
 * Ping all configured services with concurrency control
 * @returns Object containing results, total time, and timestamp
 */
export async function pingAll() {
  const targets = parseTargets();
  const concurrency = Number(process.env.HEARTBEAT_CONCURRENCY || "3");
  const timeout = Number(process.env.HEARTBEAT_TIMEOUT_MS || "4000");
  
  console.log(`[Heartbeat] Checking ${targets.length} services with ${concurrency} concurrency`);
  
  const limit = pLimit(concurrency);
  const startedAt = Date.now();
  
  const results = await Promise.all(
    targets.map(target => 
      limit(async () => {
        const startTime = Date.now();
        try {
          const result = await getJson(target.url, timeout);
          const responseTime = Date.now() - startTime;
          return {
            ...target,
            ...result,
            ms: responseTime,
            timestamp: new Date().toISOString()
          };
        } catch (error: any) {
          return {
            ...target,
            ok: false,
            status: 0,
            json: { 
              error: error?.name || 'Error',
              message: error?.message || 'Unknown error during fetch'
            },
            ms: Date.now() - startTime,
            timestamp: new Date().toISOString()
          };
        }
      })
    )
  );

  const msTotal = Date.now() - startedAt;
  return { 
    results, 
    msTotal, 
    at: new Date().toISOString() 
  };
}

export default {
  pingAll
};
