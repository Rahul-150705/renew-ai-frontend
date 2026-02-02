import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaShieldAlt } from 'react-icons/fa';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login(credentials);
      const { token, agentId, username, fullName, email } = response.data;
      
      login(token, { agentId, username, fullName, email });
      
      toast.success(`Welcome back, ${fullName}!`);
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
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
            <h1 className="text-2xl font-bold text-foreground">Renew AI</h1>
            <p className="text-muted-foreground mt-1">Insurance Renewal Automation Platform</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FaUser className="text-muted-foreground" />
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter your username"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border
                  text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FaLock className="text-muted-foreground" />
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border
                  text-foreground placeholder:text-muted-foreground
                  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                  transition-all duration-200 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-primary text-white font-semibold
                hover:opacity-90 transition-all duration-200 disabled:opacity-50
                shadow-glow"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-2">Demo Credentials:</p>
            <p className="text-sm text-foreground">
              <strong>Username:</strong> agent1 | <strong>Password:</strong> password123
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
