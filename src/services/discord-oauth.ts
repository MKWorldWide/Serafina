/**
 * 🎮 Serafina Discord Bot - Discord OAuth Service
 * 
 * Handles Discord OAuth 2.0 authentication flows including:
 * - Generating authorization URLs
 * - Exchanging authorization codes for tokens
 * - Fetching user information
 * - Generating bot invite URLs
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2025-08-12
 */

import { env } from '../config/env';
import { logger } from '../utils/logger';

const DISCORD_API = 'https://discord.com/api/v10';

/**
 * Generate the Discord OAuth2 authorization URL
 * @param options Optional parameters for the authorization request
 * @returns The full authorization URL
 */
export function getAuthUrl(options: {
  prompt?: 'none' | 'consent';
  state?: string;
  scope?: string[];
} = {}) {
  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: (options.scope || ['identify', 'guilds']).join(' '),
  });

  if (options.prompt) params.set('prompt', options.prompt);
  if (options.state) params.set('state', options.state);

  return `${DISCORD_API}/oauth2/authorize?${params.toString()}`;
}

/**
 * Generate a bot invite URL with the specified permissions
 * @param permissions Permission bitfield as a string (e.g., '274877975552')
 * @returns The bot invite URL
 */
export function getBotInviteUrl(permissions: string = '274877975552') {
  const params = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    permissions,
    scope: 'bot applications.commands',
  });

  return `${DISCORD_API}/oauth2/authorize?${params.toString()}`;
}

/**
 * Exchange an authorization code for an access token
 * @param code The authorization code from Discord
 * @returns Token response from Discord
 */
export async function exchangeCodeForToken(code: string) {
  const body = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
  });

  try {
    const response = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error('Failed to exchange code for token', { 
        status: response.status, 
        statusText: response.statusText,
        response: text 
      });
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
    };
  } catch (error) {
    logger.error('Error exchanging code for token', { error });
    throw error;
  }
}

/**
 * Fetch the current user's Discord profile
 * @param accessToken The OAuth access token
 * @returns The user's Discord profile
 */
export async function fetchUser(accessToken: string) {
  try {
    const response = await fetch(`${DISCORD_API}/users/@me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error('Failed to fetch user profile', { 
        status: response.status, 
        statusText: response.statusText,
        response: text 
      });
      throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
    }

    return await response.json() as {
      id: string;
      username: string;
      discriminator: string;
      avatar?: string;
      email?: string;
      verified?: boolean;
    };
  } catch (error) {
    logger.error('Error fetching user profile', { error });
    throw error;
  }
}

/**
 * Get the redirect URI for OAuth callbacks
 * @returns The appropriate redirect URI based on environment
 */
function getRedirectUri() {
  const baseUrl = env.NODE_ENV === 'production' && env.BASE_URL 
    ? env.BASE_URL 
    : `http://localhost:${env.PORT || 3000}`;
    
  return `${baseUrl.replace(/\/+$/, '')}/oauth/callback`;
}

/**
 * Refresh an expired access token
 * @param refreshToken The refresh token from a previous token exchange
 * @returns New token response from Discord
 */
export async function refreshToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  try {
    const response = await fetch(`${DISCORD_API}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      logger.error('Failed to refresh token', { 
        status: response.status, 
        statusText: response.statusText,
        response: text 
      });
      throw new Error(`Token refresh failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as {
      access_token: string;
      token_type: string;
      expires_in: number;
      refresh_token: string;
      scope: string;
    };
  } catch (error) {
    logger.error('Error refreshing token', { error });
    throw error;
  }
}
