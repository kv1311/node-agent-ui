'use client'

import { useState, useEffect } from 'react'

const greetings = [
  "The threads of your day await weaving.",
  "Another chapter unfolds before you.",
  "Your intentions shape the hours ahead.",
  "The day holds space for your attention.",
  "Time moves; you decide its meaning.",
]

const GREETING_STORAGE_KEY = 'sia_greeting'

export function useGreeting() {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    // Check sessionStorage first
    const cached = sessionStorage.getItem(GREETING_STORAGE_KEY)
    if (cached) {
      setGreeting(cached)
      return
    }

    // Generate and cache new greeting
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
    sessionStorage.setItem(GREETING_STORAGE_KEY, randomGreeting)
    setGreeting(randomGreeting)
  }, [])

  return greeting
}
