"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Image from "next/image"


export function ProcessedImagesGrid({ images = [] }: { images: any[] }) {
  const handleDownload = async (image: any) => {
    try {
      const response = await fetch(image.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `processed-${image.id}.jpg`
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
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          Processed images will appear here
        </p>
      </div>
    )
  }
  // convert images coming in as blobs to urls
  // const imagesProcessed = images.map((image) => ({
  //   url: URL.createObjectURL(image),
  //   id: crypto.randomUUID()
  // }))

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] w-full rounded-md border">
      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={image.url}
              alt={`Processed ${image.id}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => handleDownload(image)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 