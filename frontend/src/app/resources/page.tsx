"use client";

import { useState } from "react";
import { 
  Phone, 
  ExternalLink, 
  Heart, 
  Brain, 
  Shield, 
  Users, 
  BookOpen,
  Video,
  Headphones,
  Download,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CRISIS_RESOURCES } from "@/lib/constants";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'podcast' | 'app' | 'hotline';
  category: 'crisis' | 'anxiety' | 'depression' | 'self-care' | 'coping' | 'relationships';
  url?: string;
  phone?: string;
  duration?: string;
  free: boolean;
}

const resources: Resource[] = [
  {
    id: "1",
    title: "988 Suicide & Crisis Lifeline",
    description: "Free and confidential emotional support 24/7 for people in suicidal crisis or emotional distress.",
    type: "hotline",
    category: "crisis",
    phone: "988",
    free: true
  },
  {
    id: "2", 
    title: "Crisis Text Line",
    description: "Text HOME to 741741 to reach a crisis counselor",
    type: "hotline",
    category: "crisis",
    phone: "741741",
    free: true
  },
  {
    id: "3",
    title: "5-4-3-2-1 Grounding Technique",
    description: "A simple mindfulness exercise to help manage anxiety and panic attacks by focusing on your five senses.",
    type: "article",
    category: "anxiety",
    url: "#",
    duration: "3 min read",
    free: true
  },
  {
    id: "4",
    title: "Understanding Depression: Signs and Symptoms",
    description: "Comprehensive guide to recognizing depression symptoms and understanding when to seek professional help.",
    type: "article",
    category: "depression",
    url: "#",
    duration: "7 min read",
    free: true
  },
  {
    id: "5",
    title: "Progressive Muscle Relaxation",
    description: "Guided audio session to help reduce physical tension and promote relaxation.",
    type: "podcast",
    category: "self-care",
    url: "#",
    duration: "15 min",
    free: true
  },
  {
    id: "6",
    title: "Headspace: Meditation and Mindfulness",
    description: "Popular meditation app with guided sessions for anxiety, sleep, and stress management.",
    type: "app",
    category: "self-care",
    url: "https://headspace.com",
    free: false
  },
  {
    id: "7",
    title: "Building Healthy Relationships",
    description: "Video series on communication skills, boundary setting, and maintaining healthy relationships.",
    type: "video",
    category: "relationships",
    url: "#",
    duration: "25 min",
    free: true
  },
  {
    id: "8",
    title: "Cognitive Behavioral Therapy Techniques",
    description: "Learn practical CBT strategies for managing negative thought patterns and improving mental health.",
    type: "article",
    category: "coping",
    url: "#",
    duration: "10 min read",
    free: true
  },
  {
    id: "9",
    title: "NAMI Support Groups",
    description: "Find local and online support groups for individuals and families affected by mental health conditions.",
    type: "app",
    category: "depression",
    url: "https://nami.org",
    free: true
  }
];

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

  const categories = Array.from(new Set(resources.map(r => r.category)));
  const types = Array.from(new Set(resources.map(r => r.type)));

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesType = !selectedType || resource.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleResourceClick = (resource: Resource) => {
    if (resource.phone) {
      window.location.href = `tel:${resource.phone}`;
    } else if (resource.url && resource.url !== "#") {
      window.open(resource.url, "_blank");
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'podcast': return <Headphones className="h-5 w-5" />;
      case 'app': return <Download className="h-5 w-5" />;
      case 'hotline': return <Phone className="h-5 w-5" />;
      default: return <BookOpen className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'crisis': return 'text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/50';
      case 'anxiety': return 'text-orange-700 bg-orange-100 dark:text-orange-200 dark:bg-orange-900/50';
      case 'depression': return 'text-blue-700 bg-blue-100 dark:text-blue-200 dark:bg-blue-900/50';
      case 'self-care': return 'text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900/50';
      case 'coping': return 'text-purple-700 bg-purple-100 dark:text-purple-200 dark:bg-purple-900/50';
      case 'relationships': return 'text-pink-700 bg-pink-100 dark:text-pink-200 dark:bg-pink-900/50';
      default: return 'text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-800';
    }
  };

  return (
    <div className="w-full bg-white text-black overflow-x-hidden">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 lg:py-20 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-black">Mental Health Resources</h1>
          <p className="text-black max-w-2xl mx-auto">
            Curated collection of evidence-based resources, crisis support, and tools 
            to support your mental health journey.
          </p>
        </div>

      {/* Crisis Support Banner */}
      <div className="border border-black/20 bg-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <Phone className="h-6 w-6 text-black" />
          <h2 className="text-lg font-semibold text-black">
            Immediate Crisis Support
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            onClick={() => window.location.href = `tel:${CRISIS_RESOURCES.us.national}`}
            className="bg-white text-black border border-black hover:bg-black hover:text-white text-white"
            size="lg"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call 988 - Crisis Lifeline
          </Button>
          <Button
            onClick={() => window.location.href = "sms:741741?body=HOME"}
            variant="outline"
            className="border border-black/20 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
            size="lg"
          >
            Text HOME to 741741
          </Button>
        </div>
        <p className="text-sm text-black mt-3">
          If you're experiencing thoughts of self-harm or are in immediate danger, 
          please call emergency services (911) or go to your nearest emergency room.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white text-black border-black/20"
              />
            </div>
          </div>
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-black border-black/20"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="md:w-32">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-black border-black/20"
            >
              <option value="">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''}
        </p>
        {(searchTerm || selectedCategory || selectedType) && (
          <Button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSelectedType("");
            }}
            variant="outline"
            size="sm"
            className="border-black/20 text-black"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <div 
            key={resource.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer bg-white border border-black/20 p-6"
            onClick={() => handleResourceClick(resource)}
          >
            <div className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-black">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-base text-black font-semibold">
                      {resource.title}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(resource.category)}`}>
                        {resource.category}
                      </span>
                      {resource.free && (
                        <span className="px-2 py-1 text-xs rounded-full bg-white border border-black/20 text-black">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-black" />
              </div>
            </div>
            <div className="pt-0">
              <p className="text-sm text-black mb-3">
                {resource.description}
              </p>
              
              {resource.duration && (
                <div className="flex items-center gap-2 text-xs text-black mb-3">
                  <span>{resource.duration}</span>
                </div>
              )}

              {resource.phone && (
                <div className="mt-2">
                  <Button 
                    size="sm" 
                    className="w-full bg-white text-black border border-black hover:bg-black hover:text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call {resource.phone}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="bg-white border border-black/20 p-8 text-center">
          <div className="text-6xl mb-4 text-black">🔍</div>
          <h3 className="text-lg font-medium text-black mb-2">No resources found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or browse all available resources.
          </p>
          <Button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("");
              setSelectedType("");
            }}
            variant="outline"
            className="border-black/20 text-black"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-black/20 bg-white p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-black mt-0.5" />
            <div className="text-sm text-black">
              <p className="font-medium mb-1">Quality Assurance</p>
              <p>
                All resources are curated and reviewed by mental health professionals. 
                However, they should not replace professional medical advice or treatment.
              </p>
            </div>
          </div>
        </div>

        <div className="border border-black/20 bg-white p-6">
          <div className="flex items-start gap-3">
            <Heart className="h-5 w-5 text-black mt-0.5" />
            <div className="text-sm text-black">
              <p className="font-medium mb-1">Community Support</p>
              <p>
                Many resources include community forums and support groups. 
                Connecting with others who share similar experiences can be incredibly helpful.
              </p>
            </div>
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