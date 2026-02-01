"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Moon, Sun, User, Shield, Globe, Mail, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { setTheme, theme } = useTheme()
  const { logout } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }
  const [profile, setProfile] = useState({
    name: "Recruiter Admin",
    email: "admin@company.com",
    role: "Senior Recruiter"
  })

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
        setLoading(false)
        toast.success("Settings saved successfully")
    }, 1000)
  }

  if (!mounted) return null

  return (
    <AppShell title="Settings">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-2 shrink-0">
             <Card className="p-1 h-fit">
                <nav className="flex flex-col space-y-1">
                    <Button variant="ghost" className="justify-start w-full bg-secondary/50">
                        <User className="mr-2 h-4 w-4" /> Account
                    </Button>
                    <Button variant="ghost" className="justify-start w-full">
                        <Bell className="mr-2 h-4 w-4" /> Notifications
                    </Button>
                    <Button variant="ghost" className="justify-start w-full">
                        <Shield className="mr-2 h-4 w-4" /> Privacy & Security
                    </Button>
                    <Button variant="ghost" className="justify-start w-full">
                        <Globe className="mr-2 h-4 w-4" /> Integrations
                    </Button>
                     <Separator className="my-2" />
                    <Button variant="ghost" className="justify-start w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </Button>
                </nav>
             </Card>
        </div>

        <div className="flex-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details and public profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src="/avatars/01.png" alt="@admin" />
                            <AvatarFallback className="text-2xl bg-primary/10 text-primary">RC</AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                             <Button variant="outline" size="sm">Change Avatar</Button>
                             <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max 1MB.</p>
                        </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input 
                                value={profile.name} 
                                onChange={(e) => setProfile({...profile, name: e.target.value})} 
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    className="pl-9" 
                                    value={profile.email} 
                                    onChange={(e) => setProfile({...profile, email: e.target.value})} 
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Role Title</Label>
                         <Input 
                            value={profile.role} 
                            onChange={(e) => setProfile({...profile, role: e.target.value})} 
                        />
                    </div>
                </CardContent>
                <CardFooter className="justify-end border-t p-4 bg-muted/20">
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how the application looks properly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <div className="flex items-center">
                                {mounted && (theme === 'dark' ? <Moon className="mr-2 h-4 w-4" /> : <Sun className="mr-2 h-4 w-4" />)}
                                <Label className="text-base">Dark Mode</Label>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Switch between light and dark themes.
                            </p>
                        </div>
                        <Switch 
                            checked={theme === 'dark'}
                            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                        />
                     </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Configure how you want to be alerted.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive digest emails about new candidates.</p>
                        </div>
                        <Switch defaultChecked />
                     </div>
                     <Separator />
                     <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Candidate Alerts</Label>
                            <p className="text-sm text-muted-foreground">Get notified when a high-match candidate applies.</p>
                        </div>
                        <Switch defaultChecked />
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppShell>
  )
}
