import { Database } from "bun:sqlite";

const db = new Database("manga.db");

db.run(`
  CREATE TABLE IF NOT EXISTS volumes (
    id INTEGER PRIMARY KEY,
    number INTEGER UNIQUE NOT NULL,
    page_count INTEGER NOT NULL DEFAULT 0
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY,
    volume_id INTEGER NOT NULL,
    page_number INTEGER NOT NULL,
    filename TEXT NOT NULL,
    FOREIGN KEY (volume_id) REFERENCES volumes(id),
    UNIQUE(volume_id, page_number)
  )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_pages_volume ON pages(volume_id)`);

export default db;
