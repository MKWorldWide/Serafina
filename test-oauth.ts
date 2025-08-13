/**
 * 🎮 Serafina Bot - OAuth Test Script
 * 
 * A simple script to test the Discord OAuth flow locally.
 * 
 * Usage:
 *   1. Start the server: `pnpm dev`
 *   2. Run this script: `npx tsx test-oauth.ts`
 *   3. Open the printed URL in your browser to test the OAuth flow
 * 
 * @author NovaSanctum
 * @version 1.0.0
 */

import { getAuthUrl, getBotInviteUrl } from './src/services/discord-oauth';
import { logger } from './src/utils/logger';

// Test OAuth URL generation
function testAuthUrl() {
  try {
    // Test with default scopes
    const authUrl = getAuthUrl();
    logger.info('OAuth URL (default scopes):', { url: authUrl });
    
    // Test with custom state
    const authUrlWithState = getAuthUrl({ state: 'test-state' });
    logger.info('OAuth URL (with state):', { url: authUrlWithState });
    
    // Test with custom scopes
    const authUrlWithScopes = getAuthUrl({ 
      scope: ['identify', 'guilds', 'email'] 
    });
    logger.info('OAuth URL (with custom scopes):', { url: authUrlWithScopes });
    
    return authUrl;
  } catch (error) {
    logger.error('Failed to generate OAuth URL', { error });
    throw error;
  }
}

// Test bot invite URL generation
function testBotInviteUrl() {
  try {
    // Test with default permissions
    const inviteUrl = getBotInviteUrl();
    logger.info('Bot invite URL (default permissions):', { url: inviteUrl });
    
    // Test with custom permissions
    const customInviteUrl = getBotInviteUrl('8'); // 8 = Administrator (for testing only!)
    logger.info('Bot invite URL (custom permissions):', { url: customInviteUrl });
    
    return inviteUrl;
  } catch (error) {
    logger.error('Failed to generate bot invite URL', { error });
    throw error;
  }
}

// Main function
async function main() {
  logger.info('Starting OAuth test...');
  
  try {
    // Test OAuth URL generation
    const authUrl = testAuthUrl();
    
    // Test bot invite URL generation
    const inviteUrl = testBotInviteUrl();
    
    logger.info('\n🎉 OAuth test completed successfully!\n');
    logger.info('🔗 OAuth URL:', { url: authUrl });
    logger.info('🤖 Bot Invite URL:', { url: inviteUrl });
    logger.info('\nNext steps:');
    logger.info('1. Start the server with `pnpm dev` if not already running');
    logger.info('2. Open the OAuth URL in your browser to test the flow');
    logger.info('3. After authorizing, you should be redirected to the callback URL');
    logger.info('4. Check the server logs for the OAuth response');
    
  } catch (error) {
    logger.error('OAuth test failed:', { error });
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  logger.error('Unhandled error in test script:', { error });
  process.exit(1);
});
