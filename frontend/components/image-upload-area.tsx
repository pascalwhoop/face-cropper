"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2 } from "lucide-react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface ImageUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing?: boolean;
}

export function ImageUploadArea({ onFilesSelected, isProcessing = false }: ImageUploadAreaProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles)
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    disabled: isProcessing
  })

  return (
    <Card>
      <CardContent className="pt-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {isProcessing ? (
            <Loader2 className="mx-auto h-12 w-12 text-muted-foreground/50 animate-spin" />
          ) : (
            <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {isProcessing ? (
              "Processing images..."
            ) : isDragActive ? (
              "Drop your images here..."
            ) : (
              "Drag & drop images here, or click to select"
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/75">
            Supports: JPG, PNG, WebP
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 