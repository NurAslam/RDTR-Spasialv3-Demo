/**
 * PM2 Ecosystem Configuration for RDTR Spasial
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs
 *   pm2 stop 4004-be-rdtr-di
 *   pm2 restart 4004-be-rdtr-di
 *   pm2 logs 4004-be-rdtr-di
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: '4004-be-rdtr-di',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 4004 --workers 4',
      cwd: '/home/ml/be-rdtr-di/apps/backend',
      interpreter: 'none',  // Use system Python with full PATH
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        PATH: '/home/ml/.local/bin:/usr/local/bin:/usr/bin:/bin',
        PYTHONUNBUFFERED: '1',
      },
      error_file: '/home/ml/be-rdtr-di/logs/backend-error.log',
      out_file: '/home/ml/be-rdtr-di/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
};
