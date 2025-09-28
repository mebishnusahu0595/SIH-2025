"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo Section */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-3 hover-glow">
            <Heart className="h-12 w-12 text-black hover:scale-110 transition-transform duration-300" />
            <span className="text-3xl font-bold text-black">
              MindSupport
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-black">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-black">
            Sign in to your account to continue your mental health journey
          </p>
        </div>

        {/* Login Form */}
        <Card className="border border-black/20 shadow-2xl bg-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-black">
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-white border border-black/20 text-black px-4 py-3 rounded-xl flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-black">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border border-black/20 focus:border-black focus:ring-black/20 text-black bg-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium text-black">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border border-black/20 focus:border-black focus:ring-black/20 text-black bg-white"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black hover:text-black"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-black focus:ring-black border-black/20 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 text-sm text-black">
                    Remember me
                  </label>
                </div>
                <Link href="/auth/forgot-password" className="text-sm text-black hover:text-black">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-white text-black border border-black font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-black hover:text-white"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-black/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-black">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-black">
                  Don't have an account?{" "}
                  <Link href="/auth/register" className="font-medium text-black hover:text-black">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Anonymous Access */}
        <Card className="border border-black/20 bg-white">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-black mb-2">Need immediate support?</h3>
            <p className="text-sm text-black mb-4">
              Access our anonymous chat without creating an account
            </p>
            <Link href="/chat">
              <Button variant="outline" className="border border-black text-black hover:bg-black hover:text-white">
                Anonymous Chat
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}