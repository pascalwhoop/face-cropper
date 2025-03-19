"use client"

import { Badge } from "@/components/ui/badge"
import { Coins } from "lucide-react"
import { useEffect, useState } from "react"

// TODO: Replace with actual API call when backend is ready
const fetchCredits = async (): Promise<number> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  // Return random number between 0 and 100
  return Math.floor(Math.random() * 100)
}

export function CreditsCounter() {
  const [credits, setCredits] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const credits = await fetchCredits()
        setCredits(credits)
      } catch (error) {
        console.error('Failed to load credits:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCredits()
  }, [])

  return (
    <div className="flex items-center gap-2">
      <Badge variant={credits === 0 ? "destructive" : "secondary"} className="h-7 px-3">
        <Coins className="mr-1 h-4 w-4" />
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : (
          <span>{credits} credits</span>
        )}
      </Badge>
    </div>
  )
} 