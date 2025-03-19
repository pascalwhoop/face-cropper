// NOTE: This file was partially generated using AI assistance.
import { Button } from "@/components/ui/button"
import { DocsPopup } from "@/components/docs-popup"
import { CreditsCounter } from "@/components/credits-counter"
import { ThemeToggle } from "@/components/theme-toggle"
import { CreditCard, LogIn } from "lucide-react"
import Link from "next/link"

export function NavBar() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">FC</span>
            </div>
            <span className="font-semibold text-xl hidden sm:inline-block">
              Face Cropper
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-4">
          <CreditsCounter />
          <DocsPopup />
          
          <Button variant="ghost" size="sm" asChild>
            <Link href="/credits">
              <CreditCard className="h-5 w-5" />
              <span className="ml-2 hidden md:inline">Buy Credits</span>
            </Link>
          </Button>

          <Button variant="default" size="sm" asChild>
            <Link href="/login">
              <LogIn className="h-5 w-5" />
              <span className="ml-2 hidden md:inline">Sign In</span>
            </Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
} 