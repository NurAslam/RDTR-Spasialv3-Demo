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
      args: 'src.app.main:app --host 0.0.0.0 --port 4004',
      cwd: '/home/ml/be-rdtr-di',
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '4G',  // Increased from 2G - needed for 2GB GeoJSON + Python overhead
      // Increase timeout for slow startup (loading 2GB data)
      listen_timeout: 600000,  // 10 minutes (increased from 5)
      kill_timeout: 60000,     // 1 minute (decreased - faster kill)
      wait_ready: false,       // Changed from true - wait_ready can cause issues with long startups
      // Disable autorestart if it keeps crashing
      exp_backoff_restart_delay: 10000,  // Increased from 5000
      min_uptime: '120s',  // Increased from 60s - give more time for large data loading
      max_restarts: 10,    // Limit restarts to prevent infinite loop
      autorestart: true,   // Keep autorestart enabled
      env: {
        // Set PYTHONPATH to find both src module and app package
        PYTHONPATH: '/home/ml/be-rdtr-di:/home/ml/be-rdtr-di/src',
        // Set BASE_DIR explicitly for deployment
        BASE_DIR: '/home/ml/be-rdtr-di',
        PATH: '/home/ml/.local/bin:/usr/local/bin:/usr/bin:/bin',
        PYTHONUNBUFFERED: '1',
        // Set production frontend URL for CORS
        PRODUCTION_FRONTEND_URL: 'https://rdtr.urbansolv.co.id',
        // Skip preloading data at startup (load on-demand instead)
        // Set to 'true' if experiencing OOM or restart loops
        SKIP_PRELOAD: 'true',
      },
      error_file: '/home/ml/be-rdtr-di/logs/backend-error.log',
      out_file: '/home/ml/be-rdtr-di/logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
    },
  ],
};
