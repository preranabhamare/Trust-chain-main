import React from 'react';
import {
  Laptop,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  ArrowRight,
  ExternalLink,
  Flame,
  Activity
} from 'lucide-react';

export default function DashboardView({ overview, onNavigateTab }) {
  if (!overview) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-400">
        <Activity className="animate-spin text-[#cda84f] mr-2" />
        Loading TrustChain metrics...
      </div>
    );
  }

  const {
    total_devices,
    active_users,
    allowed_requests,
    denied_requests,
    high_risk_devices,
    recent_events,
    recent_requests,
    risk_summary,
  } = overview;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#281934] via-[#382247] to-[#1e1924] border border-[#cda84f]/30 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-semibold tracking-wider text-[#cda84f]">
                Operational Zero Trust Control
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#e3cb85]"></span>
            </div>
            <h1 className="text-2xl font-bold text-[#e3cb85] tracking-tight">
              Network Access & Audit Overview
            </h1>
            <p className="text-sm text-stone-300 mt-1 max-w-2xl">
              Continuous identity verificaion, device risk scoring, and blockchain-audited OPNsense firewall automation.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('access')}
            className="self-start md:self-center px-4 py-2.5 rounded-xl bg-[#cda84f] text-[#151119] font-semibold text-sm hover:bg-[#e3cb85] transition-all flex items-center gap-2 shadow-lg shadow-[#cda84f]/20 cursor-pointer"
          >
            <span>Simulate Access Request</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Devices */}
        <div className="bg-[#1e1924] border border-[#382e44] rounded-xl p-5 hover:border-[#cda84f]/40 transition-all">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Devices</span>
            <div className="p-2 rounded-lg bg-[#281934] text-[#cda84f]">
              <Laptop size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-100">{total_devices}</div>
          <div className="text-[11px] text-stone-400 mt-1">Managed endpoints</div>
        </div>

        {/* Active Users */}
        <div className="bg-[#1e1924] border border-[#382e44] rounded-xl p-5 hover:border-[#cda84f]/40 transition-all">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Users</span>
            <div className="p-2 rounded-lg bg-[#281934] text-[#e3cb85]">
              <Users size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-100">{active_users}</div>
          <div className="text-[11px] text-stone-400 mt-1">Verified identities</div>
        </div>

        {/* Allowed Requests */}
        <div className="bg-[#1e1924] border border-[#382e44] rounded-xl p-5 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Allowed Access</span>
            <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400">
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{allowed_requests}</div>
          <div className="text-[11px] text-stone-400 mt-1">Policy & risk verified</div>
        </div>

        {/* Denied Requests */}
        <div className="bg-[#1e1924] border border-[#382e44] rounded-xl p-5 hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Denied Access</span>
            <div className="p-2 rounded-lg bg-rose-950/60 text-rose-400">
              <XCircle size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400">{denied_requests}</div>
          <div className="text-[11px] text-stone-400 mt-1">Blocked by Zero Trust</div>
        </div>

        {/* High Risk Devices */}
        <div className="bg-[#1e1924] border border-[#382e44] rounded-xl p-5 hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">High-Risk Endpoints</span>
            <div className="p-2 rounded-lg bg-amber-950/60 text-amber-400">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className={`text-2xl font-bold ${high_risk_devices > 0 ? 'text-amber-400' : 'text-stone-100'}`}>
            {high_risk_devices}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Risk score &ge; 70</div>
        </div>
      </div>

      {/* Risk Distribution Breakdown */}
      <div className="bg-[#1e1924] border border-[#382e44] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#cda84f]" />
            <h2 className="text-sm font-semibold text-[#e3cb85] uppercase tracking-wider">
              Fleet Risk Posture Breakdown
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('devices')}
            className="text-xs text-[#cda84f] hover:text-[#e3cb85] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Devices</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#241e2c] border border-emerald-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 font-medium">Low Risk</p>
              <p className="text-xl font-bold text-emerald-400">{risk_summary?.low || 0} Devices</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              Compliant
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#241e2c] border border-amber-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 font-medium">Medium Risk</p>
              <p className="text-xl font-bold text-amber-400">{risk_summary?.medium || 0} Devices</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              Restricted
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#241e2c] border border-rose-500/20 flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-400 font-medium">High Risk</p>
              <p className="text-xl font-bold text-rose-400">{risk_summary?.high || 0} Devices</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
              Quarantine / Block
            </span>
          </div>
        </div>
      </div>

      {/* Split Section: Recent Access Requests & Recent Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Access Decisions */}
        <div className="bg-[#1e1924] border border-[#382e44] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#382e44] mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#e3cb85]" />
                <h2 className="text-sm font-semibold text-[#e3cb85] uppercase tracking-wider">
                  Recent Access Decisions
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('access')}
                className="text-xs text-[#cda84f] hover:text-[#e3cb85] flex items-center gap-1 cursor-pointer"
              >
                <span>Full Logs</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-2.5">
              {recent_requests && recent_requests.length > 0 ? (
                recent_requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-[#241e2c] border border-[#382e44] hover:border-[#cda84f]/30 transition-all flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-200">{req.user_name}</span>
                        <span className="text-stone-500">&bull;</span>
                        <span className="text-stone-400 font-mono">{req.device_name}</span>
                      </div>
                      <div className="text-stone-400">
                        Requested: <span className="text-[#cda84f]">{req.resource}</span> ({req.action})
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          req.decision === 'ALLOW'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {req.decision}
                      </span>
                      <div className="text-[10px] text-stone-500">
                        Risk: <span className={req.calculated_risk > 50 ? 'text-rose-400' : 'text-emerald-400'}>{req.calculated_risk}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 py-4 text-center">No access requests recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Security Events */}
        <div className="bg-[#1e1924] border border-[#382e44] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#382e44] mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-[#e3cb85] uppercase tracking-wider">
                  Recent Security Events
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('security')}
                className="text-xs text-[#cda84f] hover:text-[#e3cb85] flex items-center gap-1 cursor-pointer"
              >
                <span>Audit Trail</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-2.5">
              {recent_events && recent_events.length > 0 ? (
                recent_events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-[#241e2c] border border-[#382e44] text-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            evt.severity === 'CRITICAL'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : evt.severity === 'HIGH'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-[#482d5a] text-[#e3cb85] border border-[#cda84f]/30'
                          }`}
                        >
                          {evt.severity}
                        </span>
                        <span className="font-semibold text-stone-200">{evt.event_type}</span>
                      </div>
                      <p className="text-stone-300 text-[11px] leading-relaxed">{evt.description}</p>
                    </div>
                    {evt.tx_hash && (
                      <span className="shrink-0 font-mono text-[10px] text-stone-500" title={evt.tx_hash}>
                        {evt.tx_hash.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 py-4 text-center">No security events logged.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
