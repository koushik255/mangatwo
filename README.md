# Manga Reader

Simple manga reader with Bun + Elysia backend and minimal HTML frontend.

## Local Development

```bash
cd server
bun install
bun run dev
```

Open http://localhost:3000

## Deployment on VPS

### 1. Install Bun on VPS

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

### 2. Clone and Setup

```bash
git clone <your-repo-url>
cd <repo>/server
bun install
```

### 3. Set Environment Variables (optional)

```bash
export MANGA_DIR=/root/vagabond/VAGABOND
export PORT=3000
```

### 4. Start Server

```bash
bun run start
```

### 5. Scan Manga (first time only)

```bash
curl -X POST http://localhost:3000/api/scan
```

### 6. Run in Background (with pm2 or nohup)

Using nohup:
```bash
nohup bun run start > server.log 2>&1 &
```

Using pm2:
```bash
npm install -g pm2
pm2 start "bun run start" --name manga-reader
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/volumes` | List all volumes |
| GET | `/api/volumes/:volume/pages/:page` | Get page info |
| POST | `/api/scan` | Scan filesystem for manga |
| GET | `/images/*` | Serve static images |
| GET | `/` | Reader frontend |

## Project Structure

```
server/
├── src/
│   ├── index.ts      # Main server + frontend HTML
│   ├── db.ts         # SQLite setup
│   └── scanner.ts    # Filesystem scanner
├── manga.db          # SQLite database (auto-created)
└── package.json
```
# mangatwo
