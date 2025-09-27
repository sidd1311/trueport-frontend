import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { isAuthenticated, logout } from '../utils/auth';

const Navbar = () => {
  const router = useRouter();
  const authenticated = isAuthenticated();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (authenticated) {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    }
  }, [authenticated]);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              TruePortMe
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {authenticated ? (
              <>
                {user?.role === 'VERIFIER' ? (
                  // Verifier Navigation
                  <>
                    <Link 
                      href="/verifier/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        router.pathname === '/verifier/dashboard' 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/verifier/requests"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        router.pathname.startsWith('/verifier/requests') 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Requests
                    </Link>
                    <Link 
                      href="/verifier/students"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        router.pathname.startsWith('/verifier/students') 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Students
                    </Link>
                  </>
                ) : (
                  // Student Navigation
                  <>
                    <Link 
                      href="/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        router.pathname === '/dashboard' 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/experiences"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        router.pathname.startsWith('/experiences') 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Experiences
                    </Link>
                    <Link 
                      href="/education"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        router.pathname.startsWith('/education') 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Education
                    </Link>
                    <Link 
                      href="/projects"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        router.pathname.startsWith('/projects') 
                          ? 'text-primary-600 bg-primary-50' 
                          : 'text-gray-700 hover:text-primary-600'
                      }`}
                    >
                      Projects
                    </Link>
                  </>
                )}
                <Link 
                  href="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    router.pathname === '/profile' 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  Profile
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login"
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;