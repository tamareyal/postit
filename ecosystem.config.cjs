module.exports = {
  apps: [
    {
      name: "vite-frontend",
      script: "npm",
      args: "run preview",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
}

