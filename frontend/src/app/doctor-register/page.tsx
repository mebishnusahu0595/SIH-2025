"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DoctorRegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    specializations: "",
    qualifications: "",
    experience_years: "",
    license_number: "",
    consultation_fee: "",
    bio: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        role: "doctor",
        specializations: formData.specializations.split(',').map(s => s.trim()),
        qualifications: formData.qualifications.split(',').map(q => q.trim()),
        experience_years: parseInt(formData.experience_years),
        license_number: formData.license_number,
        consultation_fee: parseFloat(formData.consultation_fee),
        bio: formData.bio
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register/doctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Doctor registration failed');
      }

      const result = await response.json();
      alert("Doctor registration submitted successfully! Please wait for admin approval.");
      router.push("/login");
      
    } catch (err: any) {
      setError(err.message || "Failed to register doctor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white text-black overflow-x-hidden min-h-screen">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 lg:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="border border-black/20 bg-white p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-black">Doctor Registration</h1>
              <p className="text-sm text-black mt-2">
                Register as a mental health professional. Your application will be reviewed by our admin team.
              </p>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="full_name"
                  placeholder="Full Name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required
                  className="text-black bg-white"
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="text-black bg-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="text-black bg-white"
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="text-black bg-white"
                />
              </div>

              <Input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleInputChange}
                className="text-black bg-white"
              />

              <Input
                type="text"
                name="license_number"
                placeholder="Medical License Number"
                value={formData.license_number}
                onChange={handleInputChange}
                required
                className="text-black bg-white"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  name="experience_years"
                  placeholder="Years of Experience"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  required
                  className="text-black bg-white"
                />
                <Input
                  type="number"
                  name="consultation_fee"
                  placeholder="Consultation Fee (₹)"
                  value={formData.consultation_fee}
                  onChange={handleInputChange}
                  required
                  className="text-black bg-white"
                />
              </div>

              <Input
                type="text"
                name="specializations"
                placeholder="Specializations (comma separated)"
                value={formData.specializations}
                onChange={handleInputChange}
                required
                className="text-black bg-white"
              />

              <Input
                type="text"
                name="qualifications"
                placeholder="Qualifications (comma separated)"
                value={formData.qualifications}
                onChange={handleInputChange}
                required
                className="text-black bg-white"
              />

              <textarea
                name="bio"
                placeholder="Professional Bio (minimum 50 characters)"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full p-3 border border-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
                rows={4}
                required
                minLength={50}
              />

              {error && <p className="text-black text-sm">{error}</p>}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Doctor Registration"}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Log in
              </Link>
            </div>
            
            <div className="mt-2 text-center text-sm">
              Want to register as a patient?{" "}
              <Link href="/register" className="underline">
                Patient Registration
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