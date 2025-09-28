"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  BarChart3, 
  Shield, 
  Eye,
  Plus,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate, formatTime } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  pendingDoctors: number;
  totalChats: number;
  crisisFlags: number;
  avgMood: number;
  screeningsCompleted: number;
}

interface DoctorApplication {
  _id: string;
  full_name: string;
  email: string;
  phone: string;
  medical_license: string;
  specialization: string[];
  qualification: string;
  experience_years: number;
  hospital_affiliation?: string;
  consultation_fee: number;
  bio: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
}

interface SystemUser {
  _id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

interface Doctor {
  _id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  is_active: boolean;
  doctor_profile?: {
    medical_license: string;
    specialization: string[];
    qualification: string;
    experience_years: number;
    hospital_affiliation?: string;
    consultation_fee: number;
    bio: string;
    phone?: string;
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'users' | 'analytics'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalChats: 0,
    crisisFlags: 0,
    avgMood: 0,
    screeningsCompleted: 0
  });
  const [doctorApplications, setDoctorApplications] = useState<DoctorApplication[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Check admin access and redirect if necessary
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      if (!redirecting) {
        setRedirecting(true);
        router.push('/admin-login');
      }
      return;
    }
    
    if (user.role !== 'admin') {
      if (!redirecting) {
        setRedirecting(true);
        router.push('/admin-login');
      }
      return;
    }
    
