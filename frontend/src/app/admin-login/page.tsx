"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login, user } = useAuth();
  const router = useRouter();

  // Handle redirect after successful login
  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/admin');
    } else if (user && user.role !== 'admin') {
      setError("Access denied. Admin privileges required.");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      
      // After successful login, we need to get the user from context
      // The login function will update the auth context
      // We'll redirect in a useEffect that watches for user changes
    } catch (error: any) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white border border-black rounded-full">
              <Shield className="h-8 w-8 text-black" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-black">Admin Access</h1>
          <p className="text-black mt-2">
            Secure login for administrative personnel only
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-2 border-black/20 shadow-lg bg-white">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-black">Administrator Login</CardTitle>
            <CardDescription className="text-black">
              Please enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-white border border-black/20 rounded-md text-black text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  Admin Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mindsupport.com"
                  required
                  className="w-full text-black bg-white border border-black/20"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-black">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    className="w-full pr-10 text-black bg-white border border-black/20"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-black"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-black border border-black hover:bg-black hover:text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin Login
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-white border border-black/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-black mt-0.5" />
            <div className="text-sm text-black">
              <h3 className="font-medium mb-1">Security Notice</h3>
              <p>
                This is a restricted area. All login attempts are logged and monitored. 
                Unauthorized access attempts will be reported to system administrators.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Main Site */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="text-black hover:text-black"
          >
            ← Back to MindSupport
          </Button>
        </div>
      </div>
    </div>
  );
}