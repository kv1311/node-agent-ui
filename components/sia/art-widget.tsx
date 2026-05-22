'use client'

import { useState, useEffect } from 'react'

interface ArtworkInfo {
  title: string
  artist: string
  date: string
  culture: string
  period: string
}

interface ArtWidgetProps {
  onKnowMore: () => void
  onArtworkLoad: (info: ArtworkInfo) => void
}

export function ArtWidget({ onKnowMore, onArtworkLoad }: ArtWidgetProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [artwork, setArtwork] = useState<ArtworkInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchArtwork() {
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
    }

    fetchArtwork()
  }, [onArtworkLoad])

  if (loading) {
    return (
      <div 
        className="mt-4 w-full h-48 skeleton"
        style={{ borderRadius: '10px' }}
      />
    )
  }

  if (error || !imageUrl) {
    return (
      <div 
        className="mt-4 w-full h-48 flex items-center justify-center"
        style={{ 
          backgroundColor: '#0d1a10',
          border: '1px solid #1a2e1d',
          borderRadius: '10px'
        }}
      >
        <p 
          className="text-sm"
          style={{ color: '#6b8f72' }}
        >
          Art unavailable
        </p>
      </div>
    )
  }

  return (
    <div 
      className="mt-4 w-full h-48 relative overflow-hidden"
      style={{ borderRadius: '10px' }}
    >
      <img
        src={imageUrl}
        alt={artwork?.title || 'Artwork'}
        className="w-full h-full object-cover"
      />
      <div 
        className="absolute inset-0"
        style={{ 
          background: 'linear-gradient(to top, rgba(8, 15, 9, 0.9) 0%, rgba(8, 15, 9, 0.3) 50%, transparent 100%)'
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3
          className="text-base font-medium truncate"
          style={{ 
            fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
            color: '#c9b99a'
          }}
        >
          {artwork?.title}
        </h3>
        <p
          className="text-sm truncate mt-0.5"
          style={{ 
            fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
            color: '#6b8f72'
          }}
        >
          {artwork?.artist}
        </p>
        <button
          onClick={onKnowMore}
          className="mt-2 text-xs uppercase tracking-wider flex items-center gap-1 transition-opacity hover:opacity-80"
          style={{ 
            fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
            color: '#c9b99a'
          }}
        >
          Know More <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
