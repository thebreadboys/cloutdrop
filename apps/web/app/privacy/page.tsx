import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      
      <div className="container max-w-4xl py-10 space-y-6 flex-1">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-muted-foreground">Effective Date: {new Date().toLocaleDateString()}</p>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information you provide when creating an airdrop campaign, including:
            wallet addresses, token distribution details, and transaction information. 
            This data is stored securely in our Supabase database.
          </p>

          <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          <p className="text-muted-foreground">
            Your information is used solely to execute and track airdrop campaigns. 
            We do not sell or share your data with third parties except as necessary 
            to provide the service (e.g., blockchain network operations).
          </p>

          <h2 className="text-xl font-semibold">Data Security</h2>
          <p className="text-muted-foreground">
            We implement industry-standard security measures including encryption 
            and access controls. However, no digital system can be completely secure - 
            we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold">Your Rights</h2>
          <p className="text-muted-foreground">
            You may request access to or deletion of your personal data by contacting 
            us at privacy@cloutdrop.com. Note that blockchain transaction data cannot 
            be altered or deleted due to the immutable nature of distributed ledgers.
          </p>

          <h2 className="text-xl font-semibold">Changes to This Policy</h2>
          <p className="text-muted-foreground">
            We may update this policy periodically. The latest version will always be 
            posted here. Continued use of our service constitutes acceptance of the 
            updated policy.
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
} 