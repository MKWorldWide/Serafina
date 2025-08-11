import { z } from "zod";
import { error as logError, warn as logWarn } from "../utils/logger";

/**
 * Schema for service configuration
 * @property {string} name - Unique identifier for the service (case-insensitive)
 * @property {string} url - Health check endpoint URL
 * @property {string} [owner] - Discord user ID or mention for incident notifications
 * @property {string} [channelId] - Discord channel ID for service-specific notifications
 */
export const ServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  url: z.string().url("Invalid service URL"),
  owner: z.string().optional(),
  channelId: z.string().optional(),
});

export type Service = z.infer<typeof ServiceSchema>;

let cachedServices: Service[] | null = null;
let hasWarned = false;

/**
 * Get all registered services with validation
 * @returns Array of validated service configurations
 */
export function getServices(): Service[] {
  // Return cached services if available
  if (cachedServices) return cachedServices;

  // Parse and validate services from environment
  try {
    const raw = process.env.SERVICES || "[]";
    const parsed = JSON.parse(raw);
    
    const result = z.array(ServiceSchema).safeParse(parsed);
    
    if (!result.success) {
      const errorMessage = `Invalid SERVICES configuration: ${JSON.stringify(result.error.format())}`;
      logError(errorMessage);
      if (!hasWarned) {
        console.warn(`[Serafina] ${errorMessage}`);
        hasWarned = true;
      }
      return [];
    }
    
    cachedServices = result.data;
    
    if (cachedServices.length === 0 && !hasWarned) {
      const warning = "No services configured in SERVICES environment variable";
      logWarn(warning);
      console.warn(`[Serafina] ${warning}`);
      hasWarned = true;
    }
    
    return cachedServices;
  } catch (error) {
    const errorMessage = `Failed to parse SERVICES: ${error instanceof Error ? error.message : String(error)}`;
    logError(errorMessage);
    if (!hasWarned) {
      console.error(`[Serafina] ${errorMessage}`);
      hasWarned = true;
    }
    return [];
  }
}

/**
 * Find a service by name (case-insensitive)
 * @param name - Service name to look up
 * @returns The service configuration or undefined if not found
 */
export function getService(name: string): Service | undefined {
  if (!name) return undefined;
  return getServices().find(s => s.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get service names for autocomplete or validation
 * @returns Array of service names
 */
export function getServiceNames(): string[] {
  return getServices().map(s => s.name);
}

/**
 * Clear the service cache (for testing or environment reloads)
 */
export function clearServiceCache(): void {
  cachedServices = null;
  hasWarned = false;
}

// Log service initialization
getServices();
