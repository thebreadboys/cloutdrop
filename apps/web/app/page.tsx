import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WalletIcon, TargetIcon, CoinsIcon, RocketIcon, ChevronRightIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500" />
            <span className="font-bold">Cloutdrop</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Blog
            </Link>
            <Link href="/launch">
              <Button
                variant="outline"
                className="border-blue-500/20 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
              >
                Launch Airdrop
              </Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="hero-gradient relative overflow-hidden">
          <div className="container relative z-10 space-y-6 py-24 sm:py-32">
            <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
              <h1 className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text font-bold text-4xl text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
                Launch Your Coin to the Right Audience
              </h1>
              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Targeted airdrops to top KOLs on Solana. Drive community engagement and accelerate your project's
                growth.
              </p>
              <div className="flex gap-4">
                <Link href="/launch">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  >
                    Launch Airdrop
                    <ChevronRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-blue-500/20 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-24 space-y-12">
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
        </section>

        <section className="container py-24 space-y-12">
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
        </section>

        <section className="border-t border-border/40 bg-gradient-to-b from-blue-500/[0.02] to-transparent">
          <div className="container py-24 space-y-6">
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
        </section>
      </main>
      <footer className="border-t border-border/40 py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500" />
              <span className="font-bold">Cloutdrop</span>
            </Link>
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built for the Solana ecosystem.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

