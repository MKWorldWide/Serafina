# GitHub Secrets Setup Guide

To set up GitHub secrets for the Notion sync workflow, follow these steps:

## 1. Go to Your Repository Settings

1. Navigate to your GitHub repository: `https://github.com/M-K-World-Wide/GameDinDiscord`
2. Click on **Settings** tab
3. In the left sidebar, click on **Secrets and variables** → **Actions**

## 2. Add the Required Secrets

Click **New repository secret** for each of the following:

### Discord Bot Secrets
- **Name:** `DISCORD_TOKEN`
- **Value:** `MTM0MTkzNzY1NTA1MDY3MDA4MA.GmMo4x.npcIS0rjKjlHdxYk-zOXZahmAFnEfypwz9FnVY`

- **Name:** `DISCORD_CLIENT_ID`
- **Value:** `1341937655050670080`

- **Name:** `DISCORD_GUILD_ID`
- **Value:** `1331043745638121544`

### API Keys
- **Name:** `NOTION_API_KEY`
- **Value:** `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`

- **Name:** `MISTRAL_API_KEY`
- **Value:** `6OKO4oJxWFbD5AmYAGWNRC3l61J7N7NE`

## 3. Verify Setup

After adding all secrets, you can:

1. Go to **Actions** tab
2. Click on **Notion Documentation Sync** workflow
3. Click **Run workflow** to test the setup
4. Choose **manual** or **full** sync type
5. Click **Run workflow**

## 4. Automatic Triggers

The workflow will automatically run when:
- You push changes to `docs/` files
- You modify `scripts/notion-*.js` files
- You manually trigger it from the Actions tab

## 5. Security Notes

- ✅ Secrets are encrypted and never visible in logs
- ✅ Only repository admins can manage secrets
- ✅ Secrets are automatically available in GitHub Actions
- ✅ Your local `.env` file remains separate and secure

## 6. Troubleshooting

If the workflow fails:
1. Check that all secrets are correctly named
2. Verify API keys are valid and have proper permissions
3. Check the workflow logs for specific error messages
4. Ensure your Notion pages are shared with the integration

## 7. Manual Setup Commands

If you prefer to use GitHub CLI:

```bash
# Install GitHub CLI if not already installed
# brew install gh (macOS)
# Then authenticate: gh auth login

# Add secrets via CLI
gh secret set DISCORD_TOKEN --body "MTM0MTkzNzY1NTA1MDY3MDA4MA.GmMo4x.npcIS0rjKjlHdxYk-zOXZahmAFnEfypwz9FnVY"
gh secret set DISCORD_CLIENT_ID --body "1341937655050670080"
gh secret set DISCORD_GUILD_ID --body "1331043745638121544"
gh secret set NOTION_API_KEY --body "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"
gh secret set MISTRAL_API_KEY --body "6OKO4oJxWFbD5AmYAGWNRC3l61J7N7NE"
```

---

**Note:** Keep your API keys secure and never commit them to the repository. The `.env` file is already in `.gitignore` to prevent accidental commits. 