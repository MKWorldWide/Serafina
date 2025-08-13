import { Router } from 'express';
import { config } from '../config';
import { db } from '../store/db';

const router = Router();

/**
 * OAuth callback endpoint
 * GET /oauth/callback
 * 
 * Handles OAuth callbacks from Discord. This is a basic implementation
 * that logs the authorization code and state to the database.
 */
router.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Log the OAuth callback for debugging
  console.log('OAuth callback received:', { code, state });
  
  try {
    // Store the OAuth data in the database
    if (code) {
      await db.run(
        'INSERT INTO audit (ts, action, payload) VALUES (?, ?, ?)',
        [Date.now(), 'oauth_callback', JSON.stringify({ code, state, ip: req.ip, ua: req.get('user-agent') })]
      );
    }
    
    // Render a simple success page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Callback</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              max-width: 600px; 
              margin: 2rem auto; 
              padding: 0 1rem;
              color: #333;
            }
            .success { 
              background: #e8f5e9; 
              border-left: 4px solid #4caf50; 
              padding: 1rem; 
              margin: 1rem 0; 
              border-radius: 0 4px 4px 0;
            }
            code { 
              background: #f5f5f5; 
              padding: 0.2rem 0.4rem; 
              border-radius: 3px; 
              font-family: monospace; 
            }
          </style>
        </head>
        <body>
          <h1>OAuth Callback Received</h1>
          
          <div class="success">
            <h3>✅ Authorization Successful</h3>
            <p>You can close this window and return to Discord.</p>
          </div>
          
          <details>
            <summary>Debug Information</summary>
            <p>Code: <code>${code || 'none'}</code></p>
            <p>State: <code>${state || 'none'}</code></p>
            <p>User Agent: <code>${req.get('user-agent') || 'unknown'}</code></p>
            <p>IP: <code>${req.ip || 'unknown'}</code></p>
          </details>
          
          <script>
            // Notify the parent window that auth is complete
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'oauth-callback',
                code: '${code || ''}',
                state: '${state || ''}'
              }, '*');
            }
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>OAuth Error</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              max-width: 600px; 
              margin: 2rem auto; 
              padding: 0 1rem;
              color: #333;
            }
            .error { 
              background: #ffebee; 
              border-left: 4px solid #f44336; 
              padding: 1rem; 
              margin: 1rem 0; 
              border-radius: 0 4px 4px 0;
            }
          </style>
        </head>
        <body>
          <h1>OAuth Error</h1>
          
          <div class="error">
            <h3>❌ Authorization Failed</h3>
            <p>An error occurred while processing your request. Please try again.</p>
            ${error instanceof Error ? `<p><small>${error.message}</small></p>` : ''}
          </div>
          
          <p><a href="/">Return to home</a></p>
        </body>
      </html>
    `);
  }
});

export default router;
