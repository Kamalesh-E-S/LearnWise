import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, UserPlus, LogIn, Loader, AlertCircle } from 'lucide-react';
import api from '../lib/axios';

export function Auth() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser, setToken } = useAuthStore();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simple validation
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (isSignUp) {
        // Signup request
        const signupData = new URLSearchParams();
        signupData.append('email', email);
        signupData.append('password', password);
        
        const response = await api.post('/auth/signup', signupData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        if (response.data) {
          // After successful signup, automatically login
          const loginData = new URLSearchParams();
          loginData.append('username', email);  // OAuth2 expects username
          loginData.append('password', password);
          loginData.append('grant_type', 'password');  // Required for OAuth2
          
          const loginResponse = await api.post('/auth/login', loginData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          
          if (loginResponse.data) {
            const { access_token } = loginResponse.data;
            setToken(access_token);
            localStorage.setItem('token', access_token);
            
            // Set auth header for subsequent requests
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            
            // Get user profile
            const userResponse = await api.get('/auth/me');
            if (userResponse.data) {
              setUser(userResponse.data);
              navigate('/ongoing');
            }
          }
        }
      } else {
        // Login request
        const loginData = new URLSearchParams();
        loginData.append('username', email);  // OAuth2 expects username
        loginData.append('password', password);
        loginData.append('grant_type', 'password');  // Required for OAuth2
        
        const response = await api.post('/auth/login', loginData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        if (response.data) {
          const { access_token } = response.data;
          setToken(access_token);
          localStorage.setItem('token', access_token);
          
          // Set auth header for subsequent requests
          api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
          
          // Get user profile
          const userResponse = await api.get('/auth/me');
          if (userResponse.data) {
            setUser(userResponse.data);
            navigate('/ongoing');
          }
        }
      }
    } catch (err) {
      console.error('Auth error:', err.response || err);
      let errorMessage = 'An error occurred during authentication';
      
      if (err.response?.data?.detail) {
        // Handle array of validation errors
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail[0].msg;
        } else {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={5}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : isSignUp ? (
              <>
                <UserPlus className="h-5 w-5" />
                Sign Up
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="ml-1 text-blue-600 hover:text-blue-800"
            disabled={loading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}