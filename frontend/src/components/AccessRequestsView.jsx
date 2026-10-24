import React, { useState } from 'react';
import {
  Radio,
  Play,
  CheckCircle,
  XCircle,
  Shield,
  Laptop,
  Database,
  Lock,
  Flame,
  Hash,
  ExternalLink,
  Filter
} from 'lucide-react';

export default function AccessRequestsView({ requests, users, devices, onRefresh, api }) {
  const [filterDecision, setFilterDecision] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [latestResult, setLatestResult] = useState(null);

  // Simulator state
  const [simUser, setSimUser] = useState(users && users.length > 0 ? String(users[0].id) : '');
  const [simDevice, setSimDevice] = useState(devices && devices.length > 0 ? String(devices[0].id) : '');
  const [simResource, setSimResource] = useState('Production Database');
  const [simAction, setSimAction] = useState('READ');

  const selectedDeviceObj = (devices || []).find((d) => String(d.id) === String(simDevice));
  const selectedUserObj = (users || []).find((u) => String(u.id) === String(simUser));

  const handleSimulate = async (e) => {
    e.preventDefault();
    if (!simUser || !simDevice) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.evaluateAccess({
        user_id: Number(simUser),
        device_id: Number(simDevice),
        resource: simResource,
        action: simAction,
      });
      setLatestResult(res);
      onRefresh();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = (requests || []).filter((req) => {
    if (filterDecision === 'ALL') return true;
    return req.decision === filterDecision;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#e3cb85] tracking-wide">
          Zero Trust Access Request Interface
        </h1>
        <p className="text-xs text-stone-400 mt-0.5">
          Real-time access decision evaluation, continuous risk verification, and OPNsense firewall rule dispatching.
        </p>
      </div>

      {/* Simulator Section */}
      <div className="bg-[#1e1924] border border-[#cda84f]/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#382e44]">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#cda84f] animate-pulse" />
            <h2 className="text-sm font-bold text-[#e3cb85] uppercase tracking-wider">
              Zero Trust Evaluation Simulator
            </h2>
          </div>
         
        </div>

        <form onSubmit={handleSimulate} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Select Identity (User)
              </label>
              <select
                value={simUser}
                onChange={(e) => setSimUser(e.target.value)}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                {(users || []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role})
                  </option>
                ))}
              </select>
              {selectedUserObj && (
                <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                  <span>Role:</span>
                  <span className="text-[#e3cb85] font-semibold">{selectedUserObj.role}</span>
                  <span className="text-stone-500">&bull;</span>
                  <span className={selectedUserObj.status === 'active' ? 'text-emerald-400' : 'text-rose-400'}>
                    {selectedUserObj.status}
                  </span>
                </div>
              )}
            </div>

            {/* Device Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Select Endpoint (Device)
              </label>
              <select
                value={simDevice}
                onChange={(e) => setSimDevice(e.target.value)}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                {(devices || []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.device_name} ({d.device_id})
                  </option>
                ))}
              </select>
             {selectedDeviceObj && (
  <div className="text-[11px] mt-1 flex items-center gap-1">
    <span className="text-stone-400">Risk:</span>

    <span className="text-emerald-400 font-medium">
      Low
    </span>

    <span className="text-stone-500">&bull;</span>

    <span
      className={
        selectedDeviceObj.status === "active"
          ? "text-emerald-400"
          : "text-rose-400"
      }
    >
      {selectedDeviceObj.status}
    </span>
  </div>
)}
            </div>

            {/* Resource Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Target Resource
              </label>
              <select
                value={simResource}
                onChange={(e) => setSimResource(e.target.value)}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                <option value="Production Database">Production Database</option>
                <option value="API Gateway">API Gateway</option>
                <option value="Internal Wiki">Internal Wiki</option>
                <option value="Security Vault">Security Vault</option>
                <option value="Payment Gateway">Payment Gateway</option>
                <option value="SSH Bastion">SSH Bastion</option>
              </select>
            </div>

            {/* Action Selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Requested Action
              </label>
              <select
                value={simAction}
                onChange={(e) => setSimAction(e.target.value)}
                className="w-full bg-[#241e2c] border border-[#382e44] rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#cda84f]"
              >
                <option value="READ">READ</option>
                <option value="WRITE">WRITE</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SSH">SSH</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#cda84f] text-[#151119] font-bold text-xs hover:bg-[#e3cb85] transition-all flex items-center gap-2 shadow-lg shadow-[#cda84f]/20 disabled:opacity-50 cursor-pointer"
            >
              <Play size={15} />
              <span>{loading ? 'Evaluating Zero Trust Engine...' : 'Evaluate Access Request'}</span>
            </button>
          </div>
        </form>

        {/* Latest Evaluation Result Card */}
        {latestResult && (
          <div className="mt-5 p-5 rounded-xl bg-[#241e2c] border border-[#382e44] animate-in fade-in duration-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 mb-3 border-b border-[#382e44]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">Evaluation Decision:</span>
                <span
                  className={`px-3 py-1 rounded-full font-extrabold text-xs flex items-center gap-1.5 ${
                    latestResult.decision === 'ALLOW'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}
                >
                  {latestResult.decision === 'ALLOW' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  <span>{latestResult.decision}</span>
                </span>
                <span className="text-xs text-stone-400 font-mono">({latestResult.request_id})</span>
              </div>

              {latestResult.blockchain_tx_hash && (
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-stone-400">
                  <Hash size={12} className="text-[#cda84f]" />
                  <span>Audit Hash:</span>
                  <span className="text-[#e3cb85]" title={latestResult.blockchain_tx_hash}>
                    {latestResult.blockchain_tx_hash.slice(0, 16)}...
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-3">
              <div className="p-2.5 rounded-lg bg-[#1e1924] border border-[#382e44]">
                <span className="text-stone-400 block text-[10px] uppercase">Subject</span>
                <span className="font-semibold text-stone-200">{latestResult.user_name}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1e1924] border border-[#382e44]">
                <span className="text-stone-400 block text-[10px] uppercase">Device &amp; Risk</span>
                <span className="font-semibold text-stone-200">
                  {latestResult.device_name} (Risk: {latestResult.calculated_risk})
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1e1924] border border-[#382e44]">
                <span className="text-stone-400 block text-[10px] uppercase">Resource &amp; Action</span>
                <span className="font-semibold text-[#cda84f]">
                  {latestResult.resource} ({latestResult.action})
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#1e1924] border border-[#382e44]">
                <span className="text-stone-400 block text-[10px] uppercase">Matched Policy</span>
                <span className="font-semibold text-stone-200">{latestResult.policy_name}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="text-stone-300">
                <strong className="text-[#e3cb85]">Reason: </strong>
                <span>{latestResult.reason}</span>
              </div>
              <div className="text-stone-300">
                <strong className="text-[#cda84f]">OPNsense Firewall Rule: </strong>
                <span className="font-mono text-emerald-400">{latestResult.enforced_by}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Access Requests Table */}
      <div className="bg-[#1e1924] border border-[#382e44] rounded-2xl overflow-hidden shadow-lg">
        {/* Table Filter Controls */}
        <div className="px-5 py-3.5 bg-[#241e2c] border-b border-[#382e44] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-[#cda84f]" />
            <h2 className="text-sm font-semibold text-[#e3cb85] uppercase tracking-wider">
              Access Request Audit Stream
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={13} className="text-stone-400" />
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="bg-[#1e1924] border border-[#382e44] rounded-lg px-2.5 py-1 text-xs text-stone-200 focus:outline-none focus:border-[#cda84f]"
            >
              <option value="ALL">All Decisions ({requests?.length || 0})</option>
              <option value="ALLOW">ALLOW Only</option>
              <option value="DENY">DENY Only</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-300">
            <thead className="bg-[#1e1924] text-[#e3cb85] uppercase tracking-wider font-semibold border-b border-[#382e44]">
              <tr>
                <th className="px-5 py-3.5">Request ID</th>
                <th className="px-5 py-3.5">User Identity</th>
                <th className="px-5 py-3.5">Device &amp; Risk</th>
                <th className="px-5 py-3.5">Target &amp; Action</th>
                <th className="px-5 py-3.5">Decision</th>
                <th className="px-5 py-3.5">Firewall Action</th>
                <th className="px-5 py-3.5">Audit Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#382e44]">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#281934]/50 transition-colors">
                    {/* Request ID */}
                    <td className="px-5 py-4 font-mono font-bold text-stone-200">
                      {req.request_id}
                    </td>

                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-stone-100">{req.user_name}</div>
                      <div className="text-[10px] text-stone-500">{new Date(req.timestamp).toLocaleTimeString()}</div>
                    </td>

                    {/* Device & Risk */}
                    <td className="px-5 py-4">
                      <div className="text-stone-200">{req.device_name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-stone-500">Risk:</span>
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            req.calculated_risk >= 70
                              ? 'text-rose-400'
                              : req.calculated_risk >= 30
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {req.calculated_risk}
                        </span>
                      </div>
                    </td>

                    {/* Resource & Action */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#cda84f]">{req.resource}</div>
                      <div className="text-[10px] text-stone-400 font-mono">Action: {req.action}</div>
                    </td>

                    {/* Decision */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          req.decision === 'ALLOW'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {req.decision === 'ALLOW' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        <span>{req.decision}</span>
                      </span>
                    </td>

                    {/* Firewall Action */}
                    <td className="px-5 py-4 text-stone-300 font-mono text-[11px]">
                      {req.enforced_by}
                    </td>

                    {/* Blockchain Tx Hash */}
                    <td className="px-5 py-4 font-mono text-[11px] text-stone-400">
                      {req.blockchain_tx_hash ? (
                        <span title={req.blockchain_tx_hash} className="text-[#e3cb85]">
                          {req.blockchain_tx_hash.slice(0, 10)}...
                        </span>
                      ) : (
                        <span className="text-stone-600">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-stone-500">
                    No access requests matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
