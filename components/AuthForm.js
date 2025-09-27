import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../utils/api';
import { setAuthToken } from '../utils/auth';

const AuthForm = ({ type = 'login' }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    institute: '',
    role: 'STUDENT',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isLogin = type === 'login';

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
            password: formData.password,
            institute: formData.institute,
            role: formData.role
          };

      const response = await api.post(endpoint, payload);
      const { token, user } = response.data;

      setAuthToken(token);
      localStorage.setItem('user', JSON.stringify(user));

      // Role-based routing
      if (user.role === 'VERIFIER') {
        router.push('/verifier/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

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

                <div>
                  <label htmlFor="institute" className="block text-sm font-medium text-gray-700">
                    Institute/Organization
                  </label>
                  <input
                    id="institute"
                    name="institute"
                    type="text"
                    required
                    className="form-input mt-1"
                    placeholder="e.g., Harvard University, MIT, Google Inc."
                    value={formData.institute}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    I am a
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    className="form-input mt-1"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="VERIFIER">Verifier/Faculty</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Students create portfolios. Verifiers can approve students from their institution.
                  </p>
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