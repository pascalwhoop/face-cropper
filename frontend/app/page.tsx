"use client"

import { ImageProcessingSettings, ProcessingSettings } from "@/components/image-processing-settings"
import { ImageUploadArea } from "@/components/image-upload-area"
import { ImagePreview } from "@/components/image-preview"
import { ProcessedImagesGrid } from "@/components/processed-images-grid"
import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { useImageProcessing } from "@/hooks/use-image-processing"
import { toast } from "sonner"
import { NavBar } from "@/components/nav-bar"
import JSZip from 'jszip'

interface ProcessedImage {
  id: string;
  url: string;
  file: File;
}

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [settings, setSettings] = useState<ProcessingSettings>({
    aspectRatio: "original",
    zoom: 0.2,
  })
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const [isDownloading, setIsDownloading] = useState(false)
  const processedUrlsRef = useRef<Set<string>>(new Set())
  
  const { processImage, isProcessing } = useImageProcessing({
    aspectRatio: settings.aspectRatio,
    zoom: settings.zoom.toString(),
  })

  // Memoize files to prevent unnecessary re-renders of ImagePreview
  const memoizedFiles = useMemo(() => files, [files])

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    const currentUrls = processedUrlsRef.current
    return () => {
      currentUrls.forEach(url => {
        URL.revokeObjectURL(url)
      })
    }
  }, [])

  const processImages = useCallback(async (imagesToProcess: File[]) => {
    try {
      // Create an array of promises but don't wait for all to complete
      const processingPromises = imagesToProcess.map(async (file) => {
        try {
          const result = await processImage(file)
          const url = URL.createObjectURL(result)
          processedUrlsRef.current.add(url)
          const processedImage = {
            id: crypto.randomUUID(),
            url,
            file
          }
          // Update state immediately for each successful processing
          setProcessedImages(prev => [...prev, processedImage])
          return { status: 'success' as const }
        } catch (err) {
          console.error('Failed to process image:', file.name, err)
          return { status: 'error' as const, file }
        }
      })

      // Still track all promises to show final error count
      const results = await Promise.allSettled(processingPromises)
      const failures = results
        .filter((result): result is PromiseFulfilledResult<{ status: 'error', file: File }> => 
          result.status === 'fulfilled' && result.value.status === 'error'
        )
      
      if (failures.length > 0) {
        toast.error(`Failed to process ${failures.length} ${failures.length === 1 ? 'image' : 'images'}`)
      }
    } catch (err) {
      toast.error("Failed to process images")
      console.error('Failed to process images:', err)
    }
  }, [processImage])

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
    processImages(newFiles)
  }, [processImages])

  const handleSettingsChange = useCallback((newSettings: ProcessingSettings) => {
    setSettings(newSettings)
    // Clean up old URLs before reprocessing
    processedUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url)
    })
    processedUrlsRef.current.clear()
    setProcessedImages([])
    // Re-process all images with new settings
    processImages(files)
  }, [files, processImages])

  const handleDownloadAll = async () => {
    try {
      setIsDownloading(true)
      const zip = new JSZip()

      // Create an array of promises for fetching all images
      const downloadPromises = processedImages.map(async (image, index) => {
        try {
          const response = await fetch(image.url)
          const blob = await response.blob()
          zip.file(`processed-${image.file.name}`, blob)
        } catch (error) {
          console.error(`Failed to add image ${index + 1} to zip:`, error)
          throw error
        }
      })

      // Wait for all images to be added to the zip
      await Promise.all(downloadPromises)

      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" })
      
      // Create download link
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = 'processed-images.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Images downloaded successfully")
    } catch (error) {
      console.error('Error creating zip:', error)
      toast.error("Failed to download images")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-4">
        <div className="container mx-auto">
          {/* Main content area with responsive layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left column - Settings, Upload, and Preview */}
            <div className="space-y-4">
              <div className="bg-card rounded-lg p-4">
                <ImageProcessingSettings
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                />
              </div>
              
              <div className="bg-card rounded-lg p-4">
                <ImageUploadArea 
                  onFilesSelected={handleFilesSelected}
                  isProcessing={isProcessing}
                />
              </div>
              
              <div className="bg-card rounded-lg p-4">
                <ImagePreview files={memoizedFiles} />
              </div>
            </div>

            {/* Right column - Processed Images */}
            <div className="bg-card rounded-lg p-4">
              <ProcessedImagesGrid 
                images={processedImages}
                onDownloadAll={handleDownloadAll}
                isDownloading={isDownloading}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
