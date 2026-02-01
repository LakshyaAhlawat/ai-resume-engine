"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header({ title = "Dashboard" }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center gap-4 border-b bg-background/60 px-6 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-2 font-semibold text-lg md:text-xl">
        {title}
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/10 transition-all hover:ring-primary/30">
          <AvatarImage src="/avatars/01.png" alt="@recruiter" />
          <AvatarFallback>RC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
