import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X } from "lucide-react"

const plans = [
  {
    name: "Free",
    description: "For small projects and personal use",
    price: "$0",
    period: "forever",
    features: [
      { name: "Basic assistant", included: true },
      { name: "1 project", included: true },
      { name: "Limited docs (10MB)", included: true },
      { name: "Community support", included: true },
      { name: "Analytics", included: false },
      { name: "Custom branding", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    description: "For growing teams and businesses",
    price: "$29",
    period: "per month",
    features: [
      { name: "Advanced assistant", included: true },
      { name: "Up to 5 projects", included: true },
      { name: "100MB docs", included: true },
      { name: "Email support", included: true },
      { name: "Analytics", included: true },
      { name: "Custom branding", included: true },
      { name: "Priority support", included: false },
    ],
    cta: "Choose Pro",
    popular: true,
  },
  {
    name: "Premium",
    description: "For large teams and enterprises",
    price: "$99",
    period: "per month",
    features: [
      { name: "Premium assistant", included: true },
      { name: "Unlimited projects", included: true },
      { name: "1GB docs", included: true },
      { name: "Priority support", included: true },
      { name: "Advanced analytics", included: true },
      { name: "Custom branding", included: true },
      { name: "API access", included: true },
    ],
    cta: "Choose Premium",
    popular: false,
  },
]

export default function PlansPage() {
  return (
    <div className="py-12 md:py-20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose the right plan for you</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Whether you're just getting started or building something big, we have a plan that's right for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col ${
                plan.popular ? "border-primary relative shadow-lg shadow-primary/10" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-center">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-primary mr-2 shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mr-2 shrink-0" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground"}>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/signup" className="w-full">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need something custom?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We offer custom plans for large enterprises with specific needs. Contact us to discuss your requirements.
          </p>
          <Link href="#">
            <Button variant="outline">Contact Sales</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
