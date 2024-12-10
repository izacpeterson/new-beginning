module.exports = {
  apps: [
    {
      name: "Internal Systems New Beginning",
      script: "npm run start",
      wait_ready: true, // Wait for build process readiness
      autorestart: true,
    },
  ],
};
