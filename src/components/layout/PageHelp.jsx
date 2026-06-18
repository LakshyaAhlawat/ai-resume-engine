"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Info, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getFeatureGuide } from "@/lib/featureGuide"

export function PageHelp() {
  const pathname = usePathname()
  const guide = getFeatureGuide(pathname)

  if (!guide) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          aria-label={`What is ${guide.title}?`}
        >
          <Info className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80 p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">{guide.title}</p>
          <p className="text-sm text-foreground leading-relaxed">{guide.description}</p>
        </div>
        <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Why it matters</p>
          <p className="text-sm leading-relaxed">{guide.why}</p>
        </div>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/docs?tab=${guide.docsTab}`}>
            Read full guide <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
