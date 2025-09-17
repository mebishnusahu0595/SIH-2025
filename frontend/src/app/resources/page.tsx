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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      case 'crisis': return 'text-red-600 bg-red-100 dark:bg-red-950';
      case 'anxiety': return 'text-orange-600 bg-orange-100 dark:bg-orange-950';
      case 'depression': return 'text-blue-600 bg-blue-100 dark:bg-blue-950';
      case 'self-care': return 'text-green-600 bg-green-100 dark:bg-green-950';
      case 'coping': return 'text-purple-600 bg-purple-100 dark:bg-purple-950';
      case 'relationships': return 'text-pink-600 bg-pink-100 dark:bg-pink-950';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-semibold">Mental Health Resources</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Curated collection of evidence-based resources, crisis support, and tools 
          to support your mental health journey.
        </p>
      </div>

      {/* Crisis Support Banner */}
      <Card className="border-red-500 bg-red-50 dark:bg-red-950">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Phone className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Immediate Crisis Support
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => window.location.href = `tel:${CRISIS_RESOURCES.us.national}`}
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call 988 - Crisis Lifeline
            </Button>
            <Button
              onClick={() => window.location.href = "sms:741741?body=HOME"}
              variant="outline"
              className="border-red-500 text-red-700 hover:bg-red-50"
              size="lg"
            >
              Text HOME to 741741
            </Button>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-3">
            If you're experiencing thoughts of self-harm or are in immediate danger, 
            please call emergency services (911) or go to your nearest emergency room.
          </p>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-black/20 rounded-md bg-white dark:bg-black dark:border-white/20"
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
                className="w-full h-10 px-3 py-2 border border-black/20 rounded-md bg-white dark:bg-black dark:border-white/20"
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
        </CardContent>
      </Card>

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
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleResourceClick(resource)}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getResourceIcon(resource.type)}
                  <div>
                    <CardTitle className="text-base">{resource.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(resource.category)}`}>
                        {resource.category}
                      </span>
                      {resource.free && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-950">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {resource.description}
              </p>
              
              {resource.duration && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{resource.duration}</span>
                </div>
              )}

              {resource.phone && (
                <div className="mt-3">
                  <Button size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Call {resource.phone}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium mb-2">No resources found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or browse all available resources.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedType("");
              }}
            >
              Show All Resources
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Quality Assurance</p>
                <p>
                  All resources are curated and reviewed by mental health professionals. 
                  However, they should not replace professional medical advice or treatment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="text-sm text-green-800 dark:text-green-200">
                <p className="font-medium mb-1">Community Support</p>
                <p>
                  Many resources include community forums and support groups. 
                  Connecting with others who share similar experiences can be incredibly helpful.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