    // If user is admin, fetch data
    fetchAdminStats();
    fetchDoctorApplications();
    fetchSystemUsers();
    fetchDoctors();
    setLoading(false);
  }, [user, router, authLoading, redirecting]);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/stats', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError(`Failed to fetch admin stats: ${response.status}`);
      }
    } catch (error) {
      setError('Network error while fetching admin stats');
    }
  };

  const fetchDoctorApplications = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/doctor-applications', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoctorApplications(data);
      } else {
        setError(`Failed to fetch doctor applications: ${response.status}`);
      }
    } catch (error) {
      setError('Network error while fetching doctor applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemUsers(data);
      } else {
        setError(`Failed to fetch system users: ${response.status}`);
      }
    } catch (error) {
      setError('Network error while fetching system users');
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/doctors', {
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || ''
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      } else {
        setError(`Failed to fetch doctors: ${response.status}`);
      }
    } catch (error) {
      setError('Network error while fetching doctors');
    }
  };

  const handleDoctorApproval = async (doctorId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/doctor-applications/${doctorId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || ''
        }
      });
      
      if (response.ok) {
        // Refresh doctor applications and doctors list
        fetchDoctorApplications();
        fetchDoctors();
        fetchAdminStats();
      } else {
        setError(`Failed to ${action} doctor application`);
      }
    } catch (error) {
      setError(`Error ${action}ing doctor application`);
    }
  };

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to delete this doctor application?')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/api/admin/doctor-applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': user?.id || ''
        }
      });
      
      if (response.ok) {
        fetchDoctorApplications();
        fetchAdminStats();
      } else {
        setError('Failed to delete doctor application');
      }
    } catch (error) {
      setError('Error deleting doctor application');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="border border-black/20 bg-white p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm font-medium text-black">Total Users</p>
              <p className="text-2xl font-semibold text-black">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="border border-black/20 bg-white p-4">
          <div className="flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm font-medium text-black">Active Doctors</p>
              <p className="text-2xl font-semibold text-black">{stats.totalDoctors}</p>
            </div>
          </div>
        </div>

        <div className="border border-black/20 bg-white p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm font-medium text-black">Pending Approvals</p>
              <p className="text-2xl font-semibold text-black">{stats.pendingDoctors}</p>
            </div>
          </div>
        </div>

        <div className="border border-black/20 bg-white p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm font-medium text-black">Chat Sessions</p>
              <p className="text-2xl font-semibold text-black">{stats.totalChats}</p>
            </div>
          </div>
        </div>

        <div className="border border-black/20 bg-white p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-black" />
            <div>
              <p className="text-sm font-medium text-black">Crisis Flags</p>
              <p className="text-2xl font-semibold text-black">{stats.crisisFlags}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="border border-black/20 bg-white">
          <div className="p-6 pb-3">
            <h3 className="text-xl font-semibold text-black">Pending Doctor Applications</h3>
            <p className="text-sm text-black">Applications awaiting review</p>
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {doctorApplications.filter(doc => doc.status === 'pending').slice(0, 5).map((doctor) => (
                <div key={doctor._id} className="flex items-center justify-between p-3 border border-black/20 rounded bg-white">
                  <div>
                    <p className="font-medium text-black">{doctor.full_name}</p>
                    <p className="text-sm text-black">{doctor.specialization || ''}</p>
                    <p className="text-xs text-black">{formatDate(new Date(doctor.applied_at))}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleDoctorApproval(doctor._id, 'approve')} size="sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button onClick={() => handleDoctorApproval(doctor._id, 'reject')} variant="outline" size="sm">
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
              {doctorApplications.filter(doc => doc.status === 'pending').length === 0 && (
                <p className="text-black text-center py-4">No pending applications</p>
              )}
            </div>
          </div>
        </div>

        <div className="border border-black/20 bg-white">
          <div className="p-6 pb-3">
            <h3 className="text-xl font-semibold text-black">Recent System Activity</h3>
            <p className="text-sm text-black">Latest platform activities</p>
          </div>
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {systemUsers.slice(0, 5).map((user) => (
                <div key={user._id} className="flex items-center justify-between p-2 border border-black/20 rounded bg-white">
                  <div>
                    <p className="font-medium text-black">{user.full_name}</p>
                    <p className="text-sm text-black">{user.role} • {user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-black">{formatDate(new Date(user.created_at))}</p>
                    <span className={`text-xs px-2 py-1 rounded-full border border-black/20 ${
                      user.is_active ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
              {systemUsers.length === 0 && (
                <p className="text-black text-center py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDoctorManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Doctor Management</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {/* Approved Doctors Section */}
      <div className="border border-black/20 bg-white">
        <div className="p-6 pb-3">
          <h3 className="text-xl font-semibold text-black">Approved Doctors</h3>
          <p className="text-sm text-black">Currently active doctors on the platform</p>
        </div>
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <div key={doctor._id} className="flex items-center justify-between p-3 border border-black/20 rounded bg-white">
                <div>
                  <p className="font-medium text-black">{doctor.full_name}</p>
                  <p className="text-sm text-black">
                    {doctor.doctor_profile?.specialization || 'No specialties listed'} • {doctor.email}
                  </p>
                  <p className="text-xs text-black">
                    License: {doctor.doctor_profile?.medical_license || 'N/A'} • 
                    Experience: {doctor.doctor_profile?.experience_years || 0} years
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full border border-black/20 bg-white text-black">
                      Active
                    </span>
                    <Button onClick={() => setSelectedDoctor(doctor)} variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
            {doctors.length === 0 && (
              <p className="text-black text-center py-4">No approved doctors found</p>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Applications Section */}
      <div className="border border-black/20 bg-white">
        <div className="p-6 pb-3">
          <h3 className="text-xl font-semibold text-black">All Doctor Applications</h3>
          <p className="text-sm text-black">Manage doctor applications and approvals</p>
        </div>
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {doctorApplications.map((doctor) => (
              <div key={doctor._id} className="flex items-center justify-between p-3 border border-black/20 rounded bg-white">
                <div>
                  <p className="font-medium text-black">{doctor.full_name}</p>
                  <p className="text-sm text-black">{doctor.specialization || ''} • {doctor.email}</p>
                  <p className="text-xs text-black">Applied: {formatDate(new Date(doctor.applied_at))}</p>
                  <span className={`text-xs px-2 py-1 rounded-full border border-black/20 ${
                    doctor.status === 'approved' ? 'bg-white text-black' :
                    doctor.status === 'rejected' ? 'bg-black text-white' :
                    'bg-white text-black'
                  }`}>
                    {doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {doctor.status === 'pending' && (
                    <>
                      <Button onClick={() => handleDoctorApproval(doctor._id, 'approve')} size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button onClick={() => handleDoctorApproval(doctor._id, 'reject')} variant="outline" size="sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  <Button onClick={() => setSelectedDoctor(doctor)} variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button onClick={() => handleDeleteApplication(doctor._id)} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {doctorApplications.length === 0 && (
              <p className="text-black text-center py-4">No doctor applications found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Users
        </Button>
      </div>

      <div className="border border-black/20 bg-white">
        <div className="p-6 pb-3">
          <h3 className="text-xl font-semibold text-black">All System Users</h3>
          <p className="text-sm text-black">Manage user accounts and permissions</p>
        </div>
        <div className="px-6 pb-6">
          <div className="space-y-3">
            {systemUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between p-3 border border-black/20 rounded bg-white">
                <div>
                  <p className="font-medium text-black">{user.full_name}</p>
                  <p className="text-sm text-black">{user.role} • {user.email}</p>
                  <p className="text-xs text-black">Joined: {formatDate(new Date(user.created_at))}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full border border-black/20 ${
                    user.is_active ? 'bg-white text-black' : 'bg-black text-white'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
            {systemUsers.length === 0 && (
              <p className="text-black text-center py-4">No users found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Analytics</h2>
      <div className="border border-black/20 bg-white">
        <div className="p-6 pb-3">
          <h3 className="text-xl font-semibold text-black">Platform Analytics</h3>
          <p className="text-sm text-black">Detailed insights and metrics</p>
        </div>
        <div className="px-6 pb-6">
          <p className="text-black text-center py-8">Analytics dashboard coming soon...</p>
        </div>
      </div>
    </div>
  );

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white text-black overflow-x-hidden min-h-screen">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 sm:py-12 lg:py-20 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-black">Admin Dashboard</h1>
            <p className="text-black mt-1">
              Monitor platform health and manage resources
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-black" />
            <span className="text-sm text-black">System Healthy</span>
          </div>
        </div>

      {/* Navigation Tabs */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'doctors', label: 'Doctor Management', icon: UserCheck },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-black hover:text-black'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Error State */}
      {error && (
        <div className="border border-black/20 bg-white p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-black mt-0.5" />
            <div className="text-sm text-black">
              <p className="font-medium mb-1">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'doctors' && renderDoctorManagement()}
      {activeTab === 'users' && renderUserManagement()}
      {activeTab === 'analytics' && renderAnalytics()}

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 border border-black/20">
            <h3 className="text-lg font-bold mb-4 text-black">Doctor Application Details</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedDoctor.full_name}</p>
              <p><strong>Email:</strong> {selectedDoctor.email}</p>
              <p><strong>Phone:</strong> {selectedDoctor.doctor_profile?.phone || selectedDoctor.phone || 'N/A'}</p>
              <p><strong>Specialization:</strong> {selectedDoctor.doctor_profile?.specialization || selectedDoctor.specialization || 'N/A'}</p>
              <p><strong>Bio:</strong> {selectedDoctor.doctor_profile?.bio || selectedDoctor.bio || 'N/A'}</p>
              <p><strong>Status:</strong> {selectedDoctor.status || 'Active'}</p>
              <p><strong>Applied At:</strong> {selectedDoctor.applied_at ? formatDate(new Date(selectedDoctor.applied_at)) : 'N/A'}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setSelectedDoctor(null)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
