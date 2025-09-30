import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import { setAuthToken, getAuthToken } from '../utils/auth';

const AuthForm = ({ type = 'login' }) => {
  const popupRef = useRef(null);
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLogin = type === 'login';

  // Log component mount and current auth state
  useEffect(() => {
    console.log('=== AUTH FORM COMPONENT MOUNTED ===');
    console.log('Form type:', type);
    console.log('Is login:', isLogin);
    console.log('Current auth token on mount:', getAuthToken());
    console.log('Current localStorage user on mount:', localStorage.getItem('user'));
    console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL);
  }, [type, isLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password
          };

      const response = await api.post(endpoint, payload);
      const { token, user } = response.data;

      console.log('Regular auth success:', { token, user });
      
      setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Verify that the token was set
      console.log('Token after setting (regular):', getAuthToken());
      console.log('User after setting (regular):', localStorage.getItem('user'));

      // Redirect to dashboard after registration (role can be set later in profile)
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };
const handleGoogleAuth = () => {
  setLoading(true);
  setError('');

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL).replace(/\/$/, '');
  const popup = window.open(`${API_BASE}/auth/google`, 'google-auth', 'width=500,height=650');

  if (!popup) {
    setError('Popup blocked. Allow popups for this site.');
    setLoading(false);
    return;
  }
  popupRef.current = popup;

  // monitor popup close
  const checkClosed = setInterval(() => {
    if (!popupRef.current || popupRef.current.closed) {
      clearInterval(checkClosed);
      setLoading(false);
    }
  }, 500);

  // fallback timeout
  const SAFE_TIMEOUT = 15000;
  const fallback = setTimeout(() => {
    try { if (popupRef.current && !popupRef.current.closed) popupRef.current.close(); } catch(e){}
    setError('Google sign-in timed out or cancelled.');
    setLoading(false);
  }, SAFE_TIMEOUT);

  // message listener lives in your existing useEffect (good) — nothing else needed here
};


  // Listen for messages from Google OAuth popup
useEffect(()=>{
  const allowedOrigin = new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').origin;
  const handler = (event)=>{
    if (event.origin !== allowedOrigin) return;
    if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
      const { token, user } = event.data;
      setAuthToken(token); localStorage.setItem('user', JSON.stringify(user));
      event.source?.postMessage('PARENT_ACK', event.origin); // tell popup it's safe to close
      router.push('/dashboard');
    }
    if (event.data?.type === 'GOOGLE_AUTH_ERROR') { /* handle error */ }
  };
  window.addEventListener('message', handler);
  return ()=> window.removeEventListener('message', handler);
}, [router]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="form-input mt-1"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>



              </>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input mt-1"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                className="form-input mt-1"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 mb-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with email</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <a
                href={isLogin ? '/auth/register' : '/auth/login'}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </a>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;