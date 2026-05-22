'use client'

import { useState, useEffect } from 'react'

type CardType = 'tasks' | 'reminders' | 'bills' | 'events' | 'watchlist' | 'memory'

interface Task {
  id: string
  title: string
  due_date: string
  done: boolean
}

interface Reminder {
  id: string
  title: string
  remind_at: string
  done: boolean
}

interface Bill {
  id: string
  title: string
  amount: number
  due_date: string
  paid: boolean
}

interface Event {
  id: string
  title: string
  date: string
  notes: string
}

interface WatchlistItem {
  id: string
  title: string
  type: string
  genre: string
  watched: boolean
}

interface DataCardProps {
  type: CardType
  label: string
}

export function DataCard({ type, label }: DataCardProps) {
  const [data, setData] = useState<unknown[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`process.env.NEXT_PUBLIC_API_URL/api/${type}`)
        const result = await response.json()
        setData(Array.isArray(result) ? result : [])
      } catch {
        setData([])
      } finally {
        setLoading(false)
      }
    }

    if (type !== 'memory') {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [type])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          <div className="h-4 w-3/4 skeleton" style={{ borderRadius: '4px' }} />
          <div className="h-4 w-1/2 skeleton" style={{ borderRadius: '4px' }} />
        </div>
      )
    }

    if (type === 'memory') {
      return (
        <p 
          className="text-sm"
          style={{ 
            fontFamily: 'Courier New, Courier, monospace',
            color: '#6b8f72'
          }}
        >
          Memory features coming soon...
        </p>
      )
    }

    if (data.length === 0) {
      return (
        <p 
          className="text-sm"
          style={{ 
            fontFamily: 'Courier New, Courier, monospace',
            color: '#6b8f72'
          }}
        >
          No {type} yet
        </p>
      )
    }

    switch (type) {
      case 'tasks':
        return (data as Task[]).slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center justify-between py-1">
            <span 
              className="text-sm truncate flex-1"
              style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                color: item.done ? '#6b8f72' : '#ede8df',
                textDecoration: item.done ? 'line-through' : 'none'
              }}
            >
              {item.title}
            </span>
            <span 
              className="text-xs ml-2"
              style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                color: '#6b8f72'
              }}
            >
              {item.due_date}
            </span>
          </div>
        ))

      case 'reminders':
        return (data as Reminder[]).slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center justify-between py-1">
            <span 
              className="text-sm truncate flex-1"
              style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                color: item.done ? '#6b8f72' : '#ede8df',
                textDecoration: item.done ? 'line-through' : 'none'
              }}
            >
              {item.title}
            </span>
            <span 
              className="text-xs ml-2"
              style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                color: '#6b8f72'
              }}
            >
              {item.remind_at}
            </span>
          </div>
        ))

      case 'bills':
        return (data as Bill[]).slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center justify-between py-1">
            <span 
              className="text-sm truncate flex-1"
              style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                color: item.paid ? '#6b8f72' : '#ede8df',
                textDecoration: item.paid ? 'line-through' : 'none'
              }}
            >
              {item.title}
            </span>
            <span 
              className="text-xs ml-2"
              style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                color: '#c9b99a'
              }}
            >
              ${item.amount}
            </span>
          </div>
        ))

      case 'events':
        return (data as Event[]).slice(0, 3).map((item) => (
          <div key={item.id} className="py-1">
            <div className="flex items-center justify-between">
              <span 
                className="text-sm truncate flex-1"
                style={{ 
                  fontFamily: 'Courier New, Courier, monospace',
                  color: '#ede8df'
                }}
              >
                {item.title}
              </span>
              <span 
                className="text-xs ml-2"
                style={{ 
                  fontFamily: 'Courier New, Courier, monospace',
                  color: '#6b8f72'
                }}
              >
                {item.date}
              </span>
            </div>
          </div>
        ))

      case 'watchlist':
        return (data as WatchlistItem[]).slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center justify-between py-1">
            <span 
              className="text-sm truncate flex-1"
              style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                color: item.watched ? '#6b8f72' : '#ede8df',
                textDecoration: item.watched ? 'line-through' : 'none'
              }}
            >
              {item.title}
            </span>
            <span 
              className="text-xs ml-2 uppercase"
              style={{ 
                fontFamily: 'Courier New, Courier, monospace',
                color: '#6b8f72'
              }}
            >
              {item.type}
            </span>
          </div>
        ))

      default:
        return null
    }
  }

  return (
    <div 
      className="p-4"
      style={{ 
        backgroundColor: '#0d1a10',
        border: '1px solid #1a2e1d',
        borderRadius: '10px'
      }}
    >
      <h3
        className="text-xs uppercase tracking-widest mb-3"
        style={{ 
          fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
          color: '#c9b99a',
          letterSpacing: '0.15em'
        }}
      >
        {label}
      </h3>
      <div>
        {renderContent()}
      </div>
    </div>
  )
}
