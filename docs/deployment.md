# Deployment Guide — Free Hosting

This guide covers deploying the full stack on free-tier services:

| Layer | Service | Free Tier |
|---|---|---|
| Frontend | Vercel | Unlimited hobby projects |
| Backend | Render | 1 free web service (spins down after 15 min inactivity) |
| Database | Neon | 0.5 GB PostgreSQL, always-on |

---

## Overview

```
Browser → Vercel (Next.js) → Render (Spring Boot) → Neon (PostgreSQL)
```

The frontend calls the backend via `NEXT_PUBLIC_API_URL`. The backend connects to Neon via a standard JDBC URL. Flyway runs migrations automatically on startup.

---

## 1. Database — Neon

### Setup

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project — name it `regression-management`
3. Neon creates a default database. Note the connection string from the dashboard:
   ```
   postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require
   ```
4. Convert it to JDBC format for Spring Boot:
   ```
   jdbc:postgresql://<host>.neon.tech/<dbname>?sslmode=require
   ```

### Notes

- Flyway will run `V1__init_schema.sql` automatically on first backend startup — no manual schema setup needed
- Neon's free tier is always-on (unlike Render), so the DB is never cold
- Keep the username, password, and host — you'll need them as environment variables on Render

---

## 2. Backend — Render

### Add a Dockerfile

Render supports Java via Docker. Create this file at `backend/regression-management-backend/Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/regression-management-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Connect your repo

1. Push your project to GitHub (including the Dockerfile above)
2. Go to [render.com](https://render.com) and sign up
3. Click **New → Web Service**
4. Connect your GitHub repo
5. Set the **Root Directory** to:
   ```
   backend/regression-management-backend
   ```

### Build & start commands

| Field | Value |
|---|---|
| Runtime | **Docker** |
| Dockerfile Path | `./Dockerfile` |

Render will detect the Dockerfile automatically and use it — no build or start command needed.

### Environment variables

Set these in the Render dashboard under **Environment**:

| Key | Value |
|---|---|
| `DB_USERNAME` | Your Neon DB username |
| `DB_PASSWORD` | Your Neon DB password |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://<host>.neon.tech/<dbname>?sslmode=require` |
| `JWT_SECRET` | A random 64-char hex string (generate one below) |
| `ALLOWED_ORIGIN` | `https://<your-app>.vercel.app` |

Generate a JWT secret:
```bash
openssl rand -hex 32
```

### CORS

Before deploying, update your Spring Security config to allow requests from your Vercel domain. In `SecurityConfig.java`, update the CORS allowed origins to include:
```
https://<your-app>.vercel.app
```

You can use an environment variable for this:
```java
@Value("${ALLOWED_ORIGIN:http://localhost:3000}")
private String allowedOrigin;
```

Then reference `allowedOrigin` in your CORS configuration.

### Free tier caveat

Render's free web service **spins down after 15 minutes of inactivity**. The first request after a cold start takes ~30–60 seconds. This is a known limitation of the free tier. Paid plans ($7/month) keep the service always-on.

---

## 3. Frontend — Vercel

### Deploy

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New → Project**
3. Import your GitHub repo
4. Set the **Root Directory** to:
   ```
   frontend
   ```
5. Vercel auto-detects Next.js — no build command changes needed

### Environment variables

Set this in the Vercel dashboard under **Settings → Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<your-render-service>.onrender.com/api` |

> Make sure to set it for **Production**, **Preview**, and **Development** environments

### Deploy

Click **Deploy**. Vercel builds and deploys automatically. Every push to `main` triggers a redeploy.

---

## 4. Wiring it all together

After all three services are up:

1. Copy your Render backend URL (e.g. `https://regression-backend.onrender.com`)
2. Set `NEXT_PUBLIC_API_URL=https://regression-backend.onrender.com/api` in Vercel
3. Copy your Vercel frontend URL (e.g. `https://regression-management.vercel.app`)
4. Add that URL to your backend's CORS allowed origins and redeploy Render

### Verify

```
GET https://regression-backend.onrender.com/api/regression-packs
→ 200 OK (or 401 if auth is required — that means the backend is alive)

GET https://regression-management.vercel.app
→ Frontend loads and can reach the backend
```

---

## 5. Environment variable summary

### Render (backend)

```env
DB_USERNAME=<neon-user>
DB_PASSWORD=<neon-password>
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>.neon.tech/<dbname>?sslmode=require
JWT_SECRET=<64-char-hex>
ALLOWED_ORIGIN=https://<your-app>.vercel.app
```

### Vercel (frontend)

```env
NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com/api
```

---

## 6. Redeployment

| Change | Action |
|---|---|
| Frontend code | Push to `main` — Vercel redeploys automatically |
| Backend code | Push to `main` — Render redeploys automatically |
| New DB migration | Push backend — Flyway runs new migration on startup |
| New env variable | Set in dashboard, then trigger manual redeploy |

---

## 7. Limitations of free tier

| Issue | Cause | Workaround |
|---|---|---|
| Backend slow first load | Render spins down after 15 min | Upgrade to Render paid ($7/mo) or use a cron job to ping the service every 10 min |
| 0.5 GB DB limit | Neon free tier | Sufficient for this app unless storing large attachments |
| Vercel build minutes | 6,000 min/month free | More than enough for a personal project |
| No persistent file storage | Render free has ephemeral disk | Attachments stored in DB or move to S3 if needed |
