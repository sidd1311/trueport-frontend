import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute';
import GitHubProjectCard from '../../components/GitHubProjectCard';
import Pagination from '../../components/Pagination';
import VerifierSelectionModal from '../../components/VerifierSelectionModal';
import api from '../../utils/api';

export default function GitHubProjects({ showToast }) {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });
  const [verifierModal, setVerifierModal] = useState({ isOpen: false, projectId: null });

  useEffect(() => {
    fetchProjects();
  }, [currentPage, filter, search]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Build query string to match backend expectations
      let queryString = `page=${currentPage}&limit=6`;
      
      if (filter !== 'all') {
        if (filter === 'VERIFIED') {
          queryString += '&verified=true';
        } else if (filter === 'PENDING' || filter === 'REJECTED' || filter === 'NOT_REQUESTED') {
          queryString += '&verified=false';
        }
      }
      
      if (search) {
        queryString += `&search=${encodeURIComponent(search)}`;
      }

      console.log('Fetching projects:', `/github-projects?${queryString}`);
      
      const response = await api.get(`/github-projects?${queryString}`);
      console.log('Full API response:', response.data);

      // Extract data from backend response structure
      const projectsData = response.data.githubProjects || response.data.projects || [];
      const pagination = response.data.pagination || {};
      
      console.log('Projects data:', projectsData);
      console.log('Pagination:', pagination);

      // Calculate stats from the projects
      const calculatedStats = {
        total: pagination.total || projectsData.length,
        verified: projectsData.filter(p => p.verified === true).length,
        pending: projectsData.filter(p => p.verified === false && p.verificationStatus === 'PENDING').length,
        rejected: projectsData.filter(p => p.verificationStatus === 'REJECTED').length
      };

      setProjects(projectsData);
      setTotalPages(pagination.pages || 1);
      setStats(calculatedStats);

    } catch (error) {
      console.error('Failed to fetch GitHub projects:', error);
      console.error('Error details:', error.response?.data);
      
      // Reset to empty state on error
      setProjects([]);
      setTotalPages(1);
      setStats({ total: 0, verified: 0, pending: 0, rejected: 0 });
      
      showToast('Failed to load GitHub projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
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

  const handleRequestVerification = (projectId) => {
    setVerifierModal({ isOpen: true, projectId });
  };

  const handleVerifierModalClose = () => {
    setVerifierModal({ isOpen: false, projectId: null });
  };

  const handleVerifierSelected = () => {
    // Refresh projects to update status
    fetchProjects();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProjects();
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>GitHub Projects - TruePortMe</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GitHub Projects</h1>
                <p className="text-gray-600">Manage your GitHub repositories and showcase your work</p>
              </div>
              <Link
                href="/projects/new"
                className="btn-primary"
              >
                Add New Project
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Projects</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.verified}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search projects by name, technology, or description..."
                    className="form-input flex-1"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn-primary">
                    Search
                  </button>
                </form>
              </div>
              <div className="flex gap-2">
                <select
                  className="form-input"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="PENDING">Pending</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="NOT_REQUESTED">Not Requested</option>
                </select>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No projects found</h3>
              <p className="mt-2 text-gray-600">
                Get started by adding your first GitHub project.
              </p>
              <Link
                href="/projects/new"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Add GitHub Project
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {projects.map((project) => (
                  <GitHubProjectCard
                    key={project._id}
                    project={project}
                    onEdit={() => router.push(`/projects/edit/${project._id}`)}
                    onDelete={() => handleDelete(project._id)}
                    onRequestVerification={() => handleRequestVerification(project._id)}
                    showToast={showToast}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>

        {/* Verifier Selection Modal */}
        <VerifierSelectionModal
          isOpen={verifierModal.isOpen}
          onClose={handleVerifierModalClose}
          onSelectVerifier={handleVerifierSelected}
          itemType="GITHUB_PROJECT"
          itemId={verifierModal.projectId}
          showToast={showToast}
        />
      </div>
    </ProtectedRoute>
  );
}