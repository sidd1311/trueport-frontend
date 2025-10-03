import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import ExperienceCard from '../../components/ExperienceCard';
import EducationCard from '../../components/EducationCard';
import ProjectCard from '../../components/ProjectCard';
import api from '../../utils/api';
import { getDisplayName, getInitials } from '../../utils/nameUtils';

export default function PublicPortfolio() {
  const router = useRouter();
  const { userId } = router.query;
  const [user, setUser] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [githubRepos, setGithubRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [githubLoading, setGithubLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchPortfolioData();
    }
  }, [userId]);

  const fetchPortfolioData = async () => {
    try {
      const response = await api.get(`/portfolio/${userId}`);
      console.log("Users is: ",response);
      setUser(response.data.user);
      setExperiences(Array.isArray(response.data.experiences) ? response.data.experiences : []);
      setEducation(Array.isArray(response.data.education) ? response.data.education : []);
      setProjects(Array.isArray(response.data.projects) ? response.data.projects : Array.isArray(response.data.githubProjects) ? response.data.githubProjects : []);
      
      // Fetch GitHub repos if username exists and is visible
      if (response.data.user?.contactVisibility?.githubUsername && response.data.user?.contactInfo?.githubUsername) {
        fetchGithubRepos(response.data.user.contactInfo.githubUsername);
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGithubRepos = async (username) => {
    setGithubLoading(true);
    try {
      const response = await api.get(`/github/public/${username}`);
      const reposData = Array.isArray(response.data) ? response.data : [];
      setGithubRepos(reposData.slice(0, 6)); // Show top 6 repos
    } catch (error) {
      console.error('Failed to fetch GitHub repos:', error);
    } finally {
      setGithubLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Portfolio Not Found</h3>
          <p className="mt-1 text-sm text-gray-500">This portfolio doesn't exist or is not public.</p>
          <div className="mt-6">
            <Link href="/" className="btn-primary">
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const verifiedExperiences = Array.isArray(experiences) ? experiences.filter(exp => exp?.verified) : [];
  const verifiedEducation = Array.isArray(education) ? education.filter(edu => edu?.verified) : [];
  const publicProjects = Array.isArray(projects) ? projects.filter(proj => proj?.isPublic !== false) : [];
  
  // Sort education by passing year (latest first)
  const sortedEducation = verifiedEducation.length > 0 ? [...verifiedEducation].sort((a, b) => (b?.passingYear || 0) - (a?.passingYear || 0)) : [];
  
  // Sort projects by creation date (latest first) 
  const sortedProjects = [...publicProjects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const stats = {
    totalExperiences: experiences.length,
    verifiedExperiences: verifiedExperiences.length,
    verifiedEducation: verifiedEducation.length,
    publicProjects: publicProjects.length,
    githubRepos: githubRepos.length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{getDisplayName(user)} - TruePortMe Portfolio</title>
        <meta name="description" content={`Professional portfolio of ${getDisplayName(user)}${user.bio ? ` - ${user.bio}` : ''}`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <div className="h-20 w-20 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-6">
                    {getInitials(user)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {getDisplayName(user)}
                    </h1>
                    {(user.contactVisibility?.githubUsername !== false) && user.contactInfo?.githubUsername && (
                      <a
                        href={`https://github.com/${user.contactInfo.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center mt-1"
                      >
                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                        @{user.contactInfo.githubUsername}
                      </a>
                    )}
                  </div>
                </div>
                {user.bio && (
                  <p className="text-gray-600 text-lg leading-relaxed">{user.bio}</p>
                )}
                
                {/* Contact Information */}
                {user.contactInfo && (
                  ((user.contactVisibility?.email !== false) && user.contactInfo.email) ||
                  ((user.contactVisibility?.phone !== false) && user.contactInfo.phone) ||
                  ((user.contactVisibility?.linkedinUrl !== false) && user.contactInfo.linkedinUrl)
                ) && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {(user.contactVisibility?.email !== false) && user.contactInfo.email && (
                      <a
                        href={`mailto:${user.contactInfo.email}`}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user.contactInfo.email}
                      </a>
                    )}
                    {(user.contactVisibility?.phone !== false) && user.contactInfo.phone && (
                      <a
                        href={`tel:${user.contactInfo.phone}`}
                        className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {user.contactInfo.phone}
                      </a>
                    )}
                    {(user.contactVisibility?.linkedinUrl !== false) && user.contactInfo.linkedinUrl && (
                      <a
                        href={user.contactInfo.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014V6.75h2.56v1.17h.037c.355-.674 1.227-1.387 2.524-1.387 2.704 0 3.203 1.778 3.203 4.092v5.713zM4.943 5.57a1.548 1.548 0 01-1.548-1.549 1.548 1.548 0 111.547 1.549zm1.336 10.768H3.605V6.75H6.28v9.588zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
              
              {/* Stats */}
              {(stats.verifiedEducation > 0 || stats.publicProjects > 0 || stats.verifiedExperiences > 0 || (user.showGithub !== false && user.githubUsername && stats.githubRepos > 0)) && (
                <div className="mt-6 md:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {stats.verifiedEducation > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{stats.verifiedEducation}</div>
                      <div className="text-sm text-gray-600">Education</div>
                    </div>
                  )}
                  {stats.publicProjects > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{stats.publicProjects}</div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </div>
                  )}
                  {stats.verifiedExperiences > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.verifiedExperiences}</div>
                      <div className="text-sm text-gray-600">Experiences</div>
                    </div>
                  )}
                  {user.showGithub !== false && user.githubUsername && stats.githubRepos > 0 && (
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.githubRepos}</div>
                      <div className="text-sm text-gray-600">Repositories</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latest Education */}
        {sortedEducation.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Latest Education</h2>
              <div className="flex items-center text-sm text-gray-600">
                <div className="verified-badge mr-2">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verified
                </div>
                academic credentials
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEducation.slice(0, 3).map((edu) => (
                <EducationCard
                  key={edu.id}
                  education={edu}
                  showActions={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Latest Projects */}
        {sortedProjects.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Latest Projects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.slice(0, 3).map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  showActions={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* GitHub Repositories */}
        {user.contactInfo?.githubUsername && !githubLoading && githubRepos.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">GitHub Repositories</h2>
              <a
                href={`https://github.com/${user.contactInfo.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View on GitHub →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {githubRepos.map((repo) => (
                <div key={repo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary-600"
                      >
                        {repo.name}
                      </a>
                    </h3>
                    {repo.stargazers_count > 0 && (
                      <div className="flex items-center text-yellow-500 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {repo.stargazers_count}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {repo.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    {repo.language && (
                      <span className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-primary-500 mr-1"></span>
                        {repo.language}
                      </span>
                    )}
                    <span>{formatDate(repo.updated_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Experiences */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Verified Experiences</h2>
            <div className="flex items-center text-sm text-gray-600">
              <div className="verified-badge mr-2">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified
              </div>
              by industry professionals
            </div>
          </div>

          {verifiedExperiences.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {verifiedExperiences.map((experience) => (
                <ExperienceCard
                  key={experience._id}
                  experience={experience}
                  showActions={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No verified experiences yet</h3>
              <p className="mt-1 text-sm text-gray-500">Check back later for verified professional experiences.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            Powered by{' '}
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              TruePortMe
            </Link>
            {' '}— Verified Digital Portfolios
          </p>
        </div>
      </div>
    </div>
  );
}