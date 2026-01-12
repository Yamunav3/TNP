import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Palette, Mail, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const Settings: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your admin preferences</p>
      </div>

      {/* General Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          General Settings
        </h2>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Institution Name</Label>
            <Input defaultValue="ABC Institute of Technology" />
          </div>
          <div className="grid gap-2">
            <Label>Contact Email</Label>
            <Input defaultValue="tnp@abctech.edu" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h2>
        <div className="space-y-4">
          {[
            { label: 'Email notifications for new applications', checked: true },
            { label: 'SMS alerts for important updates', checked: false },
            { label: 'Daily placement summary', checked: true },
            { label: 'Company registration alerts', checked: true },
          ].map((setting, index) => (
            <div key={index} className="flex items-center justify-between">
              <Label>{setting.label}</Label>
              <Switch defaultChecked={setting.checked} />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Two-factor authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch />
          </div>
          <Button variant="outline">Change Password</Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </motion.div>
  );
};

export default Settings;
