import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export function DoctorRegistration({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    doctor_id: '',
    name: '',
    email: '',
    phone: '',
    specialty: '',
    gender: '',
    experience_years: '',
    qualification: '',
    hospital_name: '',
    address: '',
    appointment_fee: '',
    password: '',
    confirmPassword: '',
    profile_image: '',
    degree_certificate_image: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, [name]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const requiredFields = [
      ['doctor_id', 'Doctor ID'],
      ['name', 'Name'],
      ['email', 'Email'],
      ['phone', 'Phone number'],
      ['specialty', 'Specialist'],
      ['gender', 'Gender'],
      ['experience_years', 'Experience'],
      ['qualification', 'Qualification'],
      ['hospital_name', 'Hospital name'],
      ['address', 'Address'],
      ['appointment_fee', 'Fees'],
      ['password', 'Password'],
    ];

    for (const [key, label] of requiredFields) {
      if (!String(formData[key] || '').trim()) {
        setError(`${label} is required`);
        return;
      }
    }

    if (!formData.profile_image) {
      setError('Doctor image is required');
      return;
    }
    if (!formData.degree_certificate_image) {
      setError('Degree certificate image is required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/doctor/register`, {
        doctor_id: formData.doctor_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialty: formData.specialty,
        gender: formData.gender,
        experience_years: parseInt(formData.experience_years, 10) || 0,
        qualification: formData.qualification,
        hospital_name: formData.hospital_name,
        address: formData.address,
        appointment_fee: parseFloat(formData.appointment_fee) || 0,
        password: formData.password,
        profile_image: formData.profile_image,
        degree_certificate_image: formData.degree_certificate_image,
        preferred_language: 'en',
      });

      if (res.data.success) {
        setSuccess('Registration successful! Your doctor account is pending system manager approval.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onBack) onBack();
        }, 1500);
      } else {
        setError(res.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ['doctor_id', 'Doctor ID', 'text'],
    ['name', 'Doctor Name', 'text'],
    ['email', 'Email', 'email'],
    ['phone', 'Phone Number', 'tel'],
    ['specialty', 'Specialist', 'text'],
    ['experience_years', 'Experience (Years)', 'number'],
    ['qualification', 'Qualification', 'text'],
    ['hospital_name', 'Hospital Name', 'text'],
    ['appointment_fee', 'Fees', 'number'],
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-blue-600 hover:text-blue-700 font-semibold mb-6">
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
          <h1 className="text-3xl font-black text-blue-900 mb-2">Doctor Registration</h1>
          <p className="text-slate-600 mb-8">Register with doctor ID and password. Approval is required before login.</p>

          {error && <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">{error}</div>}
          {success && <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(([name, label, type]) => (
              <div key={name}>
                <label className="block text-sm font-medium text-slate-700 mb-2">{label} *</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                className="w-full border border-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Doctor Image *</label>
              <input type="file" name="profile_image" accept="image/*" onChange={handleFileChange} className="w-full border border-slate-200 rounded-lg px-4 py-3" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Degree Certificate Image *</label>
              <input type="file" name="degree_certificate_image" accept="image/*" onChange={handleFileChange} className="w-full border border-slate-200 rounded-lg px-4 py-3" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 mt-6">
              {loading ? 'Registering...' : 'Register as Doctor'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
