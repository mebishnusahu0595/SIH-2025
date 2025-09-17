"use client";

import { useState } from "react";
import { Search, MapPin, Clock, Phone, Mail, Globe, Star, Shield, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Counselor } from "@/types";

// Mock data - replace with actual API
const mockCounselors: Counselor[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialties: ["Depression", "Anxiety", "Trauma"],
    credentials: "Ph.D. in Clinical Psychology, Licensed Therapist",
    bio: "Dr. Johnson specializes in cognitive-behavioral therapy and has over 10 years of experience helping individuals overcome anxiety and depression. She uses evidence-based approaches to create personalized treatment plans.",
    availability: "Mon-Fri 9AM-5PM",
    contactInfo: {
      email: "sarah.johnson@therapy.com",
      phone: "+1 (555) 123-4567",
      website: "https://drsarahjohnson.com"
    },
    isVerified: true
  },
  {
    id: "2",
    name: "Michael Chen, LCSW",
    specialties: ["Stress Management", "Relationships", "Career Counseling"],
    credentials: "Licensed Clinical Social Worker, M.S.W.",
    bio: "Michael specializes in helping young professionals manage stress and build healthy relationships. He offers both individual and couples therapy with a focus on solution-focused brief therapy.",
    availability: "Tue-Sat 10AM-7PM",
    contactInfo: {
      email: "m.chen@mindwellness.org",
      phone: "+1 (555) 987-6543"
    },
    isVerified: true
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    specialties: ["PTSD", "Grief Counseling", "Mindfulness"],
    credentials: "Ph.D. in Psychology, Certified EMDR Therapist",
    bio: "Dr. Rodriguez combines traditional therapy with mindfulness-based interventions. She has extensive experience working with trauma survivors and specializes in EMDR therapy.",
    availability: "Mon, Wed, Fri 8AM-4PM",
    contactInfo: {
      email: "emily.rodriguez@healingcenter.net",
      website: "https://dremilyrodriguez.com"
    },
    isVerified: true
  },
  {
    id: "4",
    name: "James Wilson, MFT",
    specialties: ["Family Therapy", "Teen Counseling", "Addiction"],
    credentials: "Marriage and Family Therapist, Licensed Addiction Counselor",
    bio: "James works with families and teenagers facing various challenges. He uses family systems therapy and has specialized training in addiction counseling.",
    availability: "Mon-Thu 1PM-8PM",
    contactInfo: {
      phone: "+1 (555) 456-7890",
      website: "https://familywellnesscenter.com"
    },
    isVerified: true
  }
];

export default function CounselorsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [counselors] = useState<Counselor[]>(mockCounselors);

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

  const handleContact = (counselor: Counselor, method: 'email' | 'phone' | 'website') => {
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
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Find a Counselor</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Connect with verified mental health professionals who can provide personalized support. 
          All counselors are licensed and vetted for quality care.
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, specialty, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-black/20 rounded-md bg-white dark:bg-black dark:border-white/20"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
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

      {/* Counselors Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredCounselors.map((counselor) => (
          <Card key={counselor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {counselor.name}
                    {counselor.isVerified && (
                      <Shield className="h-4 w-4 text-green-500" />
                    )}
                    <span className="sr-only">Verified Counselor</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {counselor.credentials}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Specialties */}
              <div>
                <p className="text-sm font-medium mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-1">
                  {counselor.specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {counselor.bio}
              </p>

              {/* Availability */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4" />
                <span>{counselor.availability}</span>
              </div>

              {/* Contact Methods */}
              <div className="flex flex-wrap gap-2 pt-2">
                {counselor.contactInfo.email && (
                  <Button
                    onClick={() => handleContact(counselor, 'email')}
                    size="sm"
                    variant="outline"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                )}
                {counselor.contactInfo.phone && (
                  <Button
                    onClick={() => handleContact(counselor, 'phone')}
                    size="sm"
                    variant="outline"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                )}
                {counselor.contactInfo.website && (
                  <Button
                    onClick={() => handleContact(counselor, 'website')}
                    size="sm"
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Website
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCounselors.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No counselors found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or browse all available counselors.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedSpecialty("");
              }}
            >
              Show All Counselors
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Important Information */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">
              Important Information
            </h3>
            <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
              <p>
                • All counselors listed here are verified, licensed mental health professionals.
              </p>
              <p>
                • Contact counselors directly to discuss availability, insurance, and session rates.
              </p>
              <p>
                • If you're experiencing a mental health crisis, please call 988 or visit your local emergency room.
              </p>
              <p>
                • This platform facilitates connections but does not provide therapy services directly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

