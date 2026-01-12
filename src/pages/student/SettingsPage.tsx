import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Lock, User, Palette, LogOut, Moon, Shield, 
  Smartphone, Mail, Briefcase, Trash2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
// 1. Import the hook
import { useTheme } from "@/components/theme-provider";

const SettingsPage = () => {
  // 2. Access the global theme state
  const { setTheme, theme } = useTheme();

  // Mock State for other settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    jobs: true,
    marketing: false
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    session: false
  });

  const handleNotifyChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-4xl mx-auto space-y-8 pb-10"
    >
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your profile preferences, security, and notifications.</p>
      </div>

      <div className="grid gap-8">
        
        {/* --- 1. Security & Login --- */}
        <Card className="border-t-4 border-t-violet-600 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <CardTitle>Security & Login</CardTitle>
                    <CardDescription>Update your password and secure your account.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="current-pass">Current Password</Label>
                    <Input id="current-pass" type="password" placeholder="••••••••" />
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="new-pass">New Password</Label>
                    <Input id="new-pass" type="password" placeholder="Minimum 8 characters" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-pass">Confirm Password</Label>
                    <Input id="confirm-pass" type="password" placeholder="Confirm new password" />
                </div>
            </div>
            <div className="flex justify-end">
                <Button className="bg-violet-600 hover:bg-violet-700">Update Password</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Label className="text-base font-medium">Two-Factor Authentication</Label>
                        {security.twoFactor && <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Enabled</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
                </div>
                <Switch 
                    checked={security.twoFactor} 
                    onCheckedChange={() => setSecurity({...security, twoFactor: !security.twoFactor})} 
                />
            </div>
          </CardContent>
        </Card>

        {/* --- 2. Notifications --- */}
        <Card className="border-t-4 border-t-indigo-500 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <Bell className="w-5 h-5" />
                </div>
                <div>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Choose what updates you want to receive.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start space-x-4">
                <Mail className="w-5 h-5 text-slate-400 mt-1" />
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Email Notifications</Label>
                        <Switch checked={notifications.email} onCheckedChange={() => handleNotifyChange('email')} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive daily summaries and important alerts.</p>
                </div>
            </div>
            <Separator />
            <div className="flex items-start space-x-4">
                <Briefcase className="w-5 h-5 text-slate-400 mt-1" />
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Job & Internship Alerts</Label>
                        <Switch checked={notifications.jobs} onCheckedChange={() => handleNotifyChange('jobs')} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Get notified immediately when new roles match your profile.</p>
                </div>
            </div>
            <Separator />
            <div className="flex items-start space-x-4">
                <Smartphone className="w-5 h-5 text-slate-400 mt-1" />
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Push Notifications</Label>
                        <Switch checked={notifications.push} onCheckedChange={() => handleNotifyChange('push')} />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Receive notifications on your mobile device.</p>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* --- 3. Appearance (UPDATED) --- */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                    <Palette className="w-5 h-5" />
                </div>
                <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize how the dashboard looks.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 rounded-full text-yellow-400">
                        <Moon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-base font-medium">Dark Mode</Label>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Switch to a dark theme for low-light environments.</p>
                    </div>
                </div>
                
                {/* 3. The Functional Switch */}
                <Switch 
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
            </div>
          </CardContent>
        </Card>

        {/* --- 4. Danger Zone --- */}
        <Card className="border-red-100 bg-red-50/30 dark:bg-red-900/10 dark:border-red-900/50">
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <Shield className="w-5 h-5" />
                </div>
                <div>
                    <CardTitle className="text-red-700 dark:text-red-500">Danger Zone</CardTitle>
                    <CardDescription>Irreversible account actions.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900/50 rounded-lg bg-white dark:bg-slate-950">
                <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">Delete Account</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete your account and all data.</p>
                </div>
                <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Account
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- Log Out Button --- */}
        <div className="flex justify-end pt-4">
            <Button variant="outline" className="text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 border-slate-200 dark:border-slate-800 gap-2">
                <LogOut className="w-4 h-4" /> Sign Out of All Devices
            </Button>
        </div>

      </div>
    </motion.div>
  );
};

export default SettingsPage;