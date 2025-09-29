"use client";

import { useState, useEffect } from "react";
import { Search, Clock, Phone, Mail, Globe, Star, Shield, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Counselor } from "@/types";

export default function CounselorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://main-yduh.onrender.com';
      const counselorsEndpoint = `${apiBase}/api/counselors`;
      
      const response = await fetch(counselorsEndpoint);
      
      if (response.ok) {
        const data = await response.json();
        setCounselors(data);
      } else {
        setError(`Failed to fetch counselors: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching counselors:', error);
      setError('Network error while fetching counselors');
    } finally {
      setLoading(false);
    }
  };

  const specialties = Array.from(
    new Set(counselors.flatMap(counselor => counselor.specialties))
  ).sort();

  const filteredCounselors = counselors.filter(counselor => {
    const matchesSearch = counselor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counselor.specialties.some(specialty => 
                           specialty.toLowerCase().includes(searchTerm.toLowerCase())
                         ) ||
                         counselor.bio.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !selectedSpecialty || 
                            counselor.specialties.includes(selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  const handleContact = (counselor: Counselor, method: 'email' | 'phone' | 'website' | 'chat') => {
    switch (method) {
      case 'email':
        if (counselor.contactInfo.email) {
          window.location.href = `mailto:${counselor.contactInfo.email}`;
        }
        break;
      case 'phone':
        if (counselor.contactInfo.phone) {
          window.location.href = `tel:${counselor.contactInfo.phone}`;
        }
        break;
      case 'website':
        if (counselor.contactInfo.website) {
          window.open(counselor.contactInfo.website, '_blank');
        }
        break;
      case 'chat':
        alert('Chat feature is currently under development. Please use email or phone to contact the counselor.');
        break;
    }
  };

  return (
    <div className="w-full bg-white text-black overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 lg:py-20 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-semibold">Find a Counselor</h1>
        <p className="text-black max-w-2xl mx-auto">
          Connect with verified mental health professionals who can provide personalized support. 
          All counselors are licensed and vetted for quality care.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-black/20 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
              <Input
                placeholder="Search by name, specialty, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
          </div>
          <div className="md:w-64">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-black/20 rounded-md bg-white text-black"
            >
              <option value="">All Specialties</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-black">
          Showing {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? 's' : ''}
        </p>
        {searchTerm || selectedSpecialty ? (
          <Button
            onClick={() => {
              setSearchTerm("");
              setSelectedSpecialty("");
            }}
            variant="outline"
            size="sm"
          >
            Clear Filters
          </Button>
        ) : null}
      </div>

      {/* Error State */}
      {error && (
        <div className="border-red-500 bg-gradient-to-br from-red-50/90 to-red-100/50 backdrop-blur-sm border-red-300 p-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-medium mb-1">Error loading counselors</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Counselors Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          {filteredCounselors.map((counselor) => (
          <div key={counselor.id} className="hover:shadow-lg transition-shadow bg-white border border-black/20 overflow-hidden p-3">
            <div className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-black text-base font-semibold">
                    {counselor.name}
                    {counselor.isVerified && (
                      <Shield className="h-3 w-3 text-black flex-shrink-0" />
                    )}
                    <span className="sr-only">Verified Counselor</span>
                  </div>
                  <div className="mt-1 text-black text-xs">
                    {counselor.credentials}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-black flex-shrink-0 ml-2">
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {/* Specialties */}
              <div>
                <p className="text-xs font-medium mb-1 text-black">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {counselor.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full break-words max-w-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-black leading-relaxed whitespace-normal break-words">
                {counselor.bio}
              </p>

              {/* Availability */}
              <div className="flex items-center gap-1 text-xs text-black">
                <Clock className="h-3 w-3" />
                <span>{counselor.availability.replace(/0/g, '').trim()}</span>
              </div>

              {/* Pricing */}
              {counselor.hourlyRate && Number(counselor.hourlyRate) > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                  <span>₹{counselor.hourlyRate}/hour</span>
                </div>
              )}

              {/* Contact Methods */}
              <div className="flex flex-wrap gap-1 pt-1">
                {counselor.contactInfo.email && (
                  <Button
                    onClick={() => handleContact(counselor, 'email')}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-6 bg-white border-[#A7C7E7]/30 text-black hover:text-black hover:bg-gray-50"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                )}
                {counselor.contactInfo.phone && (
                  <Button
                    onClick={() => handleContact(counselor, 'phone')}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-6 bg-white border-[#A7C7E7]/30 text-black hover:text-black hover:bg-gray-50"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Call
                  </Button>
                )}
                <Button
                  onClick={() => handleContact(counselor, 'chat')}
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 py-1 h-6 bg-white border-[#A7C7E7]/30 text-black hover:text-black hover:bg-gray-50"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Chat
                </Button>
                {counselor.contactInfo.website && (
                  <Button
                    onClick={() => handleContact(counselor, 'website')}
                    size="sm"
                    variant="outline"
                    className="text-xs px-2 py-1 h-6 bg-white border-[#A7C7E7]/30 text-black hover:text-black hover:bg-gray-50"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredCounselors.length === 0 && !loading && (
          <div className="bg-white border border-black/20 p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-black">No counselors found</h3>
            <p className="text-black">
              Try adjusting your search criteria or browse all available counselors.
            </p>
          </div>
        )}
        </div>
      )}      {/* Important Information */}
      <div className="border-blue-200 bg-gradient-to-br from-blue-50/90 to-[#A7C7E7]/20 backdrop-blur-sm border-[#A7C7E7]/30 p-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-black">
            Important Information
          </h3>
          <div className="space-y-2 text-sm text-black">
            <p>
              • All counselors listed here are verified, licensed mental health professionals.
            </p>
            <p>
              • Contact counselors directly to discuss availability, insurance, and session rates.
            </p>
            <p>
              • If you&apos;re experiencing a mental health crisis, please call 988 or visit your local emergency room.
            </p>
            <p>
              • This platform facilitates connections but does not provide therapy services directly.
            </p>
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

