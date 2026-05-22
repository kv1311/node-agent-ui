'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  onDismiss: () => void
}

export function Toast({ message, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, 3000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center px-4"
      style={{
        height: '32px',
        backgroundColor: '#1a0a0a',
        borderBottom: '0.5px solid #5a1a1a',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-space), Space Grotesk, sans-serif',
          fontSize: '11px',
          color: '#c97a7a',
        }}
      >
        {message}
      </span>
    </div>
  )
}

interface ToastManagerProps {
  toasts: { id: string; message: string }[]
  onDismiss: (id: string) => void
}

export function ToastManager({ toasts, onDismiss }: ToastManagerProps) {
  if (toasts.length === 0) return null
  
  const latestToast = toasts[toasts.length - 1]
  
  return (
    <Toast
      key={latestToast.id}
      message={latestToast.message}
      onDismiss={() => onDismiss(latestToast.id)}
    />
  )
}
