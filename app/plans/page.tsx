import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Free",
    description: "Get started with the basics",
    price: "$0",
    period: "forever",
    features: [
      { name: "1 Assistant Bot", included: true },
      { name: "5 MB Document Storage", included: true },
      { name: "500 Requests / month", included: true },
      { name: "Community support", included: true },
      { name: "Basic Analytics", included: false },
      { name: "Custom Branding", included: false },
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Pro",
    description: "For growing projects and teams",
    price: "$9",
    period: "per month",
    features: [
      { name: "Up to 5 Assistant Bots", included: true },
      { name: "50 MB Document Storage", included: true },
      { name: "5,000 Requests / month", included: true },
      { name: "Email support", included: true },
      { name: "Standard Analytics", included: true },
      { name: "Custom Branding", included: true },
    ],
    cta: "Choose Pro",
    popular: false,
  },
  {
    name: "Premium",
    description: "For larger teams needing more power",
    price: "$29",
    period: "per month",
    features: [
      { name: "Up to 20 Assistant Bots", included: true },
      { name: "250 MB Document Storage", included: true },
      { name: "25,000 Requests / month", included: true },
      { name: "Priority support", included: true },
      { name: "Advanced Analytics", included: true },
      { name: "Custom Branding", included: true },
      { name: "API Access (soon)", included: true },
    ],
    cta: "Choose Premium",
    popular: false,
  },
];

export default function PlansPage() {
  return (
    <div className="py-8 md:py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Choose the right plan for you
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Start for free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col h-full ${
                plan.popular
                  ? "border-primary relative shadow-lg shadow-primary/10"
                  : "border-border"
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
                  <span className="text-muted-foreground ml-2">
                    {plan.period}
                  </span>
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
                      <span
                        className={
                          feature.included ? "" : "text-muted-foreground"
                        }
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.name === "Free" ? (
                  <Link href="/signup" className="w-full">
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled
                  >
                    <Sparkles className="mr-2 h-4 w-4 opacity-70" />
                    Coming Soon
                    <Sparkles className="mr-2 h-4 w-4 opacity-70" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Need something custom?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We offer custom plans for large enterprises with specific needs.
            Contact us to discuss your requirements.
          </p>
          <Link href="#">
            <Button variant="outline">Contact Sales</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
