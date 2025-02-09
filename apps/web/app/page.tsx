import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRightIcon, WalletIcon, TargetIcon, CoinsIcon, RocketIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Logo from "@/public/logo.svg"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container py-12 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Launch Your Coin to the Right Audience
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Targeted airdrops for Solana influencers, communities, and whales
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/launch">
                <Button className="gap-2 px-8 py-6 text-lg">
                  <RocketIcon className="h-5 w-5" />
                  Launch Airdrop
                </Button>
              </Link>
              <Button variant="outline" className="gap-2 px-8 py-6 text-lg">
                <ChevronRightIcon className="h-5 w-5" />
                Learn More
              </Button>
            </div>
          </div>
        </div>

        <div className="container py-12 md:py-24">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
            Why Choose Cloutdrop?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: TargetIcon,
                title: "Targeted Reach",
                description: "Connect with relevant KOLs and reach the right audience for your project.",
              },
              {
                icon: CoinsIcon,
                title: "Data-Driven Insights",
                description: "Optimize your airdrop strategy with comprehensive analytics and metrics.",
              },
              {
                icon: RocketIcon,
                title: "Community Growth",
                description: "Boost engagement and build a thriving community around your project.",
              },
              {
                icon: WalletIcon,
                title: "Seamless Integration",
                description: "Easy-to-use platform with WalletConnect and major wallet support.",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="group relative overflow-hidden border-blue-500/20 bg-blue-500/[0.02] transition-colors hover:border-blue-500/40 hover:bg-blue-500/[0.04]"
              >
                <CardContent className="p-6 space-y-2">
                  <item.icon className="h-12 w-12 text-blue-500" />
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="container py-12 md:py-24">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
            How Cloutdrop Works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Connect Wallet",
                description: "Connect your wallet securely with WalletConnect integration.",
              },
              {
                step: "2",
                title: "Select Target Audience",
                description: "Choose your ideal KOLs based on engagement metrics.",
              },
              {
                step: "3",
                title: "Set Airdrop Amount",
                description: "Define your airdrop parameters and token allocation.",
              },
              {
                step: "4",
                title: "Launch Airdrop",
                description: "Execute your airdrop and track its performance.",
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center group">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-primary-foreground text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="mt-4 font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="container py-12 md:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-bold text-3xl leading-[1.1] bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
              Ready to Launch Your Airdrop?
            </h2>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Join the next generation of crypto projects using targeted airdrops to build engaged communities.
            </p>
            <Link href="/launch">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                Launch Airdrop
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

