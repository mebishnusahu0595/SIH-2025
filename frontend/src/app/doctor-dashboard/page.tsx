"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart3, 
  Clock,
  Star,
  Plus,
  Eye,
  Heart,
  TrendingUp,
  FileText,
  UserCheck
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface DoctorStats {
  totalPatients: number;
  todayAppointments: number;
  weeklyAppointments: number;
  monthlyRevenue: number;
  averageRating: number;
  totalSessions: number;
}

interface Patient {
  _id: string;
  full_name: string;
  email: string;
  lastSession: string;
  nextAppointment?: string;
  status: 'active' | 'inactive';
  moodTrend: 'improving' | 'stable' | 'declining';
}

interface Appointment {
  _id: string;
  patient_name: string;
  patient_email: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export default function DoctorDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DoctorStats>({
    totalPatients: 0,
    todayAppointments: 0,
    weeklyAppointments: 0,
    monthlyRevenue: 0,
    averageRating: 0,
    totalSessions: 0
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('DoctorDashboard: useEffect triggered', { user: user?.email, role: user?.role });
    if (user && user.role !== 'doctor') {
      console.log('DoctorDashboard: redirecting to dashboard - not a doctor');
      router.push('/dashboard');
      return;
    }
    
    if (user && user.role === 'doctor') {
      console.log('DoctorDashboard: loading doctor data');
      loadDoctorData();
    }
  }, [user, router]);

  const loadDoctorData = async () => {
    console.log('DoctorDashboard: loadDoctorData called');
    try {
      // TODO: Replace with actual API calls to fetch doctor stats, patients, and appointments
      const newStats = {
        totalPatients: 0,
        todayAppointments: 0,
        weeklyAppointments: 0,
        monthlyRevenue: 0,
        averageRating: 0,
        totalSessions: 0
      };
      console.log('DoctorDashboard: setting stats to', newStats);
      setStats(newStats);

      console.log('DoctorDashboard: setting patients to empty array');
      setPatients([]);
      
      console.log('DoctorDashboard: setting appointments to empty array');
      setAppointments([]);

      setLoading(false);
      console.log('DoctorDashboard: loading set to false');
    } catch (error) {
      console.error('Error loading doctor data:', error);
      setLoading(false);
    }
  };

  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-black" />;
      case 'stable':
        return <Heart className="h-4 w-4 text-black" />;
      case 'declining':
        return <TrendingUp className="h-4 w-4 text-black transform rotate-180" />;
      default:
        return <Heart className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-black';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-black">Doctor Dashboard</h1>
            <p className="text-black mt-2">Welcome back, Dr. {user?.full_name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => router.push('/doctor-dashboard/schedule')} 
              className="bg-white text-black border border-black hover:bg-black hover:text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment 
            </Button>
            <Button variant="outline" onClick={logout}>
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-black">
                <Users className="h-4 w-4 mr-2 text-black" />
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalPatients}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-black">
                <Calendar className="h-4 w-4 mr-2 text-black" />
                Today&apos;s Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.todayAppointments}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-black">
                <Clock className="h-4 w-4 mr-2 text-black" />
                Weekly Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.weeklyAppointments}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-black">
                <BarChart3 className="h-4 w-4 mr-2 text-black" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">${stats.monthlyRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-black">
                <Star className="h-4 w-4 mr-2 text-black" />
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.averageRating}★</div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center text-black">
                <MessageSquare className="h-4 w-4 mr-2 text-black" />
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-black">{stats.totalSessions}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Today's Appointments */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center text-black">
                <Calendar className="h-5 w-5 mr-2 text-black" />
                Today&apos;s Appointments
              </CardTitle>
              <CardDescription className="text-black">Your scheduled sessions for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.slice(0, 3).map((appointment) => (
                  <div key={appointment._id} className="flex items-center justify-between p-4 rounded-lg bg-white border border-black/20">
                    <div className="flex-1">
                      <p className="font-semibold text-black">{appointment.patient_name}</p>
                      <p className="text-sm text-black">{appointment.time} - {appointment.type}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-black text-center py-8">No appointments scheduled for today</p>
                )}
                <Button variant="outline" className="w-full">
                  View All Appointments
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Patients */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center text-black">
                <Users className="h-5 w-5 mr-2 text-black" />
                Recent Patients
              </CardTitle>
              <CardDescription className="text-black">Patients with recent activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patients.map((patient) => (
                  <div key={patient._id} className="flex items-center justify-between p-4 rounded-lg bg-white border border-black/20">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-white border border-black flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-black" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">{patient.full_name}</p>
                        <p className="text-sm text-black">Last session: {formatDate(patient.lastSession)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getMoodTrendIcon(patient.moodTrend)}
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Patients
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-black">Quick Actions</CardTitle>
            <CardDescription className="text-black">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Plus className="h-6 w-6 text-black" />
                <span>New Appointment</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <FileText className="h-6 w-6 text-black" />
                <span>Patient Notes</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <MessageSquare className="h-6 w-6 text-black" />
                <span>Messages</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <BarChart3 className="h-6 w-6 text-black" />
                <span>Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
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