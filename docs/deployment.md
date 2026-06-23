# Photorido Deployment Guide

This guide deploys the current `UAT` branch with:

- Backend: Render Web Service from `backend/`
- Frontend: Vercel Vite project from `frontend/`
- Database: MongoDB Atlas

Automatic deploys are possible after the first dashboard setup. The first setup cannot be fully automated from this repo because Render, Vercel, MongoDB Atlas, Google OAuth, and Mailtrap secrets must be created and stored in provider dashboards.

## Files Added Or Updated

- `render.yaml` - Render backend blueprint.
- `frontend/vercel.json` - Vercel SPA routing and build settings.
- `backend/src/config/env.ts` - supports comma-separated `CORS_ORIGINS`.
- `backend/src/app.ts` and `backend/src/realtime/socket.ts` - use the configured CORS origin list.
- `backend/src/modules/auth/*.ts` - production cookies use `SameSite=None` and `Secure`.
- `backend/.env.example` and `frontend/.env.example` - deployment env examples.
- `backend/package.json` and `frontend/package.json` - Node version hint.

## Local Build Checks

Run these before deploying or pushing to `UAT`:

```powershell
git checkout UAT
git pull origin UAT

npm --prefix backend ci
npm --prefix frontend ci

npm --prefix backend run check
npm --prefix backend run build
npm --prefix backend run test

npm --prefix frontend run build
```

Expected results:

- Backend TypeScript compiles into `backend/dist`.
- Backend smoke tests print `Backend smoke tests passed.`
- Frontend builds into `frontend/dist`.

Optional root helpers:

```powershell
npm run build:backend
npm run test:backend
npm run build:frontend
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas project.
2. Create an Atlas cluster. A free `M0` cluster is fine for UAT testing.
3. Create a database user, for example `photorido_uat`.
4. Add an IP access list entry.
   - Easiest UAT option: allow access from anywhere with `0.0.0.0/0`, then use a strong database password.
   - Better production option: use a static outbound IP or private connectivity and restrict Atlas to that IP/network.
5. Copy the SRV connection string and include the database name:

```text
mongodb+srv://photorido_uat:<url-encoded-password>@<cluster-host>/photorido-uat?retryWrites=true&w=majority
```

Use that full value as Render's `MONGODB_URI`.

## Render Backend Setup

Preferred setup:

1. Push `render.yaml` to GitHub on `UAT`.
2. In Render, create a new Blueprint from this repo.
3. Select branch `UAT`.
4. Render will create the `photorido-backend` Web Service from `backend/`.
5. Fill every `sync: false` environment variable when Render prompts for values.

Manual setup if you do not use the blueprint:

- Service type: Web Service
- Runtime: Node
- Branch: `UAT`
- Root Directory: `backend`
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start`
- Health Check Path: `/api/health`
- Instance type: `starter` if you need persistent uploads
- Persistent disk:
  - Name: `photorido-uploads`
  - Mount path: `/opt/render/project/src/uploads`
  - Size: `1 GB` or larger

Render environment variables:

```text
NODE_ENV=production
API_PREFIX=/api
MONGODB_URI=<MongoDB Atlas connection string>
FRONTEND_URL=https://<your-vercel-project>.vercel.app
CORS_ORIGINS=https://<your-vercel-project>.vercel.app
JWT_ACCESS_SECRET=<generate a 32+ character secret>
JWT_REFRESH_SECRET=<generate a different 32+ character secret>
AUTH_COOKIE_NAME=photorido_auth_token
REFRESH_COOKIE_NAME=photorido_refresh_token
ACCESS_TOKEN_TTL_HOURS=24
REFRESH_TOKEN_TTL_DAYS=30
BCRYPT_SALT_ROUNDS=12
JSON_BODY_LIMIT=20mb
GOOGLE_CLIENT_ID=<same OAuth client id used by the frontend, if Google login is enabled>
GOOGLE_MAPS_API_KEY=<optional, required for full place lookup>
MAILTRAP_API_URL=https://send.api.mailtrap.io/api/send
MAILTRAP_API_TOKEN=<required for OTP email delivery>
MAILTRAP_SENDER_EMAIL=<verified sender email>
MAILTRAP_SENDER_NAME=Photorido
OTP_TTL_MINUTES=10
OTP_RESEND_COOLDOWN_SECONDS=60
OTP_MAX_ATTEMPTS=5
OTP_MOBILE_TEST_RECIPIENT_EMAIL=<optional>
ALLOW_PUBLIC_REGISTRATION=true
```

If you use a custom frontend domain or Vercel preview URL, add it to `CORS_ORIGINS`:

```text
CORS_ORIGINS=https://photorido.vercel.app,https://uat.photorido.com
```

After deployment, verify:

```powershell
Invoke-RestMethod https://<render-service>.onrender.com/
Invoke-RestMethod https://<render-service>.onrender.com/api/health
```

