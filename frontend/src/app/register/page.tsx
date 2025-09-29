"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [error, setError] = useState<string | null>(null);
  const [specialization, setSpecialization] = useState("");
  const [bio, setBio] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const result = await register({ 
        email, 
        password, 
        full_name: fullName, 
        role,
        specialization: role === 'doctor' ? specialization : undefined,
        bio: role === 'doctor' ? bio : undefined
      });
      if (role === "doctor") {
        setError(""); // clear error
        alert(result.message); // show success message
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to register";
      setError(message);
    }
  };

  return (
    <div className="w-full bg-white text-black overflow-x-hidden min-h-screen">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 lg:py-20">
        <div className="max-w-md mx-auto">
          <div className="border border-black/20 bg-white p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-black">Create an Account</h1>
              <p className="text-sm text-black mt-2">
                Join MindSupport to start your journey towards better mental health.
              </p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="text-black bg-white"
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-black bg-white"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "patient" | "doctor")}
                className="w-full p-2 border border-black/20 rounded-md text-black bg-white"
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
              {role === 'doctor' && (
                <>
                  <Input
                    type="text"
                    placeholder="Specialization (e.g., Psychiatry, Counseling)"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                    className="text-black bg-white"
                  />
                  <textarea
                    placeholder="Bio / Description (tell us about yourself)"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-2 border border-black/20 rounded-md text-black bg-white"
                    rows={3}
                    required
                  />
                </>
              )}
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-black bg-white"
              />
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="text-black bg-white"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Log in
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur border-t border-gray-200 py-12 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-gradient-to-r from-[#A7C7E7] to-[#89B5E3] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">♥</span>
                </div>
                <span className="font-semibold text-black">MindSupport</span>
              </div>
              <div className="text-center md:text-right">
                <p className="text-gray-600">
                  © {new Date().getFullYear()} MindSupport. Professional counselor connections for your mental health journey.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
