// NOTE: This file was partially generated using AI assistance.
import { useState } from 'react'
import { ProcessingSettings } from '@/components/image-processing-settings'
import { processImageApiV1ProcessImagePost } from '@/lib/api/sdk.gen'

interface ProcessedImage {
  id: string
  url: string
}

export function useImageProcessing() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processImage = async (file: File, settings: ProcessingSettings): Promise<ProcessedImage> => {
    setIsProcessing(true)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('aspect_ratio', settings.aspectRatio)
      formData.append('zoom', settings.zoom.toString())

      // Use the generated client to make the request
      const result = await processImageApiV1ProcessImagePost({
        body: {
          file,
          aspect_ratio: settings.aspectRatio,
          zoom: settings.zoom.toString()
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Convert API response to ProcessedImage format
      return {
        id: result.id || crypto.randomUUID(),
        url: result.url
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process image'
      setError(message)
      throw err
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processImage,
    isProcessing,
    error
  }
} 