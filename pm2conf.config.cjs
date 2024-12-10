module.exports = {
  apps: [
    {
      name: "Internal Systems New Beginning",
      script: "app.js",
      wait_ready: true, // Wait for build process readiness
      autorestart: true,
      args: "start",
    },
    {
      name: "frontend_build",
      script: "npm",
      args: "run build", // Install hooks or clean configure build
      cwd: "./frontend",
    },
  ],
};
