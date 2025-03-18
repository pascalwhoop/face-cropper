"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ImageProcessingSettings, ProcessingSettings } from "@/components/image-processing-settings"
import { ImageUploadArea } from "@/components/image-upload-area"
import { ImagePreview } from "@/components/image-preview"
import { ProcessedImagesGrid } from "@/components/processed-images-grid"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { useImageProcessing } from "@/hooks/use-image-processing"
import { toast } from "sonner"
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
    return () => {
      processedUrlsRef.current.forEach(url => {
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
    <main className="min-h-screen p-4">
      <div>
            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                onClick={handleDownloadAll}
                disabled={processedImages.length === 0 || isProcessing || isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? "Creating ZIP..." : "Download All"}
              </Button>
            </div>
      </div>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={50}>
          <div className="h-full flex flex-col gap-4 p-4">
            <ScrollArea className="flex-1">
              <div className="space-y-8">
                <ImageProcessingSettings
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                />
                <ImageUploadArea 
                  onFilesSelected={handleFilesSelected}
                  isProcessing={isProcessing}
                />
                <ImagePreview files={memoizedFiles} />
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={50}>
          <div className="h-full p-4">
            <ProcessedImagesGrid images={processedImages} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}
