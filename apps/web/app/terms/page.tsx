import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="container py-12 md:py-24">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Terms of Service
            </h1>
            
            <div className="prose prose-blue max-w-none">
              <p className="text-lg text-muted-foreground">
                Last updated: January 2025
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Cloutdrop, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Service Description</h2>
              <p>
                Cloutdrop provides a platform for managing and distributing token airdrops on the Solana blockchain. Users can create, manage, and track token distributions to targeted audiences.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate information when using our services</li>
                <li>You are responsible for maintaining the security of your wallet and credentials</li>
                <li>You agree not to use the service for any illegal or unauthorized purpose</li>
                <li>You must comply with all applicable laws and regulations</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Limitations of Liability</h2>
              <p>
                Cloutdrop is provided "as is" without any warranties. We are not responsible for any losses or damages that may occur through the use of our service.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the platform after any changes constitutes acceptance of the new terms.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Contact</h2>
              <p>
                For any questions regarding these terms, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
} 