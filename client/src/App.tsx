import { useState, useEffect, useCallback } from 'react'

interface Volume {
  id: number
  number: number
  page_count: number
}

interface PageData {
  volume: number
  page: number
  totalPages: number
  filename: string
  imageUrl: string
}

const API_BASE = import.meta.env.VITE_API_BASE || ''

function App() {
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [currentVolume, setCurrentVolume] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/volumes`)
      .then(res => res.json())
      .then((data: Volume[]) => {
        setVolumes(data)
        if (data.length > 0) {
          loadPage(data[0].number, 1)
        }
      })
  }, [])

  const loadPage = useCallback((volume: number, page: number) => {
    setLoading(true)
    fetch(`${API_BASE}/api/volumes/${volume}/pages/${page}`)
      .then(res => res.json())
      .then((data: PageData) => {
        if (data) {
          setCurrentVolume(data.volume)
          setCurrentPage(data.page)
          setTotalPages(data.totalPages)
          setImageUrl(data.imageUrl)
        }
        setLoading(false)
      })
  }, [])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      loadPage(currentVolume, currentPage + 1)
    } else {
      const nextVol = volumes.find(v => v.number === currentVolume + 1)
      if (nextVol) {
        loadPage(nextVol.number, 1)
      }
    }
  }, [currentPage, totalPages, currentVolume, volumes, loadPage])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      loadPage(currentVolume, currentPage - 1)
    } else {
      const prevVol = volumes.find(v => v.number === currentVolume - 1)
      if (prevVol) {
        loadPage(prevVol.number, prevVol.page_count)
      }
    }
  }, [currentPage, currentVolume, volumes, loadPage])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextPage()
      if (e.key === 'ArrowLeft') prevPage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextPage, prevPage])

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <select 
          value={currentVolume} 
          onChange={(e) => loadPage(parseInt(e.target.value), 1)}
          style={styles.select}
        >
          {volumes.map(v => (
            <option key={v.id} value={v.number}>Volume {v.number}</option>
          ))}
        </select>
        <button onClick={prevPage} style={styles.button}>Prev</button>
        <span style={styles.pageInfo}>{currentPage} / {totalPages}</span>
        <button onClick={nextPage} style={styles.button}>Next</button>
      </div>
      <div style={styles.imageContainer}>
        {loading && <span>Loading...</span>}
        <img 
          src={imageUrl} 
          alt="manga page" 
          style={styles.image}
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#1a1a1a',
    color: '#fff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'system-ui, sans-serif',
  },
  controls: {
    padding: '20px',
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  select: {
    padding: '8px 16px',
    fontSize: '16px',
    background: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '4px',
  },
  button: {
    padding: '8px 16px',
    fontSize: '16px',
    background: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pageInfo: {
    minWidth: '80px',
    textAlign: 'center',
  },
  imageContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    width: '100%',
  },
  image: {
    maxWidth: '100%',
    maxHeight: 'calc(100vh - 120px)',
    objectFit: 'contain' as const,
  },
}

export default App
