import React from 'react';
import { ShieldCheck, Mail, BadgeCheck, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const AdminProfile: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground mt-1">Your account details and access summary.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <CardTitle className="text-xl">{user?.name || 'Administrator'}</CardTitle>
              <CardDescription>Administrative access to the TNP dashboard</CardDescription>
            </div>
          </div>
          <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">Admin</Badge>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border p-4 bg-background">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Mail className="w-4 h-4" /> Email
            </div>
            <p className="mt-2 font-semibold break-all">{user?.email || 'Not available'}</p>
          </div>
          <div className="rounded-xl border border-border p-4 bg-background">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BadgeCheck className="w-4 h-4" /> Role
            </div>
            <p className="mt-2 font-semibold capitalize">{user?.role || 'admin'}</p>
          </div>
          <div className="rounded-xl border border-border p-4 bg-background">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Building2 className="w-4 h-4" /> Scope
            </div>
            <p className="mt-2 font-semibold">Placement Operations</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={logout}>Sign Out</Button>
      </div>
    </motion.div>
  );
};

export default AdminProfile;
