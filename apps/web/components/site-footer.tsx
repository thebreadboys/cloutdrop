import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/50 mt-auto py-6">
      <div className="container max-w-screen-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>© 2024 Cloutdrop. All rights reserved.</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link 
            href="/privacy" 
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            href="#" 
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  )
} 