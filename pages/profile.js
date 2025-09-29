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
    role: 'STUDENT',
  });
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [institutionStatus, setInstitutionStatus] = useState('NONE'); // NONE, PENDING, APPROVED, REJECTED
  const [institutionRequest, setInstitutionRequest] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchEducation();
    fetchProjects();
    fetchInstitutionStatus();
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

  const fetchInstitutionStatus = async () => {
    try {
      const response = await api.get('/associations/my-requests');
      setInstitutionStatus(response.data.status || 'NONE');
      setInstitutionRequest(response.data.request || null);
    } catch (error) {
      console.error('Failed to fetch institution status:', error);
      // If endpoint doesn't exist yet, assume NONE status
      setInstitutionStatus('NONE');
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

  const handleInstitutionRequest = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (user.role === 'STUDENT') {
        // For students, submit a request for approval
        const response = await api.post('/associations/request', {
          institute: user.institute,
          requestedRole: user.role
        });
        setInstitutionStatus('PENDING');
        setInstitutionRequest(response.data.request);
        showToast('Institution association request submitted! Waiting for verifier approval.', 'success');
      } else {
        // For verifiers, update directly (they can self-approve)
        const response = await api.put('/users/me', user);
        setUser(response.data.user);
        setInstitutionStatus('APPROVED');
        showToast('Institution association updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to request institution association:', error);
      showToast(error.response?.data?.message || 'Failed to submit request', 'error');
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
                onClick={() => setActiveTab('institution')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'institution'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Institution
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

          {/* Institution Association Tab */}
          {activeTab === 'institution' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Institution Association</h3>
                  <p className="text-sm text-gray-600">
                    Associate yourself with an institution and set your role to connect with verifiers and showcase your credentials.
                  </p>
                </div>

                {/* Current Association Status */}
                {institutionStatus !== 'NONE' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">Current Association Status</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        institutionStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        institutionStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {institutionStatus === 'APPROVED' ? 'Approved' :
                         institutionStatus === 'PENDING' ? 'Pending Approval' :
                         'Rejected'}
                      </span>
                    </div>
                    {institutionRequest && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Institution:</span> {institutionRequest.institute}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Role:</span> {institutionRequest.role}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Requested on: {new Date(institutionRequest.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {institutionStatus === 'PENDING' && (
                          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                              Your request is pending approval from a verifier at your institution. You'll be notified once it's reviewed.
                            </p>
                          </div>
                        )}
                        {institutionStatus === 'REJECTED' && institutionRequest.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800">
                              <span className="font-medium">Rejection Reason:</span> {institutionRequest.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Association Form */}
                {(institutionStatus === 'NONE' || institutionStatus === 'REJECTED') && (
                  <form onSubmit={handleInstitutionRequest} className="space-y-6">
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Your Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        className="form-input mt-1"
                        value={user.role || 'STUDENT'}
                        onChange={handleChange}
                        disabled={institutionStatus === 'PENDING'}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="VERIFIER">Verifier/Faculty</option>
                      </select>
                      <p className="mt-2 text-sm text-gray-500">
                        {user.role === 'STUDENT' 
                          ? 'Students need approval from a verifier at their institution to complete association.'
                          : 'Verifiers can directly associate with their institution without approval.'
                        }
                      </p>
                    </div>

                    <div>
                      <label htmlFor="institute" className="block text-sm font-medium text-gray-700">
                        Institution/Organization
                      </label>
                      <input
                        type="text"
                        id="institute"
                        name="institute"
                        className="form-input mt-1"
                        placeholder="e.g., Harvard University, MIT, Google Inc."
                        value={user.institute || ''}
                        onChange={handleChange}
                        disabled={institutionStatus === 'PENDING'}
                        required
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        {user.role === 'STUDENT' 
                          ? 'Enter the exact name of your institution. A verifier from this institution will need to approve your request.'
                          : 'Your institution helps connect you with students from the same organization.'
                        }
                      </p>
                    </div>

                    {user.role === 'STUDENT' && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-amber-800">
                              Approval Required
                            </h3>
                            <div className="mt-2 text-sm text-amber-700">
                              <p>As a student, your institution association request will be sent to verifiers at your institution for approval. Make sure:</p>
                              <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>You enter the correct and complete institution name</li>
                                <li>There are verifiers from your institution registered on the platform</li>
                                <li>Your profile information is complete and accurate</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {user.role === 'VERIFIER' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                              Verifier Privileges
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                              <p>As a verifier, you can:</p>
                              <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Directly associate with your institution</li>
                                <li>Approve student association requests from your institution</li>
                                <li>Verify student credentials and achievements</li>
                                <li>Access the verifier dashboard to manage requests</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          fetchUser();
                          fetchInstitutionStatus();
                        }}
                        className="btn-secondary"
                        disabled={saving}
                      >
                        Refresh
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={saving || !user.institute || institutionStatus === 'PENDING'}
                      >
                        {saving ? 'Submitting...' : 
                         user.role === 'STUDENT' ? 'Submit Request' : 'Save Association'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Approved Association Info */}
                {institutionStatus === 'APPROVED' && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">
                            Institution Association Approved
                          </h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>You are now associated with <span className="font-medium">{user.institute}</span> as a {user.role.toLowerCase()}.</p>
                            {user.role === 'STUDENT' && (
                              <p className="mt-1">You can now request verifications from faculty at your institution and showcase your verified credentials.</p>
                            )}
                            {user.role === 'VERIFIER' && (
                              <p className="mt-1">You can now approve student requests and verify credentials from students at your institution.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {user.role === 'VERIFIER' && (
                      <div className="text-center">
                        <Link href="/verifier/requests" className="btn-primary">
                          Go to Verifier Dashboard
                        </Link>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Update Profile Information
                        </label>
                        <p className="text-sm text-gray-500 mb-4">
                          You can still update your profile information while maintaining your institution association.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="institute-display" className="block text-sm font-medium text-gray-700">
                          Current Institution
                        </label>
                        <input
                          type="text"
                          id="institute-display"
                          className="form-input mt-1 bg-gray-50"
                          value={user.institute || ''}
                          disabled
                        />
                        <p className="mt-2 text-sm text-gray-500">
                          To change your institution, you'll need to submit a new association request.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="role-display" className="block text-sm font-medium text-gray-700">
                          Current Role
                        </label>
                        <input
                          type="text"
                          id="role-display"
                          className="form-input mt-1 bg-gray-50"
                          value={user.role || ''}
                          disabled
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setInstitutionStatus('NONE');
                            setInstitutionRequest(null);
                          }}
                          className="btn-secondary text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Request New Association
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
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