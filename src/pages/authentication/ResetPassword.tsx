import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      console.log("📝 Submitting reset password with token:", token?.substring(0, 10) + "...");
      
      const response = await axios.post('http://localhost:5002/api/auth/reset-password', {
        token,
        password,
        confirmPassword
      });
      
      console.log("✅ Password reset successful:", response.data);
      setSuccess(true);
      toast.success("Password reset successful!");
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error("❌ Reset error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Failed to reset password";
      
      // Special handling for expired/invalid tokens
      if (errorMsg.includes("expired") || errorMsg.includes("Invalid")) {
        toast.error("Reset link has expired. Please request a new one.");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Password Reset Successful!</h2>
            <p className="text-muted-foreground mt-2">You can now login with your new password</p>
          </div>
          <Button 
            onClick={() => navigate('/login')} 
            className="w-full h-12"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create New Password</h2>
          <p className="text-muted-foreground mt-2">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="password" 
              placeholder="New Password" 
              className="pl-11 h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="password" 
              placeholder="Confirm Password" 
              className="pl-11 h-12"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>

          <Button type="submit" className="w-full h-12" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
          </Button>
        </form>

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
