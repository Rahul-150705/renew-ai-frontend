import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaShieldAlt, FaEnvelope, FaIdCard } from 'react-icons/fa';
import { authAPI } from '../services/api';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.fullName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.signup({
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        email: formData.email,
      });
      
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Signup failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <FaShieldAlt className="text-3xl text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground mt-1">Join Renew AI Insurance Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="fullName" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FaIdCard className="text-muted-foreground" />
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border
                  text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FaEnvelope className="text-muted-foreground" />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border
                  text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FaUser className="text-muted-foreground" />
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border
                  text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FaLock className="text-muted-foreground" />
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    transition-all duration-200 disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                  Confirm
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm"
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    transition-all duration-200 disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-primary text-white font-semibold
                hover:opacity-90 transition-all duration-200 disabled:opacity-50
                shadow-glow"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
