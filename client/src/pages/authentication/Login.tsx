import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { GraduationCap, Shield, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import PasswordField from '@/components/PasswordField';
import { OAuthButton } from '@/components/OAuthButton';

const Login: React.FC = () => {
  const location = useLocation();
  const isAdminLogin = location.pathname.includes('/admin');
  const role: 'student' | 'admin' = isAdminLogin ? 'admin' : 'student';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(email, password, role);
    
    if (success) {
      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } else {
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${isAdminLogin ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-primary-dark' : 'bg-gradient-to-br from-primary via-primary/90 to-primary-dark'}`}
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-primary-foreground">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-primary-foreground/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              {isAdminLogin ? <Shield className="w-14 h-14" /> : <GraduationCap className="w-14 h-14" />}
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold mb-4 text-center"
          >
            {isAdminLogin ? 'Admin Sign In' : 'Student Sign In'}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-primary-foreground/80 text-center max-w-md"
          >
            {isAdminLogin ? 'Access the placement management dashboard.' : 'Your gateway to career success. Prepare, practice, and get placed.'}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 grid grid-cols-3 gap-8"
          >
            {[
              { label: isAdminLogin ? "Managed Drives" : "Students Placed", value: isAdminLogin ? "120+" : "2500+" },
              { label: isAdminLogin ? "Reports" : "Companies", value: isAdminLogin ? "30+" : "150+" },
              { label: isAdminLogin ? "Uptime" : "Success Rate", value: isAdminLogin ? "99%" : "94%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-16 h-16 bg-primary-foreground/10 rounded-full backdrop-blur-sm"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-20 w-24 h-24 bg-primary-foreground/10 rounded-full backdrop-blur-sm"
        />
      </motion.div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              {isAdminLogin ? <Shield className="w-10 h-10 text-primary-foreground" /> : <GraduationCap className="w-10 h-10 text-primary-foreground" />}
            </div>
            <h1 className="text-2xl font-bold text-foreground">{isAdminLogin ? 'Admin Sign In' : 'Student Sign In'}</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">{isAdminLogin ? 'Admin Access' : 'Welcome Back'}</h2>
            <p className="text-muted-foreground">{isAdminLogin ? 'Use your admin credentials to continue.' : 'Sign in to continue your journey'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={isAdminLogin ? '' : 'student@college.edu'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
                <PasswordField 
                  id="password"
                  label="Password"
                  value={password}
                  onChange={setPassword}
                />
               </div>
                          
            <div className="space-y-2">

</div>

            <Button
              type="submit"
            //   variant="gradient"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

          </form>

          {!isAdminLogin && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center"
            >
              <p className="text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Register now
                </Link>
              </p>
            </motion.div>
          )}

          {!isAdminLogin && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <OAuthButton provider="google" />
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
