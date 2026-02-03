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
  const { user, logout, updateProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("account")
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: ""
  })

  useEffect(() => {
    setMounted(true)
    if (user) {
      setProfile({
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
        role: user.user_metadata?.role || ""
      })
    }
  }, [user])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleSave = async () => {
    setLoading(true)
    try {
        await updateProfile({
            full_name: profile.name,
            role: profile.role
        })
        toast.success("Settings saved successfully")
    } catch (error) {
        console.error("Save Error:", error)
        toast.error("Failed to save settings")
    } finally {
        setLoading(false)
    }
  }

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setLoading(true)
      try {
          const file = e.target.files[0]
          const { supabase } = await import("@/lib/supabase")
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
          const filePath = fileName

          // 1. Upload to Storage
          const { error: uploadError } = await supabase.storage
              .from('avatars') 
              .upload(filePath, file)

          if (uploadError) throw uploadError

          // 2. Get Public URL
          const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath)

          // 3. Update Profile Metadata
          await updateProfile({
              avatar_url: publicUrl
          })
          
          toast.success("Avatar updated successfully")
      } catch (error) {
          console.error("Avatar Upload Error:", error)
          toast.error("Failed to upload avatar. Check storage permissions.")
      } finally {
          setLoading(false)
      }
    }
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
                                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                        {profile.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "RC"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2">
                                     <input 
                                        type="file" 
                                        id="avatar-upload" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                     />
                                     <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar-upload').click()} disabled={loading}>
                                        {loading ? "Processing..." : "Change Avatar"}
                                     </Button>
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
