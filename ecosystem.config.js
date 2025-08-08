module.exports = {
  apps: [
    // Main Serafina bot
    {
      name: 'serafina-bot',
      script: 'dist/bot.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: 'logs/serafina-err.log',
      out_file: 'logs/serafina-out.log',
      time: true,
    },
    // Shadow Nexus Service
    {
      name: 'shadow-nexus',
      script: 'dist/services/shadow-nexus.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.SHADOW_NEXUS_PORT || 10000,
      },
      error_file: 'logs/shadow-nexus-err.log',
      out_file: 'logs/shadow-nexus-out.log',
      time: true,
    },
    // AthenaCore Service
    {
      name: 'athena-core',
      script: 'dist/services/athena-core.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.ATHENA_CORE_PORT || 10001,
      },
      error_file: 'logs/athena-core-err.log',
      out_file: 'logs/athena-core-out.log',
      time: true,
    },
    // Divina Service
    {
      name: 'divina',
      script: 'dist/services/divina.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.DIVINA_PORT || 10002,
      },
      error_file: 'logs/divina-err.log',
      out_file: 'logs/divina-out.log',
      time: true,
    },
  ],
};
