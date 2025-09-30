import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { instituteAdminAPI, adminAuth } from '../../../utils/adminAPI';
import { getAuthToken, removeAuthToken } from '../../../utils/auth';
import SingleToast from '../../../components/SingleToast';
import AdminProtectedRoute from '../../../components/AdminProtectedRoute';

function InstituteAdminDashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [analytics, setAnalytics] = useState({ overview: {} });
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [usersSearch, setUsersSearch] = useState('');
  const [associationRequests, setAssociationRequests] = useState([]);
  const [requestsPagination, setRequestsPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // forms
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });
  const [newVerifier, setNewVerifier] = useState({ name: '', email: '', password: '' });
  const [editUser, setEditUser] = useState(null);
  const [resetPasswordData, setResetPasswordData] = useState({ userId: '', newPassword: '' });
  const [bulkJson, setBulkJson] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/admin/institute-admin/login');
      return;
    }
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveResponseUser = (res) => {
    if (!res) return null;
    return res.admin || res.user || (res.success === false ? null : res);
  };

  const safeArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (val.users) return Array.isArray(val.users) ? val.users : [];
    if (val.requests) return Array.isArray(val.requests) ? val.requests : [];
    if (val.data && Array.isArray(val.data)) return val.data;
    return [];
  };

  async function loadDashboardData() {
    try {
      setLoading(true);

      // profile
      const profileResponse = await instituteAdminAPI.getProfile(); // GET /me
      const adminUser = resolveResponseUser(profileResponse);
      if (!adminUser || !adminAuth.isInstituteAdmin(adminUser)) throw new Error('Unauthorized access');
      setUser(adminUser);

      // institution
      const institutionResponse = await instituteAdminAPI.getInstitution(); // GET /institution
      const inst = institutionResponse?.institution || institutionResponse?.data?.institution || institutionResponse;
      setInstitution(inst && (inst._id || inst.name) ? inst : null);

      // analytics
      const analyticsResponse = await instituteAdminAPI.getAnalytics(); // GET /analytics
      const analyticsData = analyticsResponse?.overview || analyticsResponse?.data || analyticsResponse;
      setAnalytics(analyticsData || { overview: {} });

      // users & requests page 1
      await loadUsers(1, usersPagination.limit, '');
      await loadRequests(1, requestsPagination.limit);

    } catch (err) {
      console.error('Dashboard load error', err);
      if (err?.response?.status === 401) {
        removeAuthToken();
        router.push('/admin/institute-admin/login');
      } else {
        setToast({ type: 'error', message: err?.response?.data?.message || err?.message || 'Failed to load data' });
      }
    } finally {
      setLoading(false);
    }
  }

  // USERS
  const loadUsers = async (page = 1, limit = 10, search = '') => {
    try {
      setLoadingUsers(true);
      const res = await instituteAdminAPI.getUsers({ page, limit, search }); // GET /users
      const fetched = res?.users || res?.data?.users || res?.data || [];
      const pagination = res?.pagination || res?.data?.pagination || { page, limit, total: fetched.length, pages: 1 };
      setUsers(Array.isArray(fetched) ? fetched : []);
      setUsersPagination(pagination);
    } catch (err) {
      console.error('loadUsers', err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load users' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const onUsersSearch = async (e) => {
    const q = e.target.value;
    setUsersSearch(q);
    await loadUsers(1, usersPagination.limit, q);
  };

  const changeUsersPage = async (newPage) => await loadUsers(newPage, usersPagination.limit, usersSearch);

  // create student / verifier
  const createUser = async (payload, roleLabel) => {
    try {
      const res = await instituteAdminAPI.createUser(payload); // POST /users
      setToast({ type: 'success', message: res?.message || `${roleLabel} created` });
      setNewStudent({ name: '', email: '', password: '' });
      setNewVerifier({ name: '', email: '', password: '' });
      await loadUsers(usersPagination.page, usersPagination.limit, usersSearch);
      const analyticsResponse = await instituteAdminAPI.getAnalytics();
      setAnalytics(analyticsResponse?.overview || analyticsResponse || { overview: {} });
    } catch (err) {
      console.error('createUser', err);
      setToast({ type: 'error', message: err?.response?.data?.message || `Failed to create ${roleLabel}` });
    }
  };

  const handleCreateStudent = async (e) => {
    e?.preventDefault();
    if (!newStudent.name || !newStudent.email || !newStudent.password) { setToast({ type: 'error', message: 'Fill student fields' }); return; }
    await createUser({ ...newStudent, role: 'STUDENT' }, 'Student');
  };

  const handleCreateVerifier = async (e) => {
    e?.preventDefault();
    if (!newVerifier.name || !newVerifier.email || !newVerifier.password) { setToast({ type: 'error', message: 'Fill verifier fields' }); return; }
    await createUser({ ...newVerifier, role: 'VERIFIER' }, 'Verifier');
  };

  // update user & reset password
  const handleOpenEditUser = (u) => setEditUser(u);
  const handleUpdateUser = async () => {
    if (!editUser) return;
    try {
      const res = await instituteAdminAPI.updateUser(editUser._id, { name: editUser.name, email: editUser.email, bio: editUser.bio, githubUsername: editUser.githubUsername, role: editUser.role });
      setToast({ type: 'success', message: res?.message || 'User updated' });
      setEditUser(null);
      await loadUsers(usersPagination.page, usersPagination.limit, usersSearch);
    } catch (err) {
      console.error('updateUser', err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to update user' });
    }
  };

  const handleResetUserPassword = async () => {
    const { userId, newPassword } = resetPasswordData;
    if (!userId || !newPassword) { setToast({ type: 'error', message: 'Provide user and password' }); return; }
    try {
      const res = await instituteAdminAPI.resetUserPassword(userId, { newPassword }); // PUT /users/:userId/reset-password
      setToast({ type: 'success', message: res?.message || 'Password reset' });
      setResetPasswordData({ userId: '', newPassword: '' });
    } catch (err) {
      console.error('resetUserPassword', err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to reset password' });
    }
  };

  // change role (admin action)
  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Set role to ${newRole} and approve user?`)) return;
    try {
      const res = await instituteAdminAPI.updateUserRole(userId, { newRole }); // PUT /users/:userId/role { newRole }
      setToast({ type: 'success', message: res?.message || `Role changed to ${newRole}` });
      await loadUsers(usersPagination.page, usersPagination.limit, usersSearch);
      const analyticsResponse = await instituteAdminAPI.getAnalytics();
      setAnalytics(analyticsResponse?.overview || analyticsResponse || { overview: {} });
    } catch (err) {
      console.error('updateUserRole', err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to update role' });
    }
  };

  // remove user
  const handleRemoveUser = async (userId) => {
    if (!confirm('Remove user from institution?')) return;
    try {
      const res = await instituteAdminAPI.removeUser(userId); // DELETE /users/:userId
      setToast({ type: 'success', message: res?.message || 'User removed' });
      await loadUsers(usersPagination.page, usersPagination.limit, usersSearch);
      const analyticsResponse = await instituteAdminAPI.getAnalytics();
      setAnalytics(analyticsResponse?.overview || analyticsResponse || { overview: {} });
    } catch (err) {
      console.error('removeUser', err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to remove user' });
    }
  };

  // REQUESTS
  const loadRequests = async (page = 1, limit = 10) => {
    try {
      setLoadingRequests(true);
      const res = await instituteAdminAPI.getAssociationRequests({ page, limit, status: 'PENDING' }); // GET /association-requests
      const reqs = res?.requests || res?.data?.requests || [];
      const pagination = res?.pagination || res?.data?.pagination || { page, limit, total: reqs.length, pages: 1 };
      setAssociationRequests(Array.isArray(reqs) ? reqs : []);
      setRequestsPagination(pagination);
    } catch (err) {
      console.error('loadRequests', err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to load requests' });
    } finally {
      setLoadingRequests(false);
    }
  };

  const changeRequestsPage = async (newPage) => await loadRequests(newPage, requestsPagination.limit);

  const handleAssociationRequest = async (requestId, action) => {
    if (!confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this request?`)) return;
    try {
      const payload = { action, response: action === 'approve' ? 'Approved by institute admin' : 'Rejected by institute admin' };
      const res = await instituteAdminAPI.respondToAssociationRequest(requestId, payload); // PUT /association-requests/:requestId/respond
      setToast({ type: 'success', message: res?.message || `Request ${action}d` });
      await loadRequests(requestsPagination.page, requestsPagination.limit);
      await loadUsers(usersPagination.page, usersPagination.limit, usersSearch);
      const analyticsResponse = await instituteAdminAPI.getAnalytics();
      setAnalytics(analyticsResponse?.overview || analyticsResponse || { overview: {} });
    } catch (err) {
      console.error('respondToAssociationRequest', err);
      setToast({ type: 'error', message: err?.response?.data?.message || `Failed to ${action} request` });
    }
  };

  // export users
  const handleExport = async (format = 'json') => {
    try {
      const res = await instituteAdminAPI.exportUsers({ format }); // GET /users/export?format=csv/json
      if (format === 'csv') {
        // backend sends csv content-type; open in new tab or download
        const blob = new Blob([res], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${institution?.name || 'institution'}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        // JSON response object -> show toast and prompt download
        const json = JSON.stringify(res, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-${institution?.name || 'institution'}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setToast({ type: 'success', message: 'Export started' });
    } catch (err) {
      console.error('exportUsers', err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Failed to export users' });
    }
  };

  // bulk import (simple JSON textarea - backend expects { users: [ ... ] })
  const handleBulkImport = async () => {
    try {
      if (!bulkJson) { setToast({ type: 'error', message: 'Paste JSON array of users' }); return; }
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) { setToast({ type: 'error', message: 'JSON must be an array' }); return; }
      const res = await instituteAdminAPI.bulkImportUsers({ users: parsed }); // POST /users/bulk-import
      setToast({ type: 'success', message: res?.message || 'Bulk import finished' });
      setBulkJson('');
      await loadUsers(usersPagination.page, usersPagination.limit, usersSearch);
      const analyticsResponse = await instituteAdminAPI.getAnalytics();
      setAnalytics(analyticsResponse?.overview || analyticsResponse || { overview: {} });
    } catch (err) {
      console.error('bulkImportUsers', err);
      setToast({ type: 'error', message: err?.response?.data?.message || 'Bulk import failed' });
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    router.push('/admin/institute-admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Institute Admin Dashboard</h1>
                <p className="text-sm text-gray-500">{institution?.displayName || institution?.name || ''}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-500">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'users', name: 'Users' },
              { id: 'requests', name: 'Association Requests' },
              { id: 'settings', name: 'Settings' }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                {tab.name}
                {tab.id === 'requests' && associationRequests.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{associationRequests.length}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview?.totalUsers || 0}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-sm font-medium text-gray-500">Students</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview?.totalStudents || 0}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-sm font-medium text-gray-500">Verifiers</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview?.totalVerifiers || 0}</p>
              </div>
              <div className="bg-white shadow rounded-lg p-6">
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <p className="text-2xl font-semibold text-gray-900">{analytics.overview?.pendingAssociations || 0}</p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Users</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.slice(0,5).map(u => (
                      <tr key={u._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${u.role === 'VERIFIER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Users</h2>
              <div className="flex items-center space-x-2">
                <input value={usersSearch} onChange={onUsersSearch} placeholder="Search name/email/github" className="form-input px-3 py-2" />
                <button onClick={() => loadUsers(1, usersPagination.limit, usersSearch)} className="px-3 py-2 bg-primary-600 text-white rounded">Search</button>
              </div>
            </div>

            {/* create sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={handleCreateStudent} className="bg-white shadow rounded-lg p-4">
                <h3 className="font-medium mb-2">Add Student</h3>
                <input className="form-input w-full mb-2" placeholder="Name" value={newStudent.name} onChange={e=>setNewStudent(prev=>({...prev,name:e.target.value}))} />
                <input className="form-input w-full mb-2" placeholder="Email" value={newStudent.email} onChange={e=>setNewStudent(prev=>({...prev,email:e.target.value}))} />
                <input className="form-input w-full mb-2" placeholder="Password" value={newStudent.password} onChange={e=>setNewStudent(prev=>({...prev,password:e.target.value}))} />
                <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Create Student</button>
              </form>

              <form onSubmit={handleCreateVerifier} className="bg-white shadow rounded-lg p-4">
                <h3 className="font-medium mb-2">Add Verifier</h3>
                <input className="form-input w-full mb-2" placeholder="Name" value={newVerifier.name} onChange={e=>setNewVerifier(prev=>({...prev,name:e.target.value}))} />
                <input className="form-input w-full mb-2" placeholder="Email" value={newVerifier.email} onChange={e=>setNewVerifier(prev=>({...prev,email:e.target.value}))} />
                <input className="form-input w-full mb-2" placeholder="Password" value={newVerifier.password} onChange={e=>setNewVerifier(prev=>({...prev,password:e.target.value}))} />
                <button type="submit" className="px-3 py-2 bg-indigo-600 text-white rounded">Create Verifier</button>
              </form>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingUsers ? (
                      <tr><td colSpan={4} className="p-6 text-center">Loading...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-gray-500">No users</td></tr>
                    ) : users.map(u => (
                      <tr key={u._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)} className="text-sm border-gray-300 rounded-md">
                            <option value="STUDENT">STUDENT</option>
                            <option value="VERIFIER">VERIFIER</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => handleOpenEditUser(u)} className="text-primary-600 hover:text-primary-900 mr-4">Edit</button>
                          <button onClick={() => handleRemoveUser(u._id)} className="text-red-600 hover:text-red-900">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">Page {usersPagination.page} of {usersPagination.pages}</div>
                <div className="space-x-2">
                  <button onClick={() => changeUsersPage(Math.max(1, usersPagination.page - 1))} disabled={usersPagination.page <= 1} className="px-3 py-1 border rounded">Prev</button>
                  <button onClick={() => changeUsersPage(Math.min(usersPagination.pages, usersPagination.page + 1))} disabled={usersPagination.page >= usersPagination.pages} className="px-3 py-1 border rounded">Next</button>
                </div>
              </div>
            </div>

            {/* Edit user modal-like area */}
            {editUser && (
              <div className="bg-white shadow rounded-lg p-4">
                <h3 className="font-medium mb-2">Edit User</h3>
                <input className="form-input mb-2 w-full" value={editUser.name} onChange={e=>setEditUser({...editUser, name: e.target.value})} />
                <input className="form-input mb-2 w-full" value={editUser.email} onChange={e=>setEditUser({...editUser, email: e.target.value})} />
                <input className="form-input mb-2 w-full" value={editUser.bio||''} onChange={e=>setEditUser({...editUser, bio: e.target.value})} placeholder="bio" />
                <input className="form-input mb-2 w-full" value={editUser.githubUsername||''} onChange={e=>setEditUser({...editUser, githubUsername: e.target.value})} placeholder="github username" />
                <div className="flex space-x-2">
                  <button onClick={handleUpdateUser} className="px-3 py-2 bg-primary-600 text-white rounded">Save</button>
                  <button onClick={()=>setEditUser(null)} className="px-3 py-2 border rounded">Cancel</button>
                </div>
              </div>
            )}

            {/* Reset password area */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-medium mb-2">Reset User Password</h3>
              <input className="form-input mb-2 w-full" placeholder="User ID" value={resetPasswordData.userId} onChange={e=>setResetPasswordData(prev=>({...prev,userId:e.target.value}))} />
              <input className="form-input mb-2 w-full" placeholder="New Password" value={resetPasswordData.newPassword} onChange={e=>setResetPasswordData(prev=>({...prev,newPassword:e.target.value}))} />
              <div className="flex space-x-2">
                <button onClick={handleResetUserPassword} className="px-3 py-2 bg-yellow-600 text-white rounded">Reset</button>
              </div>
            </div>

            {/* Bulk import & export */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="font-medium mb-2">Bulk Import (paste JSON array)</h3>
              <textarea rows={6} value={bulkJson} onChange={e=>setBulkJson(e.target.value)} className="form-input w-full mb-2" placeholder='[{"name":"A","email":"a@x.com","password":"123456","role":"STUDENT"}, ...]' />
              <div className="flex space-x-2">
                <button onClick={handleBulkImport} className="px-3 py-2 bg-indigo-600 text-white rounded">Import</button>
                <button onClick={()=>handleExport('json')} className="px-3 py-2 bg-gray-800 text-white rounded">Export JSON</button>
                <button onClick={()=>handleExport('csv')} className="px-3 py-2 bg-gray-800 text-white rounded">Export CSV</button>
              </div>
            </div>
          </div>
        )}

        {/* Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Association Requests</h2>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loadingRequests ? (
                      <tr><td colSpan={4} className="p-6 text-center">Loading...</td></tr>
                    ) : associationRequests.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-gray-500">No pending association requests</td></tr>
                    ) : associationRequests.map(r => (
                      <tr key={r._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{r.studentId?.name || r.user?.name || r.student?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{r.studentId?.email || r.user?.email}</div>
                        </td>
                        <td className="px-6 py-4"><div className="text-sm text-gray-900 max-w-xs truncate">{r.message}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => handleAssociationRequest(r._id, 'approve')} className="text-green-600 hover:text-green-900 mr-4">Approve</button>
                          <button onClick={() => handleAssociationRequest(r._id, 'reject')} className="text-red-600 hover:text-red-900">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">Page {requestsPagination.page} of {requestsPagination.pages}</div>
                  <div className="space-x-2">
                    <button onClick={() => changeRequestsPage(Math.max(1, requestsPagination.page - 1))} disabled={requestsPagination.page <= 1} className="px-3 py-1 border rounded">Prev</button>
                    <button onClick={() => changeRequestsPage(Math.min(requestsPagination.pages, requestsPagination.page + 1))} disabled={requestsPagination.page >= requestsPagination.pages} className="px-3 py-1 border rounded">Next</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" value={user?.name || ''} className="form-input mt-1" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" value={user?.email || ''} className="form-input mt-1" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input type="tel" value={user?.phone || ''} className="form-input mt-1" readOnly />
                </div>
                <button className="px-4 py-2 bg-primary-600 text-white rounded">Change Password</button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Institution Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                  <input type="text" value={institution?.displayName || institution?.name || ''} className="form-input mt-1" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <input type="url" value={institution?.website || ''} className="form-input mt-1" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={institution?.description || ''} className="form-input mt-1" rows={3} readOnly />
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {toast && <SingleToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function InstituteAdminDashboard() {
  return (
    <AdminProtectedRoute adminType="institute">
      <InstituteAdminDashboardContent />
    </AdminProtectedRoute>
  );
}
