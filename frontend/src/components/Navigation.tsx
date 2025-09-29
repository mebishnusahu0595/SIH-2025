// Responsive Navigation Component with Hamburger Menu
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { 
  Heart, 
  Menu, 
  X, 
  MessageCircle, 
  ClipboardCheck, 
  BookOpen, 
  Users, 
  Library,
  LogOut,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navigationItems = [
    { 
      name: 'Talk Now', 
      href: '/chat', 
      icon: MessageCircle,
      description: 'Anonymous chat support'
    },
    { 
      name: 'Screening', 
      href: '/screening', 
      icon: ClipboardCheck,
      description: 'Mental health assessment'
    },
    { 
      name: 'Journal', 
      href: '/journal', 
      icon: BookOpen,
      description: 'Track your thoughts'
    },
    { 
      name: 'Counselors', 
      href: '/counselors', 
      icon: Users,
      description: 'Find professional help'
    },
    { 
      name: 'Resources', 
      href: '/resources', 
      icon: Library,
      description: 'Educational content'
    }
  ];

  const isActive = (href: string) => pathname === href;

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Crisis Banner */}
      <div className="w-full bg-yellow-100 text-yellow-900 text-xs sm:text-sm py-2 px-4 border-b border-yellow-300">
        <div className="max-w-7xl mx-auto">
          <p className="text-center">
            <span className="font-semibold">Crisis Support:</span> This tool is not diagnostic. If you&apos;re in crisis, call emergency services or 
            <span className="font-semibold"> 988 (Suicide & Crisis Lifeline)</span>
          </p>
        </div>
      </div>

      {/* Main Navigation - Dynamic Responsive with Glassmorphism */}
      <header className="w-full border-b border-[#A7C7E7]/20 glass-effect backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            
            {/* Logo - Always Visible */}
            <Link 
              href={user ? "/dashboard" : "/"} 
              className="flex items-center space-x-3 hover-glow transition-all duration-300 hover:scale-105"
            >
              <Heart className="h-8 w-8 lg:h-10 lg:w-10 text-[#A7C7E7] hover:scale-110 transition-transform duration-300" />
              <span className="font-bold text-xl lg:text-2xl bg-gradient-to-r from-[#A7C7E7] to-[#89B5E3] bg-clip-text text-transparent">
                MindSupport
              </span>
            </Link>

            {/* Desktop Navigation - Hidden on Mobile */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 group ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-[#A7C7E7] to-[#89B5E3] text-white shadow-lg'
                        : 'text-slate-700 hover:bg-[#A7C7E7]/10 hover:text-[#A7C7E7]'
                    }`}
                  >
                    <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Desktop User Actions - Hidden on Mobile */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-2">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:scale-105 transition-all text-slate-700 hover:text-[#A7C7E7]">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{user.full_name.split(' ')[0]}</span>
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="text-slate-700 hover:text-[#A7C7E7]">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm" className="bg-gradient-to-r from-[#A7C7E7] to-[#89B5E3] hover:from-[#89B5E3] hover:to-[#6BA3DA] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button - Only Visible on Mobile */}
            <div className="lg:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-xl text-[#A7C7E7] hover:bg-[#A7C7E7]/10 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#A7C7E7]/20"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay - Full Screen Glassmorphism */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Enhanced Background Overlay */}
          <div 
            className="fixed inset-0 bg-gradient-to-br from-black/40 via-[#A7C7E7]/10 to-black/40 backdrop-blur-md transition-all duration-300"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Enhanced Mobile Menu Panel */}
          <div className="relative flex-1 flex flex-col max-w-sm w-full ml-auto">
            {/* Enhanced Glassmorphism Panel */}
            <div className="h-full bg-gradient-to-br from-white/95 via-[#FFFFF0]/90 to-white/95 backdrop-blur-xl border-l border-[#A7C7E7]/30 shadow-2xl flex flex-col">
              
              {/* Close Button */}
              <div className="flex justify-end p-4">
                <button
                  className="p-2 rounded-xl bg-[#A7C7E7]/10 hover:bg-[#A7C7E7]/20 text-[#A7C7E7] hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#A7C7E7]/30"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Logo Section */}
              <div className="flex items-center px-6 pb-6 border-b border-[#A7C7E7]/20">
                <Heart className="h-8 w-8 text-[#A7C7E7]" />
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-[#A7C7E7] to-[#89B5E3] bg-clip-text text-transparent">
                  MindSupport
                </span>
              </div>
              
              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`group flex items-center px-4 py-4 text-base font-medium rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-[#A7C7E7] to-[#89B5E3] text-white shadow-lg'
                          : 'text-slate-700 hover:bg-[#A7C7E7]/10 hover:text-[#A7C7E7]'
                      }`}
                    >
                      <Icon className="mr-4 h-6 w-6 group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="font-semibold">{item.name}</div>
                        <div className="text-sm opacity-75">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile User Actions */}
              <div className="border-t border-[#A7C7E7]/20 p-6">
                {user ? (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#A7C7E7] to-[#89B5E3] flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-3">
                          <p className="text-base font-semibold text-slate-700">
                            {user.full_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {logout(); setIsOpen(false);}}
                        className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all duration-300"
                      >
                        <LogOut className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <Link
                      href="/auth/login"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex justify-center px-6 py-3 border-2 border-[#A7C7E7] rounded-xl text-[#A7C7E7] font-semibold hover:bg-[#A7C7E7] hover:text-white hover:scale-105 transition-all duration-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex justify-center px-6 py-3 bg-gradient-to-r from-[#A7C7E7] to-[#89B5E3] rounded-xl text-white font-semibold hover:from-[#89B5E3] hover:to-[#6BA3DA] hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}