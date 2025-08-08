/**
 * Utility functions for sanitizing and validating Discord input.
 *
 * Currently exposes `sanitizeDiscordInput` which strips Discord mention
 * patterns to avoid accidental pings or injections when relaying user
 * generated content. Additional validation helpers can be added here as the
 * system evolves.
 */

/**
 * Strips common Discord mention syntaxes (user, role, channel) and mass mention
 * keywords. This prevents logs or bot echoes from triggering unwanted pings.
 *
 * @param input raw string received from Discord
 * @returns sanitized string safe for logging or echoing
 */
export function sanitizeDiscordInput(input: string): string {
  if (!input) return '';

  return (
    input
      // Remove user, role, and channel mentions like <@123>, <@!123>, <@&456>, <#789>
      .replace(/<[@#][!&]?\d+>/g, '')
      // Neutralize mass mentions
      .replace(/@everyone/g, 'everyone')
      .replace(/@here/g, 'here')
      .trim()
  );
}

export default {
  sanitizeDiscordInput,
};
