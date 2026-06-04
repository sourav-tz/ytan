# YtAna — AI-Powered YouTube Comment Analyzer

## Stack
- **Backend**: FastAPI + Python, HuggingFace Transformers, YouTube Data API v3
- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Recharts
- **AI Models**: `cardiffnlp/twitter-roberta-base-sentiment-latest` (sentiment), `j-hartmann/emotion-english-distilroberta-base` (emotions)

---

## Project Structure

```
YtAna/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app + CORS
│   │   ├── config.py             # Pydantic settings / env vars
│   │   ├── models/schemas.py     # Request/response types
│   │   ├── routers/analyze.py    # POST /analyze, GET /health
│   │   └── services/
│   │       ├── youtube_service.py    # YouTube Data API v3 client
│   │       ├── sentiment_service.py  # Transformer inference
│   │       ├── analytics_service.py  # Stats computation
│   │       └── insights_service.py   # AI narrative generation
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    │   ├── components/   # UrlInput, Charts, Table, Insights…
    │   ├── hooks/        # useAnalysis (loading/error state)
    │   ├── services/api.ts
    │   ├── types/index.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── vite.config.ts
    └── package.json
```

---

## Setup

### 1. Get a YouTube Data API v3 Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **YouTube Data API v3**
3. Create an API Key under **Credentials**

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set YOUTUBE_API_KEY=<your key>

# Download NLTK data (one-time)
python -c "import nltk; nltk.download('punkt')"

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

> **Note**: On first run, HuggingFace will download the transformer models (~500 MB). Subsequent runs use the local cache.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 key | **required** |
| `MAX_COMMENTS` | Max comments to fetch per video | `500` |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `http://localhost:5173` |

---

## API Endpoints

### `POST /api/v1/analyze`
**Body**: `{ "url": "https://youtube.com/watch?v=..." }`

**Returns**: Full analysis including sentiment, emotions, keywords, engagement stats, AI insights, and comment samples.

### `GET /api/v1/health`
**Returns**: `{ "status": "ok" }`

---

## Adding MongoDB (Future)

The `youtube_service.py` returns plain dicts; swap in a repository layer:

```python
# services/comment_repository.py
from motor.motor_asyncio import AsyncIOMotorClient

class CommentRepository:
    async def save(self, video_id, comments): ...
    async def get(self, video_id): ...
```

No changes needed to routers or analytics services.

---

## Deployment

### Backend (Railway / Render)
```bash
# Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
Set env vars in the platform dashboard.

### Frontend (Vercel / Netlify)
```bash
cd frontend && npm run build
# Deploy the dist/ folder
# Set VITE_API_BASE_URL env var to your backend URL
```

Update `vite.config.ts` proxy target for production or use `axios.defaults.baseURL`.
