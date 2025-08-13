/**
 * 🎮 Serafina Discord Bot - Authentication Routes
 * 
 * Express routes for handling Discord OAuth 2.0 authentication flows
 * 
 * @author NovaSanctum
 * @version 1.0.0
 * @since 2025-08-12
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getAuthUrl, exchangeCodeForToken, fetchUser, getBotInviteUrl } from '../services/discord-oauth';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Start the Discord OAuth flow by redirecting to Discord's authorization page
 */
router.get('/auth/discord', (req: Request, res: Response) => {
  const state = req.query.state as string | undefined;
  const prompt = req.query.prompt as 'none' | 'consent' | undefined;
  
  const authUrl = getAuthUrl({
    prompt,
    state,
    // Add any additional scopes if needed
    // scope: ['identify', 'guilds', 'email']
  });
  
  logger.debug('Initiating Discord OAuth flow', { redirectUrl: authUrl });
  res.redirect(authUrl);
});

/**
 * Handle the OAuth callback from Discord
 */
router.get('/oauth/callback', async (req: Request, res: Response, next: NextFunction) => {
  const { code, state, error: errorCode, error_description: errorDescription } = req.query;
  
  // Handle OAuth errors
  if (errorCode) {
    logger.warn('OAuth error from Discord', { 
      error: errorCode, 
      description: errorDescription,
      state
    });
    
    return res.status(400).json({
      error: 'oauth_error',
      message: errorDescription || 'Authentication failed',
      code: errorCode
    });
  }
  
  // Ensure we have an authorization code
  if (typeof code !== 'string') {
    logger.warn('OAuth callback called without a code', { query: req.query });
    return res.status(400).json({
      error: 'missing_code',
      message: 'No authorization code provided'
    });
  }
  
  try {
    // Exchange the authorization code for an access token
    const tokens = await exchangeCodeForToken(code);
    
    // Fetch the user's profile
    const user = await fetchUser(tokens.access_token);
    
    logger.info('User authenticated successfully', { 
      userId: user.id, 
      username: user.username,
      hasEmail: !!user.email
    });
    
    // In a real app, you would typically:
    // 1. Create or update the user in your database
    // 2. Create a session or JWT for the user
    // 3. Set a secure HTTP-only cookie with the session/token
    // 4. Redirect to your application's frontend
    
    // For now, just return the user data and tokens (for development only!)
    res.json({
      user,
      tokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresIn: tokens.expires_in,
        tokenType: tokens.token_type,
        scope: tokens.scope
      },
      state: state || null
    });
    
  } catch (error) {
    logger.error('Error during OAuth callback', { error });
    next(error);
  }
});

/**
 * Generate a bot invite URL with the specified permissions
 */
router.get('/auth/discord/invite', (req: Request, res: Response) => {
  const permissions = req.query.permissions as string | undefined;
  const guildId = req.query.guild_id as string | undefined;
  const disableGuildSelect = req.query.disable_guild_select === 'true';
  
  let inviteUrl = getBotInviteUrl(permissions);
  
  // Add guild ID if provided (for server-specific invites)
  if (guildId) {
    inviteUrl += `&guild_id=${guildId}`;
    if (disableGuildSelect) {
      inviteUrl += '&disable_guild_select=true';
    }
  }
  
  logger.debug('Generated bot invite URL', { inviteUrl });
  
  // Redirect to the invite URL
  res.redirect(inviteUrl);
});

/**
 * Get the current user's profile (requires authentication)
 */
router.get('/auth/me', async (req: Request, res: Response, next: NextFunction) => {
  // In a real app, you would get this from the session or JWT
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'No access token provided'
    });
  }
  
  const accessToken = authHeader.split(' ')[1];
  
  try {
    const user = await fetchUser(accessToken);
    res.json({ user });
  } catch (error) {
    logger.error('Error fetching user profile', { error });
    res.status(401).json({
      error: 'invalid_token',
      message: 'Invalid or expired access token'
    });
  }
});

export default router;
