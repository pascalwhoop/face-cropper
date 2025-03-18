"use client"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ImageProcessingSettings, ProcessingSettings } from "@/components/image-processing-settings"
import { ImageUploadArea } from "@/components/image-upload-area"
import { ImagePreview } from "@/components/image-preview"
import { ProcessedImagesGrid } from "@/components/processed-images-grid"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useCallback } from "react"
import { useImageProcessing } from "@/hooks/use-image-processing"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [files, setFiles] = useState<File[]>([])
  const [settings, setSettings] = useState<ProcessingSettings>({
    aspectRatio: "1:1",
    zoom: 1.0,
  })
  const [processedImages, setProcessedImages] = useState<Array<{ id: string; url: string }>>([])
  const { processImage, isProcessing, error } = useImageProcessing()
  const { toast } = useToast()

  const processImages = useCallback(async (imagesToProcess: File[]) => {
    for (const file of imagesToProcess) {
      try {
        const result = await processImage(file, settings)
        setProcessedImages(prev => [...prev, result])
      } catch (err) {
        toast({
          title: "Processing Failed",
          description: error || "Failed to process image",
          variant: "destructive",
        })
      }
    }
  }, [processImage, settings, error, toast])

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
    processImages(newFiles)
  }, [processImages])

  const handleSettingsChange = useCallback((newSettings: ProcessingSettings) => {
    setSettings(newSettings)
    // Re-process all images with new settings
    processImages(files)
  }, [files, processImages])

  const handleDownloadAll = () => {
    processedImages.forEach(image => {
      const link = document.createElement('a')
      link.href = image.url
      link.download = `processed-${image.id}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  return (
    <main className="min-h-screen p-4">
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
                <ImagePreview files={files} />
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={50}>
          <div className="h-full p-4">
            <div className="mb-4 flex justify-end">
              <Button
                variant="outline"
                onClick={handleDownloadAll}
                disabled={processedImages.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>
            <ProcessedImagesGrid images={processedImages} />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}
