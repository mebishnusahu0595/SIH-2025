"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, MessageCircle, ClipboardCheck, BookHeart, Users, Shield, Brain } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  actionText: string;
}

function FeatureCard({ icon, title, description, href, actionText }: FeatureCardProps) {
  return (
    <div className="group p-6 sm:p-8 rounded-2xl border border-black/10 transition-all duration-300 cursor-pointer h-full bg-white">
      <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border border-black/20 bg-white">
          <div className="text-black scale-110 sm:scale-125">
            {icon}
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 sm:mb-3">{title}</h3>
          <p className="text-black leading-relaxed mb-4 sm:mb-6 text-base sm:text-lg flex-1">{description}</p>
          <Link href={href} className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-white text-black font-semibold rounded-full border border-black hover:bg-black hover:text-white transition-colors duration-200 text-sm sm:text-base">
            {actionText}
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Heart className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-black overflow-x-hidden">
      {/* Full Width Content - No Container Limits */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 lg:py-20 space-y-12 sm:space-y-16 lg:space-y-20">
        {/* Hero Section - Full Width Responsive */}
        <section className="text-center space-y-8 sm:space-y-12 lg:space-y-16 relative">
          {/* Removed floating colored elements for pure B/W */}
          
          <div className="space-y-6 sm:space-y-8 lg:space-y-10 relative z-10">
            <h1 className="notable-font text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-black leading-tight px-2">
              Your Supportive Space
            </h1>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-black mb-4 sm:mb-6">
              Anytime, Anywhere
            </div>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-black max-w-6xl mx-auto leading-relaxed font-light px-4 sm:px-6">
              Anonymous supportive chat, evidence-based screening tools, journaling and mood tracking, 
              and help connecting with verified mental health professionals. A safe, confidential space for your mental health journey.
            </p>
          </div>
          
          {/* Dynamic Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center items-center px-4">
            <Link href="/chat" className="group w-full sm:w-auto px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-full bg-white text-black text-lg sm:text-xl font-bold border border-black transition-colors duration-200 hover:bg-black hover:text-white">
              <span className="relative z-10">Talk Now (Anonymous)</span>
            </Link>
            <Link href="/screening" className="group w-full sm:w-auto px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-full border border-black text-black text-lg sm:text-xl font-bold transition-colors duration-200 hover:bg-black hover:text-white">
              Take Screening
            </Link>
          </div>
        </section>

        {/* Features Grid - Full Width Responsive */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16">
          <FeatureCard 
            icon={<MessageCircle className="h-6 w-6 text-black" />}
            title="Anonymous Chat" 
            description="AI-powered supportive conversation with evidence-based coping tips and crisis detection."
            href="/chat"
            actionText="Start chatting →"
          />
          <FeatureCard 
            icon={<ClipboardCheck className="h-6 w-6 text-black" />}
            title="Screening & Triage" 
            description="PHQ-9 and GAD-7 assessments with personalized recommendations and action steps."
            href="/screening"
            actionText="Take assessment →"
          />
          <FeatureCard 
            icon={<BookHeart className="h-6 w-6 text-black" />}
            title="Journal & Mood" 
            description="Daily journaling with mood tracking, insights, and data export for therapy sessions."
            href="/journal"
            actionText="Start journaling →"
          />
          <FeatureCard 
            icon={<Users className="h-6 w-6 text-black" />}
            title="Find Counselors" 
            description="Search verified mental health professionals by location, specialty, and availability."
            href="/counselors"
            actionText="Find help →"
          />
          <FeatureCard 
            icon={<Shield className="h-6 w-6 text-black" />}
            title="Privacy First" 
            description="Complete anonymity for chat sessions with optional account creation for progress tracking."
            href="/resources"
            actionText="Learn more →"
          />
          <FeatureCard 
            icon={<Brain className="h-6 w-6 text-black" />}
            title="Mental Health Resources" 
            description="Curated educational content, coping strategies, and crisis intervention resources."
            href="/resources"
            actionText="Explore resources →"
          />
        </section>

        {/* Trust Indicators */}
        <section className="bg-white rounded-2xl border border-black/10 p-8 lg:p-12">
          <div className="text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl font-semibold text-black">
              Professional & Evidence-Based
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-black/20 bg-white">
                  <Shield className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-black">HIPAA Compliant</h3>
                <p className="text-black">Your privacy and data security are our top priorities with industry-standard encryption.</p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-black/20 bg-white">
                  <ClipboardCheck className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-black">Evidence-Based</h3>
                <p className="text-black">Our screening tools use validated clinical assessments like PHQ-9 and GAD-7.</p>
              </div>
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-black/20 bg-white">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <h3 className="text-xl font-semibold text-black">Licensed Professionals</h3>
                <p className="text-black">Connect with verified, licensed mental health professionals in your area.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-4xl font-semibold text-black">
              Ready to start your journey?
            </h2>
            <p className="text-xl text-black max-w-2xl mx-auto">
              Take the first step towards better mental health. No commitment required.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            <Link href="/register" className="px-8 py-4 rounded-lg bg-white text-black text-lg font-medium border border-black hover:bg-black hover:text-white transition-colors">
              Create Free Account
            </Link>
            <Link href="/chat" className="px-8 py-4 rounded-lg border border-black text-black text-lg font-medium hover:bg-black hover:text-white transition-colors">
              Try Chat (No Signup)
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            Are you a mental health professional?{" "}
            <Link href="/doctor-register" className="text-black underline">
              Register as a Doctor
            </Link>
          </div>
        </section>
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
  );
}