import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="container max-w-4xl py-10 space-y-8">
      <h1 className="text-3xl font-bold">Airdrop Analytics</h1>
      <p className="text-muted-foreground">Track the progress and impact of your airdrop campaign.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribution Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">78%</p>
            <p className="text-sm text-muted-foreground">Tokens distributed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recipient Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">63%</p>
            <p className="text-sm text-muted-foreground">Active recipients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Social Media Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-sm text-muted-foreground">Mentions across platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Community Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">+15%</p>
            <p className="text-sm text-muted-foreground">Increase in community size</p>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-muted-foreground">More detailed analytics and visualizations coming soon!</p>
    </div>
  )
}