## Vercel Frontend Setup

1. Import the same Git repository into Vercel.
2. Set Root Directory to `frontend`.
3. Set the production branch to `UAT` in project Git settings.
4. Framework Preset: Vite
5. Install Command: `npm ci`
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Add environment variables.
9. Deploy.

Vercel environment variables:

```text
VITE_API_BASE_URL=https://<render-service>.onrender.com/api
VITE_GOOGLE_CLIENT_ID=<same Google OAuth client id as backend GOOGLE_CLIENT_ID>
```

Important: do not leave `VITE_API_BASE_URL=/api` on Vercel unless you add a Vercel rewrite/proxy to the backend. In this repo, Vercel should call Render directly with the full backend URL.

After deployment, verify:

1. Open the Vercel site.
2. Open browser DevTools > Network.
3. Confirm API calls go to `https://<render-service>.onrender.com/api/...`.
4. Register or log in.
5. Test marketplace listing load, image upload, and realtime conversation updates.

## Google And Mailtrap Setup

Google login:

1. In Google Cloud Console, open the OAuth client used by the app.
2. Add the Vercel production URL to Authorized JavaScript origins:

```text
https://<your-vercel-project>.vercel.app
```

3. If you add a custom domain, add that too.
4. Set the same client ID in:
   - Render: `GOOGLE_CLIENT_ID`
   - Vercel: `VITE_GOOGLE_CLIENT_ID`

Mailtrap OTP email:

1. Verify the sender domain/email in Mailtrap.
2. Set `MAILTRAP_API_TOKEN`.
3. Set `MAILTRAP_SENDER_EMAIL` to the verified sender.
4. Test registration OTP after deploying the backend.

## Beginner Pitfalls And Fixes

- Frontend calls `https://your-site.vercel.app/api` and gets 404.
  Fix: set `VITE_API_BASE_URL=https://<render-service>.onrender.com/api` in Vercel, then redeploy.

- Browser says CORS blocked.
  Fix: set Render `FRONTEND_URL` to the exact Vercel origin, with no trailing slash. Add the same origin to `CORS_ORIGINS`.

- Login works, then refresh/logout behaves strangely.
  Fix: ensure Render has `NODE_ENV=production` and the frontend uses HTTPS. Production auth cookies are now `SameSite=None` and `Secure`.

- Render deploy succeeds but app exits immediately.
  Fix: check `MONGODB_URI`, database user credentials, and Atlas IP access list. The backend connects to MongoDB before listening for traffic.

- Uploaded images disappear after redeploy.
  Fix: attach the Render disk at `/opt/render/project/src/uploads`, or move uploads to object storage such as S3/Cloudinary before production scale.

- Uploaded files do not scale across multiple backend instances.
  Fix: keep one Render instance with the disk, or migrate uploads to shared object storage. A Render persistent disk is attached to one service instance.

- Health check fails.
  Fix: use `/api/health`, not `/health`. Check Render logs for MongoDB connection errors.

- Build fails on platform but works locally.
  Fix: use Node 20 or 22. This repo declares `>=20 <23` in both deployable package roots.

- Google login says it is not configured.
  Fix: set both `GOOGLE_CLIENT_ID` on Render and `VITE_GOOGLE_CLIENT_ID` on Vercel, then redeploy both services.

- OTP email does not send.
  Fix: set `MAILTRAP_API_TOKEN` and `MAILTRAP_SENDER_EMAIL`; the sender must be verified in Mailtrap.

## Manual Deployment Checklist

1. Push the branch:

```powershell
git checkout UAT
git add .
git commit -m "Add Render and Vercel deployment configuration"
git push origin UAT
```

2. Create MongoDB Atlas cluster and copy the connection string.
3. Create the Render backend from `render.yaml` or the manual fields above.
4. Add Render secrets and deploy.
5. Confirm `https://<render-service>.onrender.com/api/health` returns JSON.
6. Create the Vercel frontend with root directory `frontend`.
7. Add Vercel env vars and deploy.
8. Update Render `FRONTEND_URL` and `CORS_ORIGINS` with the final Vercel URL, then redeploy Render.
9. Test login, listing load, uploads, and realtime messaging from the Vercel site.

## References

- Render Node/Express deployment: https://render.com/docs/deploy-node-express-app
- Render monorepo root directories: https://render.com/docs/monorepo-support
- Render blueprint spec: https://render.com/docs/blueprint-spec
- Render persistent disks: https://render.com/docs/disks
- Vercel monorepos: https://vercel.com/docs/monorepos
- Vercel Vite SPA rewrites: https://vercel.com/docs/frameworks/frontend/vite
- Vercel environment variables: https://vercel.com/docs/environment-variables
- MongoDB Atlas free cluster: https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/
- MongoDB Atlas IP access lists: https://www.mongodb.com/docs/atlas/security/ip-access-list/
