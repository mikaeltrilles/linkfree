// Configuration PM2 pour l'hébergement cPanel (o2switch).
// Lancement : npx pm2 startOrRestart ecosystem.config.js --update-env
module.exports = {
  apps: [
    {
      name: "linkfree",
      script: "./server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      restart_delay: 3000,
      exp_backoff_restart_delay: 100,
      max_memory_restart: "700M",
      kill_timeout: 10000,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      error_file: "./logs/linkfree-error.log",
      out_file: "./logs/linkfree-out.log",
    },
  ],
}
