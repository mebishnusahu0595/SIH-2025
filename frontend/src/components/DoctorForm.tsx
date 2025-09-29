"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save, User, Mail, Phone, FileText, Stethoscope, GraduationCap, Clock, Building, DollarSign } from "lucide-react";

interface DoctorData {
  _id?: string;
  full_name: string;
  email: string;
  phone: string;
  medical_license: string;
  specialization: string[];
  qualification: string;
  experience_years: number;
  hospital_affiliation?: string;
  consultation_fee: number;
  bio?: string;
}

interface DoctorFormProps {
  doctor?: DoctorData;
  onSubmit: (doctorData: DoctorData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function DoctorForm({ doctor, onSubmit, onCancel, isLoading = false }: DoctorFormProps) {
  const [formData, setFormData] = useState<DoctorData>({
    full_name: '',
    email: '',
    phone: '',
    medical_license: '',
    specialization: [],
    qualification: '',
    experience_years: 0,
    hospital_affiliation: '',
    consultation_fee: 0,
    bio: ''
  });

  const [specializationInput, setSpecializationInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Common specializations for suggestions
  const commonSpecializations = [
    'General Medicine', 'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics',
    'Pediatrics', 'Psychiatry', 'Gynecology', 'Oncology', 'Radiology',
    'Anesthesiology', 'Emergency Medicine', 'Family Medicine', 'Internal Medicine'
  ];

  useEffect(() => {
    if (doctor) {
      setFormData(doctor);
      setSpecializationInput(doctor.specialization.join(', '));
    }
  }, [doctor]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.medical_license.trim()) {
      newErrors.medical_license = 'Medical license is required';
    }

    if (formData.specialization.length === 0) {
      newErrors.specialization = 'At least one specialization is required';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualification is required';
    }

    if (formData.experience_years < 0) {
      newErrors.experience_years = 'Experience years cannot be negative';
    }

    if (formData.consultation_fee <= 0) {
      newErrors.consultation_fee = 'Consultation fee must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof DoctorData, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSpecializationChange = (value: string) => {
    setSpecializationInput(value);
    const specializations = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleInputChange('specialization', specializations);
  };

  const addSpecialization = (spec: string) => {
    const current = specializationInput ? specializationInput.split(',').map(s => s.trim()) : [];
    if (!current.includes(spec)) {
      const newSpecs = [...current, spec].join(', ');
      setSpecializationInput(newSpecs);
      handleSpecializationChange(newSpecs);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {doctor ? 'Edit Doctor' : 'Add New Doctor'}
            </CardTitle>
            <CardDescription>
              {doctor ? 'Update doctor information' : 'Enter details for the new doctor'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Full Name *
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Dr. John Doe"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="doctor@hospital.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Medical License *
                </label>
                <Input
                  value={formData.medical_license}
                  onChange={(e) => handleInputChange('medical_license', e.target.value)}
                  placeholder="ML12345678"
                  className={errors.medical_license ? 'border-red-500' : ''}
                />
                {errors.medical_license && (
                  <p className="text-red-500 text-xs mt-1">{errors.medical_license}</p>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Stethoscope className="h-4 w-4 inline mr-1" />
                  Specialization *
                </label>
                <Input
                  value={specializationInput}
                  onChange={(e) => handleSpecializationChange(e.target.value)}
                  placeholder="Enter specializations separated by commas"
                  className={errors.specialization ? 'border-red-500' : ''}
                />
                {errors.specialization && (
                  <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>
                )}
                
                {/* Specialization suggestions */}
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-2">Quick add:</p>
                  <div className="flex flex-wrap gap-1">
                    {commonSpecializations.slice(0, 8).map((spec) => (
                      <Button
                        key={spec}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-6 px-2"
                        onClick={() => addSpecialization(spec)}
                      >
                        {spec}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <GraduationCap className="h-4 w-4 inline mr-1" />
                    Qualification *
                  </label>
                  <Input
                    value={formData.qualification}
                    onChange={(e) => handleInputChange('qualification', e.target.value)}
                    placeholder="MBBS, MD"
                    className={errors.qualification ? 'border-red-500' : ''}
                  />
                  {errors.qualification && (
                    <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Experience (Years) *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => handleInputChange('experience_years', parseInt(e.target.value) || 0)}
                    placeholder="5"
                    className={errors.experience_years ? 'border-red-500' : ''}
                  />
                  {errors.experience_years && (
                    <p className="text-red-500 text-xs mt-1">{errors.experience_years}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <DollarSign className="h-4 w-4 inline mr-1" />
                    Consultation Fee (₹) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.consultation_fee}
                    onChange={(e) => handleInputChange('consultation_fee', parseInt(e.target.value) || 0)}
                    placeholder="500"
                    className={errors.consultation_fee ? 'border-red-500' : ''}
                  />
                  {errors.consultation_fee && (
                    <p className="text-red-500 text-xs mt-1">{errors.consultation_fee}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Building className="h-4 w-4 inline mr-1" />
                  Hospital Affiliation
                </label>
                <Input
                  value={formData.hospital_affiliation || ''}
                  onChange={(e) => handleInputChange('hospital_affiliation', e.target.value)}
                  placeholder="City General Hospital"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Bio
                </label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Brief description about the doctor..."
                  className="w-full p-2 border rounded-md resize-none h-20"
                  rows={3}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : (doctor ? 'Update Doctor' : 'Add Doctor')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}