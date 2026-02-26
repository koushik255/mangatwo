# Manga Reader

Simple manga reader with Bun + Elysia backend and React frontend.

## Local Development

### Backend
```bash
cd server
bun install
bun run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Deployment on VPS

### 1. Install Bun on VPS

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### 2. Clone and Setup

```bash
git clone <your-repo-url>
cd <repo>
```

### 3. Setup Backend

```bash
cd server
bun install
MANGA_DIR=/root/vagabond/VAGABOND PORT=80 bun run start &
curl -X POST http://localhost/api/scan
```

### 4. Build Frontend (optional - for production)

```bash
cd client
npm install
npm run build
```

The built files go to `client/dist`. Serve them with nginx or copy to server.

## Project Structure

```
server/
├── src/
│   ├── index.ts      # Main server
│   ├── db.ts         # SQLite setup
│   └── scanner.ts    # Filesystem scanner
├── manga.db          # SQLite database (auto-created)
└── package.json

client/
├── src/
│   ├── App.tsx       # Main React component
│   └── main.tsx      # Entry point
├── vite.config.ts
└── package.json
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/volumes` | List all volumes |
| GET | `/api/volumes/:volume/pages/:page` | Get page info |
| POST | `/api/scan` | Scan filesystem for manga |
| GET | `/images/*` | Serve static images |
