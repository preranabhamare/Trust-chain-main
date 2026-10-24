import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Edit2,
  Shield,
  Laptop
} from 'lucide-react';
import Modal from './Modal';

export default function UsersView({ users, onRefresh, api }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role: 'Employee',
    department: 'Engineering',
    status: 'active',
  });

  const availableRoles = [
    'Admin',
    'SecOps Lead',
    'DevOps Engineer',
    'Backend Engineer',
    'Employee',
    'Contractor',
    'Auditor'
  ];

  const handleOpenAdd = () => {
    setFormData({
      username: '',
      email: '',
      full_name: '',
      role: 'Employee',
      department: 'Engineering',
      status: 'active',
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department: user.department,
      status: user.status,
    });
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.createUser(formData);
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await api.updateUser(selectedUser.id, {
        full_name: formData.full_name,
        role: formData.role,
        department: formData.department,
        status: formData.status,
      });
      setIsEditModalOpen(false);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.updateUser(user.id, { status: newStatus });
      onRefresh();
    } catch (err) {
      alert(`Error updating user status: ${err.message}`);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to remove user '${user.username}'?`)) return;
    try {
      await api.deleteUser(user.id);
      onRefresh();
    } catch (err) {
      alert(`Error deleting user: ${err.message}`);
    }
  };

  const filteredUsers = (users || []).filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e3cb85] tracking-wide">
            User Identity Management
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage authorized identities, assign Zero Trust RBAC roles, and control access lifecycles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#cda84f] text-[#151119] font-semibold text-xs hover:bg-[#e3cb85] transition-all flex items-center gap-2 self-start sm:self-auto shadow-md shadow-[#cda84f]/20 cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#1e1924] border border-[#382e44] p-3 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 text-stone-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, username, email, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#cda84f]"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48 bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-[#cda84f]"
          >
            <option value="ALL">All Roles ({users?.length || 0})</option>
            {availableRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#1e1924] border border-[#382e44] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#241e2c] text-[#e3cb85] uppercase tracking-wider font-semibold border-b border-[#382e44]">
              <tr>
                <th className="px-5 py-3.5">User / Identity</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Devices</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#382e44]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#281934]/50 transition-colors">
                    {/* User Identity */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#482d5a] border border-[#cda84f]/30 flex items-center justify-center font-bold text-[#e3cb85]">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-stone-100">{user.full_name}</div>
                          <div className="text-[11px] text-stone-400 font-mono">@{user.username}</div>
                          <div className="text-[10px] text-stone-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#241e2c] border border-[#382e44] text-stone-200 font-medium">
                        <Shield size={12} className="text-[#cda84f]" />
                        {user.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-4 text-stone-300">{user.department}</td>

                    {/* Devices */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-stone-300">
                        <Laptop size={13} className="text-stone-400" />
                        <span>{user.device_count || 0} registered</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title="Click to toggle active/inactive"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                          user.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                            : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700'
                        }`}
                      >
                        {user.status === 'active' ? (
                          <>
                            <CheckCircle size={12} />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 rounded-lg bg-[#241e2c] border border-[#382e44] text-stone-300 hover:text-[#e3cb85] hover:border-[#cda84f]/40 transition-colors"
                          title="Edit User Role / Details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-lg bg-[#241e2c] border border-[#382e44] text-stone-400 hover:text-rose-400 hover:border-rose-800 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-stone-500">
                    No users matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add User */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Identity / User"
        subtitle="Registers a new subject identity in the Zero Trust directory"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Sarah Connor"
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Username</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().trim() })}
                placeholder="e.g. sconnor"
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Corporate Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sconnor@trustchain.local"
              className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Assign Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Engineering, SecOps, Finance..."
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Initial Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
            >
              <option value="active">Active (Permits Zero Trust Verification)</option>
              <option value="inactive">Inactive (Deactivated account)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#382e44]">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#241e2c] text-stone-300 text-xs hover:bg-[#382e44] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#cda84f] text-[#151119] font-semibold text-xs hover:bg-[#e3cb85] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating...' : 'Register User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit User */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit User: @${selectedUser?.username}`}
        subtitle="Update role assignment or organizational details"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Assign Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Account Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#382e44]">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#241e2c] text-stone-300 text-xs hover:bg-[#382e44] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#cda84f] text-[#151119] font-semibold text-xs hover:bg-[#e3cb85] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Update User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
