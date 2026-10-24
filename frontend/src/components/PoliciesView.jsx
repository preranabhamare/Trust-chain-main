import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  ArrowRight,
  Trash2,
  CheckCircle,
  XCircle,
  Sliders,
  Database,
  Server,
  Layers,
  Key
} from 'lucide-react';
import Modal from './Modal';

export default function PoliciesView({ policies, onRefresh, api }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    subject_role: 'Employee',
    resource: 'Database',
    action: 'READ',
    max_risk_score: 40,
    is_active: true,
    description: '',
  });

  const availableRoles = [
    'Employee',
    'DevOps Engineer',
    'Backend Engineer',
    'SecOps Lead',
    'Admin',
    'Contractor',
    'All'
  ];

  const availableResources = [
    'Database',
    'Production Server',
    'Internal Wiki',
    'API Gateway',
    'Security Vault',
    'Payment Gateway',
    'SSH Bastion'
  ];

  const availableActions = ['READ', 'WRITE', 'ADMIN', 'SSH', 'EXECUTE', 'ANY'];

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      subject_role: 'Employee',
      resource: 'Database',
      action: 'READ',
      max_risk_score: 40,
      is_active: true,
      description: '',
    });
    setErrorMsg('');
    setIsAddModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await api.createPolicy({
        ...formData,
        max_risk_score: Number(formData.max_risk_score),
      });
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (policy) => {
    try {
      await api.updatePolicy(policy.id, { is_active: !policy.is_active });
      onRefresh();
    } catch (err) {
      alert(`Error toggling policy: ${err.message}`);
    }
  };

  const handleDeletePolicy = async (policy) => {
    if (!window.confirm(`Delete Zero Trust policy '${policy.name}'?`)) return;
    try {
      await api.deletePolicy(policy.id);
      onRefresh();
    } catch (err) {
      alert(`Error deleting policy: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e3cb85] tracking-wide">
            Zero Trust Policy Engine
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
           Access rules linking Subject Roles &rarr; Target Resources &rarr; Actions &rarr; Dynamic Risk Thresholds.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#cda84f] text-[#151119] font-semibold text-xs hover:bg-[#e3cb85] transition-all flex items-center gap-2 self-start sm:self-auto shadow-md shadow-[#cda84f]/20 cursor-pointer"
        >
          <Plus size={16} />
          <span>Create Access Policy</span>
        </button>
      </div>

      

      {/* Policies List / Cards */}
      <div className="grid grid-cols-1 gap-4">
        {policies && policies.length > 0 ? (
          policies.map((pol) => (
            <div
              key={pol.id}
              className={`p-5 rounded-2xl bg-[#1e1924] border transition-all ${
                pol.is_active
                  ? 'border-[#382e44] hover:border-[#cda84f]/50'
                  : 'border-[#382e44]/50 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Policy Meta */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        pol.is_active ? 'bg-emerald-400' : 'bg-stone-500'
                      }`}
                    ></span>
                    <h2 className="text-base font-bold text-stone-100">{pol.name}</h2>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#281934] text-[#e3cb85] border border-[#cda84f]/30">
                      ID: #{pol.id}
                    </span>
                  </div>
                  {pol.description && (
                    <p className="text-xs text-stone-400 max-w-xl">{pol.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-start md:self-center">
                  <button
                    onClick={() => handleToggleActive(pol)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      pol.is_active
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                        : 'bg-stone-800 text-stone-400 border border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {pol.is_active ? (
                      <>
                        <CheckCircle size={14} />
                        <span>Enforced</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        <span>Disabled</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeletePolicy(pol)}
                    className="p-1.5 rounded-lg bg-[#241e2c] border border-[#382e44] text-stone-400 hover:text-rose-400 hover:border-rose-800 transition-colors cursor-pointer"
                    title="Delete Policy"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Visual Rule Flow Chain */}
              <div className="mt-4 pt-4 border-t border-[#382e44] flex flex-wrap items-center gap-2 text-xs">
                {/* Subject Role */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241e2c] border border-[#382e44] text-stone-200">
                  <Layers size={13} className="text-[#cda84f]" />
                  <span className="text-stone-400">Role:</span>
                  <span className="font-semibold text-[#e3cb85]">{pol.subject_role}</span>
                </div>

                <ArrowRight size={14} className="text-stone-500" />

                {/* Resource */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241e2c] border border-[#382e44] text-stone-200">
                  <Database size={13} className="text-[#cda84f]" />
                  <span className="text-stone-400">Target:</span>
                  <span className="font-semibold text-stone-100">{pol.resource}</span>
                </div>

                <ArrowRight size={14} className="text-stone-500" />

                {/* Action */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#241e2c] border border-[#382e44] text-stone-200">
                  <Key size={13} className="text-[#cda84f]" />
                  <span className="text-stone-400">Action:</span>
                  <span className="font-semibold font-mono text-[#e3cb85]">{pol.action}</span>
                </div>

                <ArrowRight size={14} className="text-stone-500" />

                {/* Risk Condition */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#281934] border border-[#cda84f]/40 text-stone-200">
                  <Sliders size={13} className="text-emerald-400" />
                  <span className="text-stone-400">Condition:</span>
                  <span className="font-semibold font-mono text-emerald-400">
                    Risk &le; {pol.max_risk_score}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#1e1924] border border-[#382e44] rounded-2xl p-12 text-center text-stone-500">
            No policies created. Click "Create Access Policy" to add your first Zero Trust rule.
          </div>
        )}
      </div>

      {/* Modal: Create Policy */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Zero Trust Policy"
        subtitle="Rule syntax: Subject Role → Resource → Action → Risk < Threshold"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Policy Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Employee Database Read Policy"
              className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Subject Role</label>
              <select
                value={formData.subject_role}
                onChange={(e) => setFormData({ ...formData, subject_role: e.target.value })}
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
              <label className="block text-xs font-semibold text-stone-300 mb-1">Target Resource</label>
              <select
                value={formData.resource}
                onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                {availableResources.map((res) => (
                  <option key={res} value={res}>
                    {res}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">Allowed Action</label>
              <select
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                {availableActions.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Max Allowed Risk Score: <span className="text-[#cda84f] font-mono">{formData.max_risk_score}</span>
              </label>
              <input
                type="range"
                min="5"
                max="95"
                step="5"
                value={formData.max_risk_score}
                onChange={(e) => setFormData({ ...formData, max_risk_score: e.target.value })}
                className="w-full accent-[#cda84f]"
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>5 (Strict)</span>
                <span>40 (Standard)</span>
                <span>95 (Permissive)</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">Rule Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Employee -> Database -> READ -> Risk < 40"
              className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
            />
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
              {loading ? 'Creating...' : 'Deploy Policy'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
