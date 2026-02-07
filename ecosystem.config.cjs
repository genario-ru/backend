module.exports = {
  apps: [
    {
      name: "genario-api",
      script: "dist/server.js",
      instances: 1,
      exec_mode: "fork",
    },
    {
      name: "genario-workers",
      script: "dist/workers.js",
      instances: 1,
      exec_mode: "fork",
    },
  ],
};
