"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"

interface ImagePreviewProps {
  files?: File[]
}

export function ImagePreview({ files = [] }: ImagePreviewProps) {
  if (files.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Original Images</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {files.map((file, index) => (
              <div key={index} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 