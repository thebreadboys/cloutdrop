import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SolanaWalletProvider } from "@/components/wallet-provider"
import type React from "react" // Added import for React
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cloutdrop | Targeted Crypto Airdrops",
  description: "Launch your coin to the right audience with targeted airdrops to top KOLs on Solana.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SolanaWalletProvider>{children}</SolanaWalletProvider>
        <Analytics />
      </body>
    </html>
  )
}

