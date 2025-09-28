"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        router.push("/admin");
        return;
      } else if (user.role === 'doctor') {
        router.push("/doctor-dashboard");
        return;
      }
      // For patients, stay on this dashboard
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">
              Welcome, {user.full_name}!
            </h1>
            <p className="text-black">
              Here's your personalized mental health dashboard.
            </p>
          </div>
          <Button onClick={logout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            title="Anonymous Chat"
            description="Talk with our supportive AI chatbot anytime you need."
            href="/chat"
            actionText="Start Chatting"
          />
          <DashboardCard
            title="Mental Health Screening"
            description="Take a quick assessment to understand your mental state."
            href="/screening"
            actionText="Take Assessment"
          />
          <DashboardCard
            title="Your Journal"
            description="Reflect on your thoughts and track your mood."
            href="/journal"
            actionText="Open Journal"
          />
          <DashboardCard
            title="Find a Counselor"
            description="Connect with verified mental health professionals."
            href="/counselors"
            actionText="Browse Counselors"
          />
           <DashboardCard
            title="Resources"
            description="Explore articles, videos, and coping strategies."
            href="/resources"
            actionText="View Resources"
          />
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

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  actionText: string;
}

function DashboardCard({ title, description, href, actionText }: DashboardCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-black">{title}</CardTitle>
        <CardDescription className="text-black">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={href} className="flex items-center text-black font-semibold">
          {actionText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
