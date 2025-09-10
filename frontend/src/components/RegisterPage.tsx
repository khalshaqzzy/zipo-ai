import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import zipoLogo from '../../assets/zipo_white.png';

interface RegisterPageProps {
  onRegisterSuccess: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const passwordRequirements = [
    { text: 'At least 8 characters', met: formData.password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { text: 'Contains number', met: /\d/.test(formData.password) },
  ];

  const passwordStrength = passwordRequirements.filter(req => req.met).length;
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length > 15) {
      newErrors.username = 'Username cannot exceed 15 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRequirements.every(req => req.met)) {
      newErrors.password = 'Password does not meet requirements';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register.');
      }
      
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => onRegisterSuccess(), 2000);

    } catch (err: any) {
      setErrors({ api: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Minimal Background Elements */}
      <div className="absolute inset-0">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23000000%22 fill-opacity=%220.02%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        {/* Minimal floating elements */}
        {mounted && [...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-black/10 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className={`text-center mb-12 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center gap-4 mb-8">
              <div className="relative">
                <img src={zipoLogo} alt="Zipo Logo" className="w-16 h-16" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-black">
                  Zipo
                </h1>
                <p className="text-sm text-gray-600 font-medium">AI Learning Platform</p>
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-black">Join the Future</h2>
              <p className="text-xl text-gray-700">Create your account and start learning</p>
            </div>
          </div>

          {/* Register Form */}
          <div className={`bg-white border border-gray-200 rounded-3xl shadow-lg p-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '200ms' }}>
            <form onSubmit={handleSubmit} className="space-y-8">
              {errors.api && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl animate-in slide-in-from-left-2 duration-300">
                  <p className="text-red-700 text-sm font-medium">{errors.api}</p>
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-2xl animate-in slide-in-from-left-2 duration-300">
                  <p className="text-green-700 text-sm font-medium">{success}</p>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-3">
                <label htmlFor="username" className="text-sm font-semibold text-black tracking-wide">
                  Username
                </label>
                <div className="relative group">
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full px-6 py-4 border-2 rounded-2xl focus:outline-none transition-all duration-300 bg-white ${
                      errors.username
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-black hover:border-gray-300'
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && <p className="text-red-600 text-sm font-medium">{errors.username}</p>}
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-semibold text-black tracking-wide">
                  Password
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-6 py-4 pr-14 border-2 rounded-2xl focus:outline-none transition-all duration-300 bg-white ${
                      errors.password
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-black hover:border-gray-300'
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-4 p-5 bg-gray-50 rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-black">Password Strength</p>
                      <span className={`text-sm font-bold text-white px-3 py-1 rounded-full ${strengthColors[passwordStrength - 1] || 'bg-gray-400'}`}>
                        {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-gray-200'}`}>
                            {req.met && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm ${req.met ? 'text-green-600 font-medium' : 'text-gray-500'}`}>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {errors.password && <p className="text-red-600 text-sm font-medium">{errors.password}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-3">
                <label htmlFor="confirmPassword" className="text-sm font-semibold text-black tracking-wide">
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-6 py-4 pr-14 border-2 rounded-2xl focus:outline-none transition-all duration-300 bg-white ${
                      errors.confirmPassword
                        ? 'border-red-300 focus:border-red-500'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-gray-200 focus:border-black hover:border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-sm font-medium">{errors.confirmPassword}</p>}
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={isLoading} className="w-full bg-black hover:bg-gray-800 text-white font-bold py-5 px-8 rounded-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-3 text-lg shadow-lg hover:shadow-xl">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-10 text-center">
              <p className="text-gray-700 text-lg">
                Already have an account?{' '}
                <button onClick={() => navigate('/login')} className="text-black font-bold hover:underline transition-all duration-200">
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;