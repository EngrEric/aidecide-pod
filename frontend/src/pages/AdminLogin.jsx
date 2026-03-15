import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Package, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/App";
import api from "@/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.adminLogin(email, password);
      if (response.success) {
        login(response.token);
        toast.success("Welcome back!");
        navigate("/admin/dashboard");
      }
    } catch (error) {
      toast.error("Invalid credentials. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-semibold text-zinc-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Smart Stores
          </span>
        </div>
        
        <Card className="shadow-xl shadow-zinc-200/50 border-zinc-100 animate-slideUp">
          <CardHeader className="text-center pb-4">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-5 h-5 text-zinc-600" />
            </div>
            <CardTitle className="text-xl font-semibold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Admin Login
            </CardTitle>
            <CardDescription>
              Sign in to access the dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-zinc-700">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  aria-label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartstores.com"
                  className="mt-1.5 h-12"
                  data-testid="admin-email-input"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-zinc-700">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  aria-label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1.5 h-12"
                  data-testid="admin-password-input"
                />
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 mt-6"
                data-testid="admin-login-btn"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
            
            <p className="text-xs text-zinc-400 text-center mt-6">
              Contact support if you need access credentials
            </p>
          </CardContent>
        </Card>
        
        {/* Back to form link */}
        <p className="text-center mt-6 text-sm text-zinc-500">
          <a href="/" className="hover:text-zinc-700 underline underline-offset-4">
            Back to Customer Form
          </a>
        </p>
      </div>
    </div>
  );
}
