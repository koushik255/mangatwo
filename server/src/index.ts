import { Elysia } from "elysia";
import { scanManga, getVolumes, getPage } from "./scanner";
import { staticPlugin } from "@elysiajs/static";

const MANGA_DIR = process.env.MANGA_DIR || "/root/vagabond/VAGABOND";
const PORT = parseInt(process.env.PORT || "3000");

const app = new Elysia()
  .use(
    staticPlugin({
      assets: MANGA_DIR,
      prefix: "/images",
    })
  )
  .get("/api/volumes", () => getVolumes())
  .get("/api/volumes/:volume/pages/:page", ({ params }) => {
    const volume = parseInt(params.volume);
    const page = parseInt(params.page);
    return getPage(volume, page);
  })
  .post("/api/scan", () => scanManga())
  .get("/", () => html)
  .listen(PORT);

console.log(`Server running at http://localhost:${PORT}`);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manga Reader</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: #1a1a1a; 
      color: #fff; 
      font-family: system-ui, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .controls {
      padding: 20px;
      display: flex;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
    }
    select, button {
      padding: 8px 16px;
      font-size: 16px;
      background: #333;
      color: #fff;
      border: 1px solid #555;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover { background: #444; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    select { min-width: 120px; }
    .page-info { min-width: 100px; text-align: center; }
    .image-container {
      flex: 1;
      display: flex;
      justify-content: center;
      padding: 20px;
      width: 100%;
    }
    img {
      max-width: 100%;
      max-height: calc(100vh - 120px);
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div class="controls">
    <select id="volumeSelect"></select>
    <button id="prevBtn" onclick="prevPage()">Prev</button>
    <span class="page-info" id="pageInfo">Loading...</span>
    <button id="nextBtn" onclick="nextPage()">Next</button>
  </div>
  <div class="image-container">
    <img id="mangaImage" src="" alt="manga page">
  </div>

  <script>
    let volumes = [];
    let currentVolume = 1;
    let currentPage = 1;
    let totalPages = 0;

    async function loadVolumes() {
      const res = await fetch('/api/volumes');
      volumes = await res.json();
      const select = document.getElementById('volumeSelect');
      select.innerHTML = volumes.map(v => 
        '<option value="' + v.number + '">Volume ' + v.number + '</option>'
      ).join('');
      select.value = currentVolume;
      select.onchange = () => {
        currentVolume = parseInt(select.value);
        currentPage = 1;
        loadPage();
      };
      loadPage();
    }

    async function loadPage() {
      const res = await fetch('/api/volumes/' + currentVolume + '/pages/' + currentPage);
      const data = await res.json();
      if (!data) {
        document.getElementById('pageInfo').textContent = 'Not found';
        return;
      }
      totalPages = data.totalPages;
      document.getElementById('mangaImage').src = data.imageUrl;
      document.getElementById('pageInfo').textContent = currentPage + ' / ' + totalPages;
      updateButtons();
    }

    function updateButtons() {
      document.getElementById('prevBtn').disabled = currentPage <= 1;
      document.getElementById('nextBtn').disabled = currentPage >= totalPages;
    }

    function prevPage() {
      if (currentPage > 1) {
        currentPage--;
        loadPage();
      }
    }

    function nextPage() {
      if (currentPage < totalPages) {
        currentPage++;
        loadPage();
      } else if (currentVolume < volumes.length) {
        currentVolume++;
        currentPage = 1;
        document.getElementById('volumeSelect').value = currentVolume;
        loadPage();
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'ArrowRight') nextPage();
    });

    loadVolumes();
  </script>
</body>
</html>`;
