import Link from "next/link";
import { MessageCircle, ClipboardCheck, BookHeart, Users, Shield, Heart, Brain } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your supportive space, anytime
        </h1>
        <p className="text-lg opacity-80 max-w-3xl mx-auto">
          Anonymous supportive chat, evidence-based screening tools, journaling and mood tracking, 
          and help connecting with verified mental health professionals. A safe, confidential space for your mental health journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/chat" className="px-6 py-3 rounded-lg bg-black text-white dark:bg-white dark:text-black text-base font-medium hover:opacity-90 transition-opacity">
            Talk now (anonymous)
          </Link>
          <Link href="/screening" className="px-6 py-3 rounded-lg border border-black/20 text-base font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/5 transition-colors">
            Take screening
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<MessageCircle className="h-8 w-8 text-blue-600" />}
          title="Anonymous Chat" 
          description="AI-powered supportive conversation with evidence-based coping tips and crisis detection."
          href="/chat"
          actionText="Start chatting →"
        />
        <FeatureCard 
          icon={<ClipboardCheck className="h-8 w-8 text-green-600" />}
          title="Screening & Triage" 
          description="PHQ-9 and GAD-7 assessments with personalized recommendations and action steps."
          href="/screening"
          actionText="Take assessment →"
        />
        <FeatureCard 
          icon={<BookHeart className="h-8 w-8 text-purple-600" />}
          title="Journal & Mood" 
          description="Daily journaling with mood tracking, insights, and data export for therapy sessions."
          href="/journal"
          actionText="Start journaling →"
        />
        <FeatureCard 
          icon={<Users className="h-8 w-8 text-orange-600" />}
          title="Find Counselors" 
          description="Connect with verified mental health professionals and schedule sessions."
          href="/counselors"
          actionText="Browse counselors →"
        />
        <FeatureCard 
          icon={<Brain className="h-8 w-8 text-indigo-600" />}
          title="Mental Health Resources" 
          description="Curated articles, videos, apps, and crisis support information."
          href="/resources"
          actionText="View resources →"
        />
        <FeatureCard 
          icon={<Shield className="h-8 w-8 text-red-600" />}
          title="Crisis Support" 
          description="24/7 crisis detection and immediate access to emergency mental health resources."
          href="/resources"
          actionText="Get help now →"
        />
      </section>

      {/* Key Benefits */}
      <section className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-center mb-8">Why MindSupport?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold">Anonymous & Private</h3>
            <p className="text-sm opacity-80">
              Use our services completely anonymously. Your privacy and confidentiality are our top priority.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold">Evidence-Based</h3>
            <p className="text-sm opacity-80">
              All tools and resources are based on proven psychological methods and clinical best practices.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold">Professional Network</h3>
            <p className="text-sm opacity-80">
              Connect with verified, licensed mental health professionals when you're ready for personalized care.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl p-8">
        <h2 className="text-2xl font-semibold">Ready to start your mental health journey?</h2>
        <p className="opacity-80 max-w-2xl mx-auto">
          Whether you need immediate support, want to track your mood, or are looking for professional help, 
          we're here for you every step of the way.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/chat" className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            Start anonymous chat
          </Link>
          <Link href="/screening" className="px-6 py-3 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
            Take mental health screening
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  href, 
  actionText 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  href: string;
  actionText: string;
}) {
  return (
    <div className="border rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <p className="text-sm opacity-80 leading-relaxed">{description}</p>
      <Link href={href} className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-block">
        {actionText}
      </Link>
    </div>
  );
}
