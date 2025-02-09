import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/public/logo.svg"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-6 w-6 shadow-md hover:shadow-lg transition-shadow duration-300" style={{ filter: 'drop-shadow(0 0 5px rgba(59,130,246,0.7))' }} />
          <span className="font-bold">Cloutdrop</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground">
            Features
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
  )
} 