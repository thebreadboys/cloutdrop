import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { RocketIcon, UsersIcon, ShieldIcon, BarChartIcon, GlobeIcon, TrophyIcon } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  const team = [
    { name: "Joey", role: "buidler", initials: "JR", link: "https://ori.ox.ac.uk/people/joseph-rowell/" },
    { name: "Henry", role: "buidler", initials: "HG", link: "https://www.linkedin.com/in/hjegeorge/" },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container py-12 md:py-24">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              About Cloutdrop
            </h1>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-lg text-muted-foreground">
                Cloutdrop is revolutionizing the way crypto projects connect with their ideal audience through targeted airdrops on Solana.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Our Mission</h2>
              <p>
                We believe in the power of community-driven growth in the crypto space. Our mission is to help promising projects find their perfect audience while ensuring token distributions reach the most engaged and relevant community members.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Why Cloutdrop?</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Smart targeting based on on-chain analytics and social engagement</li>
                <li>Efficient token distribution with minimal waste</li>
                <li>Real-time tracking and analytics</li>
                <li>Support for Solana SPL tokens</li>
                <li>Integration with major Solana wallets</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">Our Technology</h2>
              <p>
                Built on Solana's high-performance blockchain, Cloutdrop leverages advanced analytics and machine learning to identify the most relevant recipients for your token airdrops. Our platform ensures secure, efficient, and targeted distribution of tokens to maximize the impact of your launch.
              </p>
            </div>
          </div>
        </div>

        {/* Problem Section */}
        <div className="bg-blue-500/10 py-12 md:py-24">
          <div className="container max-w-4xl space-y-8">
            <div className="flex items-center gap-4">
              <ShieldIcon className="h-12 w-12 text-blue-500" />
              <h2 className="text-3xl font-bold">The Airdrop Dilemma</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-red-500/20 bg-red-500/5">
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-red-500 font-semibold">Current State</h3>
                  <p className="text-muted-foreground">
                    ❌ Spray-and-pray distribution<br />
                    ❌ Low-quality participants<br />
                    ❌ No community building<br />
                    ❌ Wasted resources
                  </p>
                </CardContent>
              </Card>
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-green-500 font-semibold">Cloutdrop Solution</h3>
                  <p>
                    ✅ Targeted influencer outreach<br />
                    ✅ Whale reputation scoring<br />
                    ✅ Community builder incentives<br />
                    ✅ Performance analytics
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Data Section */}
        <div className="container py-12 md:py-24">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="flex items-center gap-4">
              <BarChartIcon className="h-12 w-12 text-blue-500" />
              <h2 className="text-3xl font-bold">Smart Distribution Engine</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: GlobeIcon, title: "200K+", description: "KOLs tracked across platforms" },
                { icon: UsersIcon, title: "85%", description: "Higher retention rate" },
                { icon: TrophyIcon, title: "4.8x", description: "More engagement per dollar" },
                { icon: RocketIcon, title: "5mins", description: "Average campaign setup time" },
              ].map((item, i) => (
                <div key={i} className="text-center space-y-2">
                  <item.icon className="h-8 w-8 text-blue-500 mx-auto" />
                  <p className="text-2xl font-bold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-blue-500/10 py-12 md:py-24">
          <div className="container max-w-4xl space-y-8">
            <h2 className="text-3xl font-bold text-center">The Cloutdrop Team</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              A passionate group of buidlers who experienced firsthand the inefficiencies of traditional airdrops
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {team.map((member) => (
                <Card key={member.initials} className="border-blue-500/20 group transition-all hover:border-blue-500/40 hover:shadow-lg">
                  <a
                    href={member.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block hover:no-underline"
                  >
                    <CardContent className="p-12 space-y-8 transition-colors group-hover:bg-blue-500/5">
                      <div className="h-16 w-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 text-xl font-bold mx-auto transition-colors group-hover:bg-blue-500/20">
                        {member.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-center group-hover:text-blue-500 transition-colors">
                          {member.name}
                        </p>
                        <p className="text-sm text-muted-foreground text-center group-hover:text-blue-400 transition-colors">
                          {member.role}
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Visit profile →
                        </span>
                      </div>
                    </CardContent>
                  </a>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container py-12 md:py-24">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready for Quality Growth?</h2>
            <p className="text-muted-foreground">
              Stop wasting resources on empty wallets. Target real community builders.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link href="/launch">
                <RocketIcon className="h-4 w-4" />
                Launch Smart Airdrop
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
} 