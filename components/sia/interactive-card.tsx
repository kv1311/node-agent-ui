'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type CardType = 'tasks' | 'reminders' | 'bills' | 'events' | 'watchlist' | 'memory'

interface BaseItem {
  id: string
  title: string
}

interface Task extends BaseItem {
  due_date: string
  done: boolean
}

interface Reminder extends BaseItem {
  remind_at: string
  done: boolean
}

interface Bill extends BaseItem {
  amount: number
  due_date: string
  paid: boolean
}

interface Event extends BaseItem {
  date: string
  notes: string
}

interface WatchlistItem extends BaseItem {
  type: string
  genre: string
  watched: boolean
}

type DataItem = Task | Reminder | Bill | Event | WatchlistItem

interface InteractiveCardProps {
  type: CardType
  label: string
  onError: (message: string) => void
  isExpanded?: boolean
}

const emptyStates: Record<CardType, string> = {
  tasks: 'Nothing pending. Rare.',
  reminders: 'Clear for now.',
  bills: 'All settled.',
  events: 'Nothing on the horizon.',
  watchlist: 'Queue is empty.',
  memory: 'Memories form in time.',
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function SkeletonRow() {
  return (
    <div className="py-2">
      <div className="h-4 w-3/4 rounded skeleton" />
    </div>
  )
}

interface CheckboxProps {
  checked: boolean
  onChange: () => void
}

function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      onClick={onChange}
      className="relative flex items-center justify-center"
      style={{
        width: '14px',
        height: '14px',
        minWidth: '14px',
        backgroundColor: checked ? '#2d5a34' : '#080f09',
        border: '0.5px solid #1a2e1d',
        borderRadius: '2px',
      }}
      aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
    >
      <span
        className="absolute inset-0"
        style={{
          width: '36px',
          height: '36px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#c9b99a" strokeWidth="1.5">
          <path d="M2 5 L4 7 L8 3" />
        </svg>
      )}
    </button>
  )
}

interface EditableTextProps {
  value: string
  onSave: (newValue: string) => void
  completed: boolean
  style?: React.CSSProperties
}

function EditableText({ value, onSave, completed, style }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    } else {
      setEditValue(value)
    }
    setIsEditing(false)
  }, [editValue, value, onSave])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    else if (e.key === 'Escape') {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="bg-transparent outline-none text-sm truncate flex-1"
        style={{
          fontFamily: 'Courier New, Courier, monospace',
          color: '#ede8df',
          border: 'none',
          padding: 0,
          margin: 0,
          ...style,
        }}
      />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="text-sm truncate flex-1 cursor-text"
      style={{
        fontFamily: 'Courier New, Courier, monospace',
        color: completed ? '#6b8f72' : '#ede8df',
        textDecoration: completed ? 'line-through' : 'none',
        ...style,
      }}
    >
      {value}
    </span>
  )
}

