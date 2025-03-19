"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { useEffect, useRef, memo } from "react"

interface ImagePreviewProps {
  files?: File[]
}

export const ImagePreview = memo(function ImagePreview({ files = [] }: ImagePreviewProps) {
  const urlsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    return () => {
      // Cleanup URLs when component unmounts
      urlsRef.current.forEach(url => {
        URL.revokeObjectURL(url)
      })
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Original Images</CardTitle>
      </CardHeader>
      {files.length === 0 && (
        <CardContent>
          <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              Image previews will appear here
            </p>
          </div>
        </CardContent>
      )}

      {files.length > 0 && (
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {files.map((file) => {
              const objectUrl = URL.createObjectURL(file)
              urlsRef.current.add(objectUrl)
              
              return (
                <div 
                  key={`${file.name}-${file.lastModified}`} 
                  className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  <Image
                    src={objectUrl}
                    alt={file.name}
                    fill
                    className="object-cover"
                    onLoad={() => {
                      URL.revokeObjectURL(objectUrl)
                      urlsRef.current.delete(objectUrl)
                    }}
                  />
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
      )}
    </Card>
  )
}) 