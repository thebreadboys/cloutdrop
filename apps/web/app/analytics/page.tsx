"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LockIcon, ArrowUpRight, ArrowDownRight, BarChart3, Users, Activity } from "lucide-react"
import dynamic from 'next/dynamic'

// Dynamically import TradingView widget to avoid SSR issues
const TradingViewWidget = dynamic(
  () => import('@/components/trading-view-widget'),
  { ssr: false }
);

const distributionSteps = [
  "Analyzing whale wallets",
  "Verifying community contributors",
  "Securing smart contract allocations",
  "Processing Solana network transactions",
  "Finalizing token distributions",
  "Running anti-sybil checks",
  "Updating blockchain ledger",
];

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [progressWidth, setProgressWidth] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [tokenInfo, setTokenInfo] = useState<{
    contractAddress: string;
    coinName: string;
    coinTicker: string;
  } | null>(null);

  useEffect(() => {
    // Get token info from localStorage (set during launch)
    const savedTokenInfo = localStorage.getItem('tokenInfo');
    if (savedTokenInfo) {
      setTokenInfo(JSON.parse(savedTokenInfo));
    }
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 8000; // 8 seconds
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / duration) * 100, 100);
      setProgressWidth(progress);
      
      if (progress < 100) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setIsLoading(false);
      }
    };

    let animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setCurrentStatus(prev => (prev + 1) % distributionSteps.length);
    }, 3000); // Change status every 3 seconds

    return () => clearInterval(statusInterval);
  }, []);

  const renderOverviewTab = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Token Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">$0.00</span>
              <span className="text-sm text-muted-foreground">USD</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Tracking starts after listing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Holder Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">100%</span>
              <span className="text-sm text-muted-foreground">holding</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">All recipients still holding tokens</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Social Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">0</span>
              <span className="text-sm text-muted-foreground">posts</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Tracking social media mentions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">19</span>
              <span className="text-sm text-muted-foreground">recipients</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Tokens distributed successfully</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token Chart</CardTitle>
          {tokenInfo ? (
            <p className="text-sm text-muted-foreground">Live price data for {tokenInfo.coinName} ({tokenInfo.coinTicker})</p>
          ) : (
            <p className="text-sm text-muted-foreground">Price action will appear after listing</p>
          )}
        </CardHeader>
        <CardContent>
          {tokenInfo ? (
            <div className="h-[500px] w-full bg-background rounded-lg overflow-hidden border">
              <TradingViewWidget 
                contractAddress={tokenInfo.contractAddress}
                symbol={tokenInfo.coinTicker}
              />
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
              <div className="text-center space-y-2">
                <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Chart data will be available after market listing</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Key Trades</CardTitle>
          <p className="text-sm text-muted-foreground">Monitoring tracked wallet activity</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-full">
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <div className="font-medium">Whale Wallet (0x8f3...7a2)</div>
                  <div className="text-sm text-muted-foreground">No trades yet</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-full">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <div className="font-medium">Influencer Wallet (0x1b9...c4d)</div>
                  <div className="text-sm text-muted-foreground">No trades yet</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRecipientsTab = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Airdrop Recipients Overview</CardTitle>
          <p className="text-sm text-muted-foreground">Breakdown of your initial token holders</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Whales</span>
                <span className="text-sm text-muted-foreground">11 recipients</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Combined holdings: $425M+<br />
                Avg. portfolio size: $38.6M<br />
                Active in: 15+ projects
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Influencers</span>
                <span className="text-sm text-muted-foreground">5 recipients</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Combined followers: 2.8M<br />
                Avg. engagement: 5.2%<br />
                Content type: Crypto/NFTs
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Community Builders</span>
                <span className="text-sm text-muted-foreground">3 recipients</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Discord members: 180K+<br />
                Communities: 12 active<br />
                Roles: Mods & Admins
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="font-medium mb-3">Recipient Highlights</h3>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Combined Social Reach</div>
                    <div className="text-sm text-muted-foreground">Potential audience across all platforms</div>
                  </div>
                  <div className="text-xl font-bold">3.5M+</div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Project Experience</div>
                    <div className="text-sm text-muted-foreground">Previous successful launches</div>
                  </div>
                  <div className="text-xl font-bold">25+</div>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Community Size</div>
                    <div className="text-sm text-muted-foreground">Total managed community members</div>
                  </div>
                  <div className="text-xl font-bold">250K+</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Activity</CardTitle>
          <p className="text-sm text-muted-foreground">Tracking movements of airdrop recipients</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No wallet activity detected yet</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Activity</CardTitle>
          <p className="text-sm text-muted-foreground">Monitoring social media engagement</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No social activity detected yet</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="container max-w-4xl py-10 space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Distribution in Progress</h1>
              <p className="text-muted-foreground">Setting up your analytics dashboard</p>
            </div>

            <Card className="relative overflow-hidden">
              <CardContent className="pt-6">
                <Progress 
                  value={progressWidth} 
                  className="transition-all duration-[15000ms] ease-linear"
                />
                <div className="mt-4">
                  <div className="text-lg font-medium">
                    {distributionSteps[currentStatus]}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please wait while we process your distribution
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>What Happens Next</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Continuous Value Tracking</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll monitor your airdrop's performance 24/7, tracking key metrics like token price, 
                      market cap, and trading volume. You'll get insights into how your token is performing 
                      in the market.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Whale Wallet Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Our system tracks large wallet movements and holdings, helping you understand how major 
                      players are interacting with your token. We'll show you when significant trades happen 
                      and identify accumulation patterns.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Community Impact</h3>
                    <p className="text-sm text-muted-foreground">
                      Track how your airdrop affects community growth and engagement. We measure social media 
                      reach, new wallet additions, and overall market sentiment.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <LockIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">Security & Privacy</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your data is protected with enterprise-grade encryption, and all wallet addresses are 
                      anonymized. We use secure channels for all analytics processing and data storage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container max-w-4xl py-10 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Airdrop Analytics</h1>
            <p className="text-muted-foreground">Track your token's performance and community growth</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="recipients">Recipients</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {renderOverviewTab()}
            </TabsContent>

            <TabsContent value="recipients" className="space-y-6">
              {renderRecipientsTab()}
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {renderActivityTab()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

