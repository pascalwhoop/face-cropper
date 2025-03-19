"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import Image from "next/image"
import { memo } from "react"

interface ProcessedImage {
  id: string
  url: string
  file: File
}

interface ProcessedImagesGridProps {
  images: ProcessedImage[]
  onDownloadAll: () => void
  isDownloading: boolean
  isProcessing: boolean
}

const ProcessedImageItem = memo(function ProcessedImageItem({ image, onDownload }: { 
  image: ProcessedImage
  onDownload: (image: ProcessedImage) => void 
}) {
  return (
    <div
      key={image.id}
      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
    >
      <Image
        src={image.url}
        alt={`Processed ${image.file.name}`}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => onDownload(image)}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

export function ProcessedImagesGrid({ images, onDownloadAll, isDownloading, isProcessing }: ProcessedImagesGridProps) {
  const handleDownload = async (image: ProcessedImage) => {
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `processed-${image.file.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Processed Images</h2>
        </div>
        <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
          <p className="text-sm text-muted-foreground">
            Processed images will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Processed Images</h2>
          <p className="text-sm text-muted-foreground">{images.length} images processed</p>
        </div>
        <Button
          variant="outline"
          onClick={onDownloadAll}
          disabled={images.length === 0 || isProcessing || isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isDownloading ? "Creating ZIP..." : "Download All"}
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)] w-full rounded-md border">
        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <ProcessedImageItem
              key={image.id}
              image={image}
              onDownload={handleDownload}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
} 