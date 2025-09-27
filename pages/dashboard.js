import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute';
import ExperienceCard from '../components/ExperienceCard';
import EducationCard from '../components/EducationCard';
import GitHubProjectCard from '../components/GitHubProjectCard';
import api from '../utils/api';

export default function Dashboard({ showToast }) {
  const [user, setUser] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    experiences: { total: 0, verified: 0, pending: 0 },
    education: { total: 0, verified: 0, pending: 0 },
    projects: { total: 0, verified: 0, pending: 0 },
  });

  useEffect(() => {
    // Check user role and redirect if verifier
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.role === 'VERIFIER') {
      window.location.href = '/verifier/dashboard';
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [userResponse, experiencesResponse, educationResponse, projectsResponse] = await Promise.all([
        api.get('/users/me'),
        api.get('/experiences?limit=4'),
        api.get('/education?limit=3'),
        api.get('/github-projects?limit=3'),
      ]);
      console.log("The two responses are: ", educationResponse, projectsResponse);

      setUser(userResponse.data.user || userResponse.data);
      const experiencesData = Array.isArray(experiencesResponse.data?.experiences) 
        ? experiencesResponse.data.experiences 
        : Array.isArray(experiencesResponse.data) 
        ? experiencesResponse.data 
        : [];
      const educationData = Array.isArray(educationResponse.data?.educations) 
        ? educationResponse.data.educations
        : Array.isArray(educationResponse.data) 
        ? educationResponse.data 
        : [];
      const projectsData = Array.isArray(projectsResponse.data?.githubProjects) 
        ? projectsResponse.data.githubProjects 
        : Array.isArray(projectsResponse.data) 
        ? projectsResponse.data 
        : [];
      
      setExperiences(experiencesData);
      setEducation(educationData);
      setProjects(projectsData);
      
      // Calculate stats with safe array operations
      const experienceStats = {
        total: Array.isArray(experiencesData) ? experiencesData.length : 0,
        verified: Array.isArray(experiencesData) ? experiencesData.filter(exp => exp?.verified).length : 0,
        pending: Array.isArray(experiencesData) ? experiencesData.filter(exp => !exp?.verified).length : 0,
      };
      
      const educationStats = {
        total: Array.isArray(educationData) ? educationData.length : 0,
        verified: Array.isArray(educationData) ? educationData.filter(edu => edu?.verified).length : 0,
        pending: Array.isArray(educationData) ? educationData.filter(edu => !edu?.verified).length : 0,
      };
      
      const projectStats = {
        total: Array.isArray(projectsData) ? projectsData.length : 0,
        verified: Array.isArray(projectsData) ? projectsData.filter(proj => proj?.verified).length : 0,
        pending: Array.isArray(projectsData) ? projectsData.filter(proj => !proj?.verified).length : 0,
      };
      
      setStats({
        experiences: experienceStats,
        education: educationStats,
        projects: projectStats,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestVerification = async (experienceId) => {
    const email = prompt('Enter verifier email address:');
    if (!email) return;

    try {
      const response = await api.post(`/verify/request/${experienceId}`, { email });
      showToast('Verification request sent successfully!', 'success');
      
      // Show verification link if email service is not configured
      if (response.data.link) {
        console.log('Verification link:', response.data.link);
        showToast('Verification link logged to console', 'success');
      }
    } catch (error) {
      console.error('Failed to request verification:', error);
      showToast(error.response?.data?.message || 'Failed to send verification request', 'error');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard - TruePortMe</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || user?.firstName || 'User'}!
            </h1>
            <p className="text-gray-600">Manage your experiences and track verifications</p>
          </div>

          {/* Stats Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Portfolio Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Experiences Stats */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Experiences</h3>
                <div className="mt-2 flex justify-center space-x-4 text-sm">
                  <div>
                    <div className="text-xl font-bold text-gray-900">{stats.experiences.total}</div>
                    <div className="text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">{stats.experiences.verified}</div>
                    <div className="text-gray-600">Verified</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-600">{stats.experiences.pending}</div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                </div>
              </div>

              {/* Education Stats */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Education</h3>
                <div className="mt-2 flex justify-center space-x-4 text-sm">
                  <div>
                    <div className="text-xl font-bold text-gray-900">{stats.education.total}</div>
                    <div className="text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">{stats.education.verified}</div>
                    <div className="text-gray-600">Verified</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-600">{stats.education.pending}</div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                </div>
              </div>

              {/* Projects Stats */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Projects</h3>
                <div className="mt-2 flex justify-center space-x-4 text-sm">
                  <div>
                    <div className="text-xl font-bold text-gray-900">{stats.projects.total}</div>
                    <div className="text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">{stats.projects.verified}</div>
                    <div className="text-gray-600">Verified</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-yellow-600">{stats.projects.pending}</div>
                    <div className="text-gray-600">Pending</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/experiences/new" className="btn-primary inline-flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Experience
              </Link>
              <Link href="/education/new" className="btn-primary inline-flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Education
              </Link>
              <Link href="/projects/new" className="btn-primary inline-flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Project
              </Link>
              <Link href="/profile" className="btn-secondary inline-flex items-center justify-center">
                Edit Profile
              </Link>
              <Link href="/experiences" className="btn-secondary inline-flex items-center justify-center">
                View All Experiences
              </Link>
              <Link href={`/portfolio/${user?._id || user?.id}`} className="btn-secondary inline-flex items-center justify-center">
                View Portfolio
              </Link>
            </div>
          </div>

          {/* Recent Items Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Experiences */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Experiences</h2>
                <Link href="/experiences" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all →
                </Link>
              </div>

              {experiences.length > 0 ? (
                <div className="space-y-4">
                  {experiences.slice(0, 2).map((experience) => (
                    <ExperienceCard
                      key={experience._id}
                      experience={experience}
                      showActions={true}
                      onRequestVerification={handleRequestVerification}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No experiences yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first experience.</p>
                  <div className="mt-4">
                    <Link href="/experiences/new" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Add Experience →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Education */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Education</h2>
                <Link href="/education" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all →
                </Link>
              </div>

              {education.length > 0 ? (
                <div className="space-y-4">
                  {education.slice(0, 2).map((edu) => (
                    <EducationCard
                      key={edu.id}
                      education={edu}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No education added yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Add your educational background.</p>
                  <div className="mt-4">
                    <Link href="/education/new" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Add Education →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Projects */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                <Link href="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all →
                </Link>
              </div>

              {projects.length > 0 ? (
                <div className="space-y-4">
                  {projects.slice(0, 2).map((project) => (
                    <GitHubProjectCard
                      key={project.id}
                      project={project}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-200">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No projects added yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Share your GitHub projects.</p>
                  <div className="mt-4">
                    <Link href="/projects/new" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Add Project →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}