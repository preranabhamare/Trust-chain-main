import React, { useState } from 'react';
import {
  Laptop,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Unlock,
  Edit2,
  Trash2,
  Wifi,
  UserCheck
} from 'lucide-react';
import Modal from './Modal';

export default function DevicesView({ devices, users, onRefresh, api }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Register form data
  const [formData, setFormData] = useState({
    device_id: '',
    device_name: '',
    ip_address: '',
    mac_address: '',
    os_type: 'Windows 11',
    owner_id: '',
    risk_score: 15,
    status: 'active',
  });

  const handleOpenRegister = () => {
    const nextNum = (devices?.length || 0) + 1;
    setFormData({
      device_id: `DEV-PC-00${nextNum}`,
      device_name: '',
      ip_address: `192.168.10.${50 + nextNum}`,
      mac_address: '00:1B:44:22:9A:C3',
      os_type: 'Windows 11',
      owner_id: users && users.length > 0 ? String(users[0].id) : '',
      risk_score: 15,
      status: 'active',
    });
    setErrorMsg('');
    setIsRegisterModalOpen(true);
  };

  const handleOpenEdit = (dev) => {
    setSelectedDevice(dev);
    setFormData({
      device_id: dev.device_id,
      device_name: dev.device_name,
      ip_address: dev.ip_address,
      mac_address: dev.mac_address || '',
      os_type: dev.os_type,
      owner_id: dev.owner_id ? String(dev.owner_id) : '',
      risk_score: dev.risk_score,
      status: dev.status,
    });
    setErrorMsg('');
    setIsEditModalOpen(true);
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.registerDevice({
        ...formData,
        owner_id: formData.owner_id ? Number(formData.owner_id) : null,
        risk_score: Number(formData.risk_score),
      });
      setIsRegisterModalOpen(false);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!selectedDevice) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await api.updateDevice(selectedDevice.id, {
        device_name: formData.device_name,
        ip_address: formData.ip_address,
        os_type: formData.os_type,
        owner_id: formData.owner_id ? Number(formData.owner_id) : null,
        risk_score: Number(formData.risk_score),
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

  const handleToggleBlock = async (device) => {
    const newStatus = device.status === 'blocked' ? 'active' : 'blocked';
    try {
      await api.toggleDeviceStatus(device.id, newStatus);
      onRefresh();
    } catch (err) {
      alert(`Error toggling device status: ${err.message}`);
    }
  };

  const handleDeleteDevice = async (device) => {
    if (!window.confirm(`Are you sure you want to unregister device '${device.device_name}'?`)) return;
    try {
      await api.deleteDevice(device.id);
      onRefresh();
    } catch (err) {
      alert(`Error deleting device: ${err.message}`);
    }
  };

  const filteredDevices = (devices || []).filter((d) => {
    const matchesSearch =
      d.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.owner_name && d.owner_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e3cb85] tracking-wide">
            Device Posture & Inventory
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Monitor endpoint telemetry, evaluate device risk scores, and enforce firewall blocking.
          </p>
        </div>

        <button
          onClick={handleOpenRegister}
          className="px-4 py-2.5 rounded-xl bg-[#cda84f] text-[#151119] font-semibold text-xs hover:bg-[#e3cb85] transition-all flex items-center gap-2 self-start sm:self-auto shadow-md shadow-[#cda84f]/20 cursor-pointer"
        >
          <Plus size={16} />
          <span>Register Endpoint Device</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#1e1924] border border-[#382e44] p-3 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 text-stone-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by device ID, name, IP address, owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg pl-9 pr-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#cda84f]"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-[#cda84f]"
          >
            <option value="ALL">All Statuses ({devices?.length || 0})</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
            <option value="quarantine">Quarantined Only</option>
          </select>
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-[#1e1924] border border-[#382e44] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#241e2c] text-[#e3cb85] uppercase tracking-wider font-semibold border-b border-[#382e44]">
              <tr>
                <th className="px-5 py-3.5">Device Identifier</th>
                <th className="px-5 py-3.5">Network IP / MAC</th>
                <th className="px-5 py-3.5">Owner Identity</th>
                <th className="px-5 py-3.5">Risk Score</th>
                <th className="px-5 py-3.5">Firewall Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#382e44]">
              {filteredDevices.length > 0 ? (
                filteredDevices.map((dev) => (
                  <tr key={dev.id} className="hover:bg-[#281934]/50 transition-colors">
                    {/* Device Identifier */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#241e2c] border border-[#382e44] text-[#cda84f]">
                          <Laptop size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-100">{dev.device_name}</div>
                          <div className="text-[11px] text-[#e3cb85] font-mono">{dev.device_id}</div>
                          <div className="text-[10px] text-stone-500">{dev.os_type}</div>
                        </div>
                      </div>
                    </td>

                    {/* Network IP */}
                    <td className="px-5 py-4">
                      <div className="font-mono text-stone-200 flex items-center gap-1.5">
                        <Wifi size={12} className="text-[#cda84f]" />
                        {dev.ip_address}
                      </div>
                      {dev.mac_address && (
                        <div className="font-mono text-[10px] text-stone-500">{dev.mac_address}</div>
                      )}
                    </td>

                    {/* Owner */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-stone-200">
                        <UserCheck size={13} className="text-stone-400" />
                        <span>{dev.owner_name || 'Unassigned'}</span>
                      </div>
                    </td>

                    {/* Risk Score */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-10 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                            dev.risk_score >= 70
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : dev.risk_score >= 30
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {dev.risk_score}
                        </div>
                        <div className="text-[10px]">
                          {dev.risk_score >= 70 ? (
                            <span className="text-rose-400 font-semibold">HIGH RISK</span>
                          ) : dev.risk_score >= 30 ? (
                            <span className="text-amber-400 font-semibold">MEDIUM RISK</span>
                          ) : (
                            <span className="text-emerald-400 font-semibold">LOW RISK</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          dev.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : dev.status === 'blocked'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {dev.status === 'active' ? (
                          <>
                            <ShieldCheck size={12} />
                            <span>Active (Allowed)</span>
                          </>
                        ) : dev.status === 'blocked' ? (
                          <>
                            <Ban size={12} />
                            <span>Blocked (OPNsense)</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert size={12} />
                            <span>Quarantined</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Block/Unblock Button */}
                        <button
                          onClick={() => handleToggleBlock(dev)}
                          title={dev.status === 'blocked' ? 'Unblock device' : 'Block device at firewall'}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            dev.status === 'blocked'
                              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-400 hover:bg-emerald-900'
                              : 'bg-rose-950/70 border-rose-800 text-rose-400 hover:bg-rose-900'
                          }`}
                        >
                          {dev.status === 'blocked' ? <Unlock size={14} /> : <Ban size={14} />}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(dev)}
                          className="p-1.5 rounded-lg bg-[#241e2c] border border-[#382e44] text-stone-300 hover:text-[#e3cb85] hover:border-[#cda84f]/40 transition-colors"
                          title="Edit Risk Score / Device Info"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteDevice(dev)}
                          className="p-1.5 rounded-lg bg-[#241e2c] border border-[#382e44] text-stone-400 hover:text-rose-400 hover:border-rose-800 transition-colors"
                          title="Remove Endpoint"
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
                    No devices registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Device */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register Endpoint Device"
        subtitle="Add a network device to the Zero Trust management inventory"
      >
        <form onSubmit={handleSubmitRegister} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Device ID</label>
              <input
                type="text"
                required
                value={formData.device_id}
                onChange={(e) => setFormData({ ...formData, device_id: e.target.value })}
                placeholder="DEV-PC-007"
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 font-mono focus:outline-none focus:border-[#cda84f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Device Friendly Name</label>
              <input
                type="text"
                required
                value={formData.device_name}
                onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
                placeholder="DevOps Linux Bastion"
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">IP Address</label>
              <input
                type="text"
                required
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                placeholder="192.168.10.75"
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 font-mono focus:outline-none focus:border-[#cda84f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">MAC Address (Optional)</label>
              <input
                type="text"
                value={formData.mac_address}
                onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                placeholder="00:1B:44:11:3A:B7"
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 font-mono focus:outline-none focus:border-[#cda84f]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Operating System</label>
              <select
                value={formData.os_type}
                onChange={(e) => setFormData({ ...formData, os_type: e.target.value })}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                <option value="Windows 11">Windows 11</option>
                <option value="Ubuntu 22.04">Ubuntu 22.04 LTS</option>
                <option value="macOS Sonoma">macOS Sonoma</option>
                <option value="Arch Linux">Arch Linux</option>
                <option value="iOS / iPadOS">iOS / iPadOS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Device Owner</label>
              <select
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                <option value="">Unassigned (Shared Terminal)</option>
                {(users || []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Risk Score (0 - 100): <span className="text-[#cda84f] font-mono">{formData.risk_score}</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.risk_score}
                onChange={(e) => setFormData({ ...formData, risk_score: e.target.value })}
                className="w-full accent-[#cda84f]"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>0 (Pristine)</span>
                <span>50 (Moderate)</span>
                <span>100 (Compromised)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                <option value="active">Active (Permitted)</option>
                <option value="blocked">Blocked (OPNsense Drop)</option>
                <option value="quarantine">Quarantine</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#382e44]">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#241e2c] text-stone-300 text-xs hover:bg-[#382e44] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-[#cda84f] text-[#151119] font-semibold text-xs hover:bg-[#e3cb85] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Registering...' : 'Register Device'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Device */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Endpoint: ${selectedDevice?.device_id}`}
        subtitle="Update device risk score posture or network configuration"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Device Friendly Name</label>
            <input
              type="text"
              required
              value={formData.device_name}
              onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
              className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">IP Address</label>
              <input
                type="text"
                required
                value={formData.ip_address}
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 font-mono focus:outline-none focus:border-[#cda84f]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Owner</label>
              <select
                value={formData.owner_id}
                onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                <option value="">Unassigned</option>
                {(users || []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} (@{u.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Simulate Risk Score: <span className="text-[#cda84f] font-mono">{formData.risk_score}</span> / 100
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.risk_score}
              onChange={(e) => setFormData({ ...formData, risk_score: e.target.value })}
              className="w-full accent-[#cda84f]"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Adjusting this score directly impacts Person 2's Zero Trust decision engine!
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Device Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
            >
              <option value="active">Active (Permitted in Zero Trust)</option>
              <option value="blocked">Blocked (OPNsense Firewall Drop)</option>
              <option value="quarantine">Quarantine (Restricted subnet)</option>
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
              {loading ? 'Saving...' : 'Update Device'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
