"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface ProcessingSettings {
  aspectRatio: string;
  zoom: number;
}

interface ImageProcessingSettingsProps {
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
}

export function ImageProcessingSettings({ settings, onSettingsChange }: ImageProcessingSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Processing Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
          <Select
            value={settings.aspectRatio}
            onValueChange={(value) => onSettingsChange({ ...settings, aspectRatio: value })}
          >
            <SelectTrigger id="aspect-ratio">
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">Square (1:1)</SelectItem>
              <SelectItem value="4:3">Standard (4:3)</SelectItem>
              <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
              <SelectItem value="3:4">Portrait (3:4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zoom">Zoom Level: {settings.zoom.toFixed(1)}x</Label>
          <Slider
            id="zoom"
            min={1}
            max={2}
            step={0.1}
            value={[settings.zoom]}
            onValueChange={([value]) => onSettingsChange({ ...settings, zoom: value })}
          />
        </div>
      </CardContent>
    </Card>
  )
} 