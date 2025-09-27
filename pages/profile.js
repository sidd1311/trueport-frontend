import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';
import EducationCard from '../components/EducationCard';
import GitHubProjectCard from '../components/GitHubProjectCard';
import api from '../utils/api';

export default function Profile({ showToast }) {
  const router = useRouter();
  const [user, setUser] = useState({
    name: '',
    email: '',
    institute: '',
    githubUsername: '',
    bio: '',
  });
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchUser();
    fetchEducation();
    fetchProjects();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      console.log(response);
      setUser(response.data.user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEducation = async () => {
    try {
      const response = await api.get('/education?limit=3');
      const educationData = Array.isArray(response.data?.education) 
        ? response.data.education 
        : Array.isArray(response.data) 
        ? response.data 
        : [];
      setEducation(educationData);
    } catch (error) {
      console.error('Failed to fetch education:', error);
      setEducation([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/github-projects?limit=3');
      const projectsData = Array.isArray(response.data?.projects) 
        ? response.data.projects 
        : Array.isArray(response.data) 
        ? response.data 
        : [];
      setProjects(projectsData);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    }
  };

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put('/users/me', user);
      console.log(response);
      setUser(response.data.user);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEducation = async (educationId) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;

    try {
      await api.delete(`/education/${educationId}`);
      showToast('Education entry deleted successfully', 'success');
      fetchEducation();
    } catch (error) {
      console.error('Failed to delete education:', error);
      showToast('Failed to delete education entry', 'error');
    }
  };

  const handleRequestEducationVerification = async (educationId) => {
    try {
      await api.post(`/education/${educationId}/request-verification`);
      showToast('Verification requested successfully', 'success');
      fetchEducation();
    } catch (error) {
      console.error('Failed to request verification:', error);
      showToast(error.response?.data?.message || 'Failed to request verification', 'error');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await api.delete(`/github-projects/${projectId}`);
      showToast('Project deleted successfully', 'success');
      fetchProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
      showToast('Failed to delete project', 'error');
    }
  };

  const handleRequestProjectVerification = async (projectId) => {
    try {
      await api.post(`/github-projects/${projectId}/request-verification`);
      showToast('Verification requested successfully', 'success');
      fetchProjects();
    } catch (error) {
      console.error('Failed to request verification:', error);
      showToast(error.response?.data?.message || 'Failed to request verification', 'error');
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
        <title>Profile - TruePortMe</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your personal information, education, and projects</p>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Personal Info
              </button>
              <button
                onClick={() => setActiveTab('education')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'education'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Education
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                GitHub Projects
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="form-input mt-1"
                      placeholder="John Doe"
                      value={user.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="form-input mt-1"
                      value={user.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="institute" className="block text-sm font-medium text-gray-700">
                      Institute/Organization
                    </label>
                    <input
                      type="text"
                      id="institute"
                      name="institute"
                      required
                      className="form-input mt-1"
                      placeholder="e.g., Harvard University, MIT, Google Inc."
                      value={user.institute || ''}
                      onChange={handleChange}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Your institution helps connect you with verifiers from the same organization
                    </p>
                  </div>

                  <div>
                    <label htmlFor="githubUsername" className="block text-sm font-medium text-gray-700">
                      GitHub Username
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        github.com/
                      </span>
                      <input
                        type="text"
                        id="githubUsername"
                        name="githubUsername"
                        className="form-input rounded-l-none"
                        placeholder="username"
                        value={user.githubUsername}
                        onChange={handleChange}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Your GitHub username will be displayed on your public portfolio
                    </p>
                  </div>

                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      className="form-textarea mt-1"
                      placeholder="Tell us about yourself..."
                      value={user.bio}
                      onChange={handleChange}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Brief description for your profile. This will be visible on your public portfolio.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={fetchUser}
                      className="btn-secondary"
                      disabled={saving}
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Portfolio Link */}
              <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Public Portfolio</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Share your public portfolio with employers and collaborators
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/portfolio/${user._id}`}
                    className="form-input flex-1"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/portfolio/${user._id}`);
                      showToast('Portfolio link copied to clipboard!', 'success');
                    }}
                    className="btn-secondary"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Education Tab */}
          {activeTab === 'education' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                  <p className="text-gray-600">Manage your educational background</p>
                </div>
                <Link href="/education/new" className="btn-primary">
                  Add Education
                </Link>
              </div>

              {education.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No education entries</h3>
                  <p className="mt-2 text-gray-600">Get started by adding your educational background.</p>
                  <Link href="/education/new" className="mt-4 btn-primary inline-flex items-center">
                    Add Education Entry
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {education.map((edu) => (
                      <EducationCard
                        key={edu.id}
                        education={edu}
                        onEdit={() => router.push(`/education/edit/${edu.id}`)}
                        onDelete={() => handleDeleteEducation(edu.id)}
                        onRequestVerification={() => handleRequestEducationVerification(edu.id)}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <Link href="/education" className="text-primary-600 hover:text-primary-700 font-medium">
                      View All Education Entries →
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">GitHub Projects</h2>
                  <p className="text-gray-600">Showcase your coding projects and learnings</p>
                </div>
                <Link href="/projects/new" className="btn-primary">
                  Add Project
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No projects added</h3>
                  <p className="mt-2 text-gray-600">Share your GitHub repositories and what you learned building them.</p>
                  <Link href="/projects/new" className="mt-4 btn-primary inline-flex items-center">
                    Add GitHub Project
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <GitHubProjectCard
                        key={project.id}
                        project={project}
                        onEdit={() => router.push(`/projects/edit/${project.id}`)}
                        onDelete={() => handleDeleteProject(project.id)}
                        onRequestVerification={() => handleRequestProjectVerification(project.id)}
                      />
                    ))}
                  </div>
                  <div className="text-center">
                    <Link href="/projects" className="text-primary-600 hover:text-primary-700 font-medium">
                      View All Projects →
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}