export function InteractiveCard({ type, label, onError, isExpanded = false }: InteractiveCardProps) {
  const [data, setData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addingNew, setAddingNew] = useState(false)
  const [newItemText, setNewItemText] = useState('')
  const newItemRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (addingNew && newItemRef.current) {
      newItemRef.current.focus()
    }
  }, [addingNew])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_URL}/api/${type}`)
        if (!response.ok) throw new Error('Failed to fetch')
        const result: DataItem[] = await response.json()
        setData(Array.isArray(result) ? result : [])
      } catch {
        onError('Could not reach server. Check connection.')
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
  }, [type, onError])

  const toggleComplete = useCallback(async (id: string, currentState: boolean) => {
    const fieldName = type === 'bills' ? 'paid' : type === 'watchlist' ? 'watched' : 'done'

    setData(prev =>
      prev.map(item => (item.id === id ? { ...item, [fieldName]: !currentState } : item))
    )

    try {
      const response = await fetch(`${API_URL}/api/${type}/${id}`, {
        method: 'PATCH',
       headers: {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
},
        body: JSON.stringify({ [fieldName]: !currentState }),
      })
      if (!response.ok) throw new Error('Failed to update')
    } catch {
      setData(prev =>
        prev.map(item => (item.id === id ? { ...item, [fieldName]: currentState } : item))
      )
      onError('Could not save changes. Please try again.')
    }
  }, [type, onError])

  const updateTitle = useCallback(async (id: string, newTitle: string) => {
    const originalItem = data.find(item => item.id === id)
    if (!originalItem) return

    setData(prev =>
      prev.map(item => (item.id === id ? { ...item, title: newTitle } : item))
    )

    try {
      const response = await fetch(`${API_URL}/api/${type}/${id}`, {
        method: 'PATCH',
       headers: {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
},
        body: JSON.stringify({ title: newTitle }),
      })
      if (!response.ok) throw new Error('Failed to update')
    } catch {
      setData(prev =>
        prev.map(item => (item.id === id ? { ...item, title: originalItem.title } : item))
      )
      onError('Could not save changes. Please try again.')
    }
  }, [type, data, onError])

  const addNewItem = useCallback(async () => {
    const trimmed = newItemText.trim()
    if (!trimmed) {
      setAddingNew(false)
      return
    }

    const body: Record<string, string> = { title: trimmed }
    if (type === 'tasks') body.due_date = ''
    if (type === 'reminders') body.remind_at = ''
    if (type === 'bills') body.amount = '0'
    if (type === 'events') body.date = ''
    if (type === 'watchlist') { body.type = 'movie'; body.genre = '' }

    try {
      const response = await fetch(`${API_URL}/api/${type}`, {
        method: 'POST',
       headers: {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
},
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error('Failed to add')
      const created: DataItem = await response.json()
      setData(prev => [...prev, created])
    } catch {
      onError('Could not add item. Please try again.')
    } finally {
      setNewItemText('')
      setAddingNew(false)
    }
  }, [newItemText, type, onError])

  const isItemCompleted = (item: DataItem): boolean => {
    if ('done' in item) return item.done
    if ('paid' in item) return item.paid
    if ('watched' in item) return item.watched
    return false
  }

  const getSecondaryText = (item: DataItem): string => {
    if ('due_date' in item && type === 'tasks') return (item as Task).due_date
    if ('remind_at' in item) return (item as Reminder).remind_at
    if ('amount' in item) return `₹${(item as Bill).amount}`
    if ('date' in item) return (item as Event).date
    if ('type' in item) return (item as WatchlistItem).type.toUpperCase()
    return ''
  }

  const renderContent = () => {
    if (loading) {
      return <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
    }

    if (type === 'memory') {
      return (
        <p
          className="text-sm italic"
          style={{
            fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
            color: '#6b8f7299',
          }}
        >
          {emptyStates.memory}
        </p>
      )
    }

    const displayData = isExpanded ? data : data.slice(0, 3)
    const hasCheckbox = ['tasks', 'reminders', 'bills', 'watchlist'].includes(type)

    return (
      <>
        {data.length === 0 && !addingNew && (
          <p
            className="text-sm italic mb-2"
            style={{
              fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
              color: '#6b8f7299',
            }}
          >
            {emptyStates[type]}
          </p>
        )}
        {displayData.map((item) => {
          const completed = isItemCompleted(item)
          const secondary = getSecondaryText(item)
          return (
            <div key={item.id} className="flex items-center gap-3 py-1.5">
              {hasCheckbox && (
                <Checkbox
                  checked={completed}
                  onChange={() => toggleComplete(item.id, completed)}
                />
              )}
              <EditableText
                value={item.title}
                onSave={(newTitle) => updateTitle(item.id, newTitle)}
                completed={completed}
              />
              {secondary && (
                <span
                  className="text-xs ml-auto"
                  style={{
                    fontFamily: 'Courier New, Courier, monospace',
                    color: type === 'bills' ? '#c9b99a' : '#6b8f72',
                  }}
                >
                  {secondary}
                </span>
              )}
            </div>
          )
        })}
        {addingNew && (
          <div className="flex items-center gap-2 py-1.5">
            <input
              ref={newItemRef}
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              onBlur={addNewItem}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addNewItem()
                if (e.key === 'Escape') { setAddingNew(false); setNewItemText('') }
              }}
              placeholder={`New ${type.slice(0, -1)}...`}
              className="bg-transparent outline-none text-sm flex-1"
              style={{
                fontFamily: 'Courier New, Courier, monospace',
                color: '#ede8df',
                border: 'none',
                borderBottom: '0.5px solid #1a2e1d',
                padding: '2px 0',
              }}
            />
          </div>
        )}
      </>
    )
  }

  return (
    <div
      className="p-4"
      style={{
        backgroundColor: '#0d1a10',
        border: '0.5px solid #1a2e1d',
        borderRadius: '10px',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-xs uppercase tracking-widest"
          style={{
            fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
            color: '#6b8f72',
            letterSpacing: '0.1em',
            fontVariant: 'small-caps',
          }}
        >
          {label}
        </h3>
        {type !== 'memory' && (
          <button
            onClick={() => setAddingNew(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b8f72',
              fontSize: '18px',
              lineHeight: 1,
              padding: '0 2px',
            }}
            aria-label={`Add ${type}`}
          >
            +
          </button>
        )}
      </div>
      <div>{renderContent()}</div>
      {!loading && !isExpanded && data.length > 3 && (
        <p
          className="text-xs mt-2"
          style={{ fontFamily: 'Courier New, Courier, monospace', color: '#6b8f72' }}
        >
          +{data.length - 3} more
        </p>
      )}
    </div>
  )
}