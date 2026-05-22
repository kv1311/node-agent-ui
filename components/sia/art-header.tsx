'use client'

import { useState, useEffect, useCallback } from 'react'

interface ArtworkInfo {
  title: string
  artist: string
  date: string
  culture: string
  period: string
}

interface ArtHeaderProps {
  onKnowMore: () => void
  onArtworkLoad: (info: ArtworkInfo) => void
  greeting: string
}

export function ArtHeader({ onKnowMore, onArtworkLoad, greeting }: ArtHeaderProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [artwork, setArtwork] = useState<ArtworkInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const fetchArtwork = useCallback(async () => {
    try {
      const searchResponse = await fetch(
        'https://collectionapi.metmuseum.org/public/collection/v1/search?q=medieval&isPublicDomain=true'
      )
      const searchData = await searchResponse.json()
      
      if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
        setError(true)
        setLoading(false)
        return
      }

      const randomId = searchData.objectIDs[Math.floor(Math.random() * Math.min(searchData.objectIDs.length, 100))]
      
      const objectResponse = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${randomId}`
      )
      const objectData = await objectResponse.json()

      if (objectData.primaryImage) {
        setImageUrl(objectData.primaryImage)
        const artInfo: ArtworkInfo = {
          title: objectData.title || 'Untitled',
          artist: objectData.artistDisplayName || 'Unknown Artist',
          date: objectData.objectDate || 'Date unknown',
          culture: objectData.culture || 'Unknown culture',
          period: objectData.period || 'Unknown period',
        }
        setArtwork(artInfo)
        onArtworkLoad(artInfo)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [onArtworkLoad])

  useEffect(() => {
    fetchArtwork()
  }, [fetchArtwork])

  return (
    <div 
      className="relative w-full overflow-hidden"
      style={{ height: '200px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image or Fallback */}
      {!loading && !error && imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setError(true)}
          style={{
            opacity: imageLoaded ? (isHovered ? 0.72 : 0.12) : 0,
            filter: isHovered ? 'brightness(0.6)' : 'brightness(0.35)',
            transition: 'opacity 0.5s ease, filter 0.5s ease',
          }}
        />
      )}
      
      {/* Fallback background */}
      {(loading || error || !imageUrl || !imageLoaded) && (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: '#0d1a10' }}
        />
      )}
      
      {/* Bottom gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          background: 'linear-gradient(to top, #080f09cc, transparent)'
        }}
      />

      {/* Content */}
      <div className="relative z-[2] h-full flex flex-col">
        {/* TopBar */}
        <div 
          className="flex items-center justify-between py-3 px-4"
          style={{ borderBottom: '0.5px solid #1a2e1d' }}
        >
          <h1
            className="text-2xl font-semibold"
            style={{ 
              fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
              color: '#c9b99a'
            }}
          >
            Sia
          </h1>
          <div className="flex items-center gap-2">
            <span 
              className="text-xs uppercase tracking-wider"
              style={{ 
                fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
                color: '#6b8f72'
              }}
            >
              Online
            </span>
            <div 
              className="w-2.5 h-2.5 rounded-full status-pulse"
              style={{ backgroundColor: '#6b8f72' }}
            />
          </div>
        </div>

        {/* Greeting */}
        <div className="flex-1 flex items-center px-4">
          <p
            className="text-lg italic"
            style={{ 
              fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
              color: '#c9b99a'
            }}
          >
            {greeting}
          </p>
        </div>

        {/* Artwork info overlay - bottom */}
        {artwork && !error && (
          <>
            <div className="absolute bottom-4 left-4">
              <p
                className="italic truncate max-w-[200px]"
                style={{ 
                  fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
                  fontSize: '16px',
                  color: '#c9b99a'
                }}
              >
                {artwork.title}
              </p>
              <p
                className="truncate max-w-[180px]"
                style={{ 
                  fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
                  fontSize: '11px',
                  color: '#6b8f72'
                }}
              >
                {artwork.artist}
              </p>
            </div>

            <button
              onClick={onKnowMore}
              onMouseEnter={() => setIsHovered(true)}
              className="absolute bottom-4 right-4 pb-0.5"
              style={{ 
                fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
                fontSize: '11px',
                color: '#c9b99a',
                background: 'none',
                border: 'none',
                borderBottom: '0.5px solid #c9b99a',
                cursor: 'pointer',
              }}
            >
              Know More →
            </button>
          </>
        )}
      </div>
    </div>
  )
}
