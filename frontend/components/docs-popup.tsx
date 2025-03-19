// NOTE: This file was partially generated using AI assistance.
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

export function DocsPopup() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <HelpCircle className="h-5 w-5" />
          <span className="ml-2 hidden md:inline">Documentation</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>How to Use Face Detection & Cropping</DialogTitle>
          <DialogDescription>
            A quick guide to using our image processing tool
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <section>
            <h3 className="font-semibold mb-2">1. Adjust Settings</h3>
            <p className="text-muted-foreground">
              Configure the aspect ratio and zoom level for your face crops:
            </p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground">
              <li>Aspect Ratio: Choose between square, original, or custom ratios</li>
              <li>Zoom: Adjust how tight the crop is around detected faces</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">2. Upload Your Images</h3>
            <p className="text-muted-foreground">
              Drag and drop your images or click to select files. We support JPG, PNG, and WEBP formats.
            </p>
          </section>


          <section>
            <h3 className="font-semibold mb-2">3. Process & Download</h3>
            <p className="text-muted-foreground">
              Your images will be processed automatically. Once complete, you can:
            </p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground">
              <li>Preview individual processed images</li>
              <li>Download all processed images as a ZIP file</li>
              <li>Adjust settings and reprocess if needed</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Credits & Limits</h3>
            <p className="text-muted-foreground">
              Free users can process up to 10 images per day. Need more? Purchase credits or upgrade to a premium account for unlimited processing.
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
} 