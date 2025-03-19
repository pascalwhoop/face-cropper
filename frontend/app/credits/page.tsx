"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { NavBar } from "@/components/nav-bar"
import { Check } from "lucide-react"

interface PricingTier {
  name: string
  credits: number
  price: number
  features: string[]
  popular?: boolean
}

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    credits: 100,
    price: 5,
    features: [
      "100 image processing credits",
      "Valid for 30 days",
      "Basic support",
      "Standard processing speed"
    ]
  },
  {
    name: "Professional",
    credits: 500,
    price: 20,
    popular: true,
    features: [
      "500 image processing credits",
      "Valid for 90 days",
      "Priority support",
    ]
  },
  {
    name: "Enterprise",
    credits: 2000,
    price: 60,
    features: [
      "2000 image processing credits",
      "Valid for 365 days",
      "Premium support",
      "API access"
    ]
  }
]

export default function CreditsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 p-4">
        <div className="container mx-auto py-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Purchase Credits</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the credit package that best suits your needs. All packages include our core features with varying amounts of processing credits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier) => (
              <Card key={tier.name} className={tier.popular ? "border-primary" : undefined}>
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground ml-1">one-time</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={tier.popular ? "default" : "outline"} disabled>
                    Purchase Credits
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Coming soon - Credit purchase system is not yet implemented
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 