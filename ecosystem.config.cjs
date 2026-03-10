/**
 * PM2 Ecosystem Configuration for RDTR Spasial
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 stop rdtr-spasial
 *   pm2 restart rdtr-spasial
 *   pm2 logs rdtr-spasial
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'rdtr-backend',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000 --workers 4',
      cwd: './apps/backend',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PYTHONUNBUFFERED: '1',
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
    {
      name: 'rdtr-frontend',
      script: './node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: './apps/frontend',
      interpreter: 'node',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
