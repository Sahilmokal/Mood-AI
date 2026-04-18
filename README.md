# MoodRec — AI-Powered Mood-Based Recommendation System

A production-ready full-stack application that detects your mood via facial emotion analysis and text sentiment, then recommends personalized movies, music, and activities.

---

## Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 18, Tailwind CSS, Framer Motion, Vite |
| Backend    | Java 17, Spring Boot 3.2, Spring Security   |
| ML Service | Python 3.11, FastAPI, DeepFace, HuggingFace |
| Database   | PostgreSQL 16, Flyway migrations            |
| Auth       | JWT (jjwt 0.12)                             |
| Deploy     | Docker Compose, AWS EC2/RDS/S3/CloudFront   |

---

## Project Structure

```
mood-rec-system/
├── backend/          Spring Boot REST API
├── ml-service/       Python FastAPI ML service
├── frontend/         React SPA
├── docs/             AWS deployment guide
├── docker-compose.yml
├── docker-compose.prod.yml
└── .env.example
```

---

## Quick Start (Local)

### Prerequisites
- Docker & Docker Compose
- TMDB API key (free at https://www.themoviedb.org/settings/api)
- Spotify API credentials (free at https://developer.spotify.com/dashboard)

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/mood-rec-system.git
cd mood-rec-system
cp .env.example .env
# Edit .env and add your TMDB_API_KEY, SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
```

### 2. Start All Services

```bash
docker-compose up --build
```

This starts:
- PostgreSQL on `localhost:5432`
- FastAPI ML service on `localhost:8000`
- Spring Boot backend on `localhost:8080`
- React frontend on `localhost:3000`

### 3. Open App

Visit [http://localhost:3000](http://localhost:3000) → Register → Analyze your mood!

---

## API Reference

| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| POST   | /api/v1/auth/register           | —    | Register new user        |
| POST   | /api/v1/auth/login              | —    | Login, get JWT           |
| POST   | /api/v1/mood/analyze-text       | JWT  | Text sentiment analysis  |
| POST   | /api/v1/mood/detect-face        | JWT  | Face emotion detection   |
| POST   | /api/v1/mood/analyze-combined   | JWT  | Combined analysis        |
| GET    | /api/v1/recommendations         | JWT  | Get recommendations      |
| POST   | /api/v1/feedback                | JWT  | Like/dislike a rec       |
| GET    | /api/v1/user/history            | JWT  | Mood history + stats     |

---

## ML Endpoints

| Method | Endpoint         | Description                         |
|--------|------------------|-------------------------------------|
| POST   | /detect-emotion  | Base64 image → mood + confidence    |
| POST   | /analyze-text    | Text string → mood + confidence     |
| GET    | /health          | Health check                        |

---

## Moods Supported

`happy` · `sad` · `angry` · `stressed` · `fearful` · `surprised` · `disgusted` · `calm` · `energetic` · `neutral`

---

## Environment Variables

| Variable               | Required | Description                   |
|------------------------|----------|-------------------------------|
| DB_URL                 | Yes      | PostgreSQL JDBC URL           |
| DB_USER / DB_PASS      | Yes      | Database credentials          |
| JWT_SECRET             | Yes      | Min 32-char secret key        |
| ML_SERVICE_URL         | Yes      | FastAPI base URL              |
| TMDB_API_KEY           | Yes      | The Movie Database API key    |
| SPOTIFY_CLIENT_ID      | Yes      | Spotify Developer client ID   |
| SPOTIFY_CLIENT_SECRET  | Yes      | Spotify Developer secret      |

---

## Production Deployment

See [docs/AWS_DEPLOYMENT.md](docs/AWS_DEPLOYMENT.md) for full EC2 + RDS + S3 + CloudFront guide.

---

## License

MIT
