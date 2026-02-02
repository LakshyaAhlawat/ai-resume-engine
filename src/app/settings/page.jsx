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
  const [activeTab, setActiveTab] = useState("account")
  const [profile, setProfile] = useState({
    name: "Recruiter Admin",
    email: "admin@company.com",
    role: "Senior Recruiter"
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
        setLoading(false)
        toast.success("Settings saved successfully")
    }, 1000)
  }

  if (!mounted) return null

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "integrations", label: "Integrations", icon: Globe },
  ]

  return (
    <AppShell title="Settings">
      <div className="flex flex-col md:flex-row gap-6 h-full pb-10">
        <div className="w-full md:w-64 space-y-2 shrink-0">
             <Card className="p-1 h-fit shadow-sm">
                <nav className="flex flex-col space-y-1">
                    {tabs.map((tab) => (
                        <Button 
                            key={tab.id}
                            variant="ghost" 
                            className={`justify-start w-full transition-all ${activeTab === tab.id ? 'bg-secondary font-medium' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon className={`mr-2 h-4 w-4 ${activeTab === tab.id ? 'text-primary' : ''}`} /> 
                            {tab.label}
                        </Button>
                    ))}
                     <Separator className="my-2" />
                    <Button variant="ghost" className="justify-start w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Sign out
                    </Button>
                </nav>
             </Card>
        </div>

        <div className="flex-1 space-y-6">
            {activeTab === 'account' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>Update your personal details and public profile.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="h-24 w-24 border-2 border-primary/10">
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
                            <CardDescription>Customize how the application looks to match your preference.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between p-4 border rounded-lg bg-card shadow-sm">
                                <div className="space-y-0.5">
                                    <div className="flex items-center">
                                        {theme === 'dark' ? <Moon className="mr-2 h-4 w-4 text-primary" /> : <Sun className="mr-2 h-4 w-4 text-yellow-500" />}
                                        <Label className="text-base">Dark Mode</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Switch between light and dark themes for better eye comfort.
                                    </p>
                                </div>
                                <Switch 
                                    checked={theme === 'dark'}
                                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                                />
                             </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'notifications' && (
                <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>Configure how you want to be alerted about hiring activities.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">Receive digest emails about new candidate pools.</p>
                            </div>
                            <Switch defaultChecked />
                         </div>
                         <Separator />
                         <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">AI Analysis Alerts</Label>
                                <p className="text-sm text-muted-foreground">Get notified as soon as a high-match (80%+) candidate is found.</p>
                            </div>
                            <Switch defaultChecked />
                         </div>
                         <Separator />
                         <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">System Updates</Label>
                                <p className="text-sm text-muted-foreground">Stay informed about new AI models and features.</p>
                            </div>
                            <Switch />
                         </div>
                    </CardContent>
                    <CardFooter className="justify-end border-t p-4 bg-muted/20">
                        <Button onClick={handleSave}>Update Preferences</Button>
                    </CardFooter>
                </Card>
            )}

            {activeTab === 'privacy' && (
                <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardHeader>
                        <CardTitle>Privacy & Security</CardTitle>
                        <CardDescription>Manage your password and security settings to protect sensitive candidate data.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <Input type="password" placeholder="••••••••" />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>New Password</Label>
                                    <Input type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Confirm New Password</Label>
                                    <Input type="password" />
                                </div>
                            </div>
                             <Button variant="outline" size="sm">Update Password</Button>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Two-Factor Authentication</Label>
                                <p className="text-sm text-muted-foreground">Add an extra layer of security to your recruiter account.</p>
                            </div>
                            <Switch />
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'integrations' && (
                <Card className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <CardHeader>
                        <CardTitle>Integrations</CardTitle>
                        <CardDescription>Connect ResumeAI with your existing tools and workflows.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { name: 'LinkedIn Recruiter', desc: 'Sync candidate profiles directly from LinkedIn.', connected: true },
                            { name: 'Slack', desc: 'Receive AI alerts in your company Slack channels.', connected: false },
                            { name: 'Gmail', desc: 'Automate interview scheduling via Gmail.', connected: false },
                        ].map((integration, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                                <div className="space-y-0.5">
                                    <p className="font-medium">{integration.name}</p>
                                    <p className="text-sm text-muted-foreground">{integration.desc}</p>
                                </div>
                                <Button variant={integration.connected ? "secondary" : "outline"} size="sm">
                                    {integration.connected ? "Disconnect" : "Connect"}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </AppShell>
  )
}
