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
              <SelectItem value="original">Original</SelectItem>
              <SelectItem value="square">Square (1:1)</SelectItem>
              <SelectItem value="2:3">Standard (2:3)</SelectItem>
              <SelectItem value="9:16">Portrait (9:16)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zoom">Zoom Level: {settings.zoom.toFixed(1)}x</Label>
          <Slider
            id="zoom"
            min={0}
            max={1}
            step={0.1}
            value={[settings.zoom]}
            onValueChange={([value]) => onSettingsChange({ ...settings, zoom: value })}
          />
        </div>
      </CardContent>
    </Card>
  )
} 