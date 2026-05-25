# Stella AI Tutor

Lightweight deployment guide and quick start for launch.

## Overview

This repository contains the Stella AI Tutor web service and API proxy. The app is ready for production deployment via Cloud Run or any container platform.

## Quick start (local)

Prerequisites: Node.js, npm

1. Install dependencies:

   npm install

2. Create a local environment file from the template and fill in secrets locally:

   cp .env.example .env

3. Run in development mode:

   npm run dev

## Deploy (recommended)

Use the provided Cloud Run deploy script to build, push, and deploy the container to GCP (project `cbc-ai-5c869`):

```powershell
.\cloud-run-deploy.ps1 -ResendApiKey "<secret>" -FirebaseApiKey "<secret>" -RedisUrl "redis://:PASSWORD@HOST:6379"
```

Alternatively build and push the Docker image and deploy manually to your cloud provider.

## Important env vars

Use `.env.example` as the template. Required values for production:

- `RESEND_API_KEY` — email provider key (store in Secret Manager)
- `FIREBASE_API_KEY` and other `FIREBASE_*` vars — Firebase web config
- `REDIS_URL` — optional Redis connection for distributed rate limiting
- `NODE_ENV` — set to `production` in deployment

## Security notes

- Never commit `.env` or real API keys to source control. Use Secret Manager or your platform's secret store.
- Rotate any exposed keys immediately.
- Health endpoints: `/_health` and `/_ready` are available for load balancers.

## Operations

- Use Cloud Armor / WAF + HTTPS Load Balancer for edge protection and IP/geo controls.
- Monitor with Cloud Monitoring / Cloud Logging and alert on 5xx spikes, 429s, and sustained traffic surges.

## Support

For deployment help or questions, open an issue or contact the team.

