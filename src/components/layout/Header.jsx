"use client"

import { useState, useEffect } from "react"
import { Bell, Menu, Bot, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth"
import { User, Settings, LogOut, LayoutDashboard } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageHelp } from "@/components/layout/PageHelp"
import { SidebarNav } from "@/components/layout/Sidebar"

export function Header({ title = "Dashboard" }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const { getCandidates } = await import("@/actions/candidateActions")
        const res = await getCandidates()
        if (!res.success) return

        const needsReview = (res.candidates || []).filter(
          (c) => (c.score || 0) >= 80 && c.status !== "Accepted" && c.status !== "Rejected"
        )
        setNotifications(
          needsReview.slice(0, 5).map((c) => ({
            id: c.id,
            text: `${c.name || "A candidate"} scored ${c.score}% — ready for review`,
          }))
        )
      } catch (err) {
        console.error("Notifications load error:", err)
      } finally {
        setNotifLoading(false)
      }
    }
    loadNotifications()
  }, [])

  const displayName = user?.name || user?.email || "Recruiter"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  const handleSignOut = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center gap-2 border-b bg-background/60 px-4 sm:px-6 backdrop-blur-xl transition-all">
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open navigation</span>
        </Button>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle asChild>
              <Link href="/" className="flex items-center gap-2 font-semibold" onClick={() => setMobileNavOpen(false)}>
                <Bot className="h-6 w-6 text-primary" />
                ResumeAI
              </Link>
            </SheetTitle>
          </SheetHeader>
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex items-center gap-2 font-semibold text-lg md:text-xl min-w-0 flex-1 truncate">
        {title}
      </div>
      <PageHelp />
      <div className="ml-auto flex items-center gap-2 sm:gap-4 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72" align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifLoading ? (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="px-2 py-4 flex flex-col items-center gap-2 text-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <p className="text-xs text-muted-foreground">You&apos;re all caught up</p>
              </div>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem key={n.id} asChild>
                  <Link href={`/candidates/${n.id}`} className="text-xs leading-relaxed whitespace-normal">
                    {n.text}
                  </Link>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/10 transition-all hover:ring-primary/30">
              <AvatarImage src={user?.image} alt={displayName} />
              <AvatarFallback>{initials || "RC"}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer w-full flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer w-full flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer w-full flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-700 cursor-pointer" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
