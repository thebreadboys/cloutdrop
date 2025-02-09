"use client"

import { LaunchForm } from "@/components/launch-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function LaunchPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 py-10">
        <LaunchForm />
      </main>
      <SiteFooter />
    </div>
  )
}

