import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../utils/api';

export default function NewProject({ showToast }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    repositoryUrl: '',
    liveUrl: '',
    technologies: [],
    learnings: '',
  });
  const [loading, setLoading] = useState(false);
  const [techInput, setTechInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const addTechnology = (e) => {
    e.preventDefault();
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const removeTechnology = (tech) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/github-projects', formData);
      showToast('GitHub project added successfully!', 'success');
      router.push('/projects');
    } catch (error) {
      console.error('Failed to create GitHub project:', error);
      showToast(error.response?.data?.message || 'Failed to create GitHub project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Add GitHub Project - TruePortMe</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Add GitHub Project</h1>
            <p className="text-gray-600">Share your coding projects and what you learned from them</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  required
                  className="form-input mt-1"
                  placeholder="e.g., E-commerce Website, Todo App"
                  value={formData.projectName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Project Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  className="form-textarea mt-1"
                  placeholder="Describe what your project does, its main features, and purpose..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="repositoryUrl" className="block text-sm font-medium text-gray-700">
                    GitHub Repository URL *
                  </label>
                  <input
                    type="url"
                    id="repositoryUrl"
                    name="repositoryUrl"
                    required
                    className="form-input mt-1"
                    placeholder="https://github.com/username/repository"
                    value={formData.repositoryUrl}
                    onChange={handleChange}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Make sure your repository is public for verification
                  </p>
                </div>

                <div>
                  <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-700">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    id="liveUrl"
                    name="liveUrl"
                    className="form-input mt-1"
                    placeholder="https://your-project.vercel.app"
                    value={formData.liveUrl}
                    onChange={handleChange}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Optional: Link to deployed version
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technologies Used
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    className="form-input flex-1"
                    placeholder="Enter technology (e.g., React, Node.js, Python)"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTechnology(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addTechnology}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                
                {formData.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
                          className="ml-2 text-primary-600 hover:text-primary-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="learnings" className="block text-sm font-medium text-gray-700">
                  Key Learnings *
                </label>
                <textarea
                  id="learnings"
                  name="learnings"
                  required
                  rows={6}
                  className="form-textarea mt-1"
                  placeholder="What did you learn while building this project? What challenges did you face and how did you solve them? What would you do differently next time?"
                  value={formData.learnings}
                  onChange={handleChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  This is important for verification - share your genuine learning experience
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Verification Requirements</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>GitHub repository must be public and contain meaningful code</li>
                        <li>Repository should have a proper README file</li>
                        <li>Code should demonstrate the technologies you've listed</li>
                        <li>Learning description should be authentic and detailed</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}