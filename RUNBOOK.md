# Serafina Bot Runbook

This document provides instructions for setting up, developing, and deploying the Serafina Discord bot.

## Table of Contents
- [Local Development](#local-development)
- [Database Management](#database-management)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Local Development

### Prerequisites
- Node.js 20.x or later
- npm or pnpm (recommended)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/serafina.git
   cd serafina
   ```

2. **Install dependencies**
   ```bash
   # Using pnpm (recommended)
   pnpm install
   
   # Or using npm
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your Discord bot token and other settings
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

### Development Commands

- `pnpm dev` - Start the development server with hot-reload
- `pnpm build` - Build the application for production
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm doctor` - Check your development environment

## Database Management

### Local Development (SQLite)

By default, the bot uses SQLite with WASM for local development. The database file will be created automatically at `./data/serafina.db`.

### Migrating to PostgreSQL

1. **Set up PostgreSQL**
   - Install PostgreSQL locally or use a managed service
   - Create a new database and user

2. **Update environment variables**
   ```env
   DB_DRIVER=postgres
   POSTGRES_URL=postgres://username:password@localhost:5432/serafina
   ```

3. **Run migrations**
   ```bash
   pnpm migrate:db
   ```

### Migrating from SQLite to PostgreSQL

1. **Backup your SQLite database**
   ```bash
   cp data/serafina.db data/serafina.backup.db
   ```

2. **Run the migration script**
   ```bash
   pnpm migrate:sqlite-to-pg
   ```

## Deployment

### Prerequisites
- Render.com account
- GitHub repository connected to Render
- PostgreSQL database (included in the Render configuration)

### Deploy to Render

1. **Fork the repository** (if you haven't already)

2. **Create a new Web Service on Render**
   - Click "New" > "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - Name: `serafina-bot`
     - Region: Choose the one closest to your users
     - Branch: `main` (or your preferred branch)
     - Build Command: `pnpm install && pnpm build`
     - Start Command: `pnpm start`

3. **Configure environment variables**
   - `NODE_ENV`: `production`
   - `DB_DRIVER`: `postgres`
   - `DISCORD_TOKEN`: Your Discord bot token
   - `DISCORD_CLIENT_ID`: Your Discord application ID
   - `DISCORD_CLIENT_SECRET`: Your Discord client secret (for OAuth)
   - `COMMANDS_SCOPE`: `global`

4. **Deploy**
   - Click "Create Web Service"
   - The first deployment will start automatically

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `production`) |
| `LOG_LEVEL` | No | `info` | Logging level (`error`, `warn`, `info`, `debug`, `trace`) |
| `DB_DRIVER` | No | `wasm` (Windows) or `postgres` | Database driver (`wasm` or `postgres`) |
| `DATABASE_URL` | No | `./data/serafina.db` | SQLite database file path |
| `POSTGRES_URL` | If `DB_DRIVER=postgres` | - | PostgreSQL connection string |
| `DISCORD_TOKEN` | Yes | - | Discord bot token |
| `DISCORD_CLIENT_ID` | Yes | - | Discord application ID |
| `DISCORD_CLIENT_SECRET` | No | - | Discord client secret (for OAuth) |
| `COMMANDS_SCOPE` | No | `guild` | Slash command scope (`guild` or `global`) |
| `DEV_GUILD_ID` | No | - | Development server ID for guild commands |
| `BOT_TAGLINE` | No | `Serafina — your comms layer.` | Bot tagline |
| `APP_DESCRIPTION` | No | `Serafina routes messages and services. Use /help.` | Bot description |
| `PORT_HTTP` | No | `8787` | HTTP server port |

## Troubleshooting

### Common Issues

#### Database Connection Issues
- **Error**: `Failed to connect to the database`
  - **Solution**: Verify your database URL and credentials
  - For PostgreSQL, ensure the server is running and accessible

#### Missing Permissions
- **Error**: `Missing Access` or `Missing Permissions`
  - **Solution**: Ensure the bot has the necessary permissions in the Discord server
  - Invite the bot with the correct OAuth2 scopes and permissions

#### Commands Not Showing Up
- **Issue**: Slash commands don't appear in Discord
  - **Solution**:
    1. Check if the bot is online
    2. Run `pnpm register` to register commands
    3. Wait up to an hour for global commands to update

### Getting Help

If you encounter any issues not covered in this guide:

1. Check the [Discord.js Guide](https://discordjs.guide/)
2. Open an issue on GitHub
3. Join our [Discord server](#) for support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
