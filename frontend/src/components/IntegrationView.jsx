import React from 'react';
import {
  Network,
  CheckCircle,
  Clock,
  Layers,
  Shield,
  ArrowRight,
  Server,
  Database,
  Cpu,
  Lock,
  ExternalLink
} from 'lucide-react';

export default function IntegrationView({ engineStatus, blockchainStatus }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[#e3cb85] tracking-wide">
          TrustChain System Architecture &amp; 3-Person Division
        </h1>
        <p className="text-xs text-stone-400 mt-0.5">
          Blueprint showing how Person 1's Management Layer connects to Person 2's Zero Trust Engine and Person 3's Blockchain.
        </p>
      </div>

      {/* 3-Person Division Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Person 1 Card */}
        <div className="p-5 rounded-2xl bg-[#281934] border-2 border-[#cda84f] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#e3cb85]">
              Person 1
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800">
              BUILD NOW (ACTIVE)
            </span>
          </div>

          <div>
            <h2 className="text-base font-bold text-stone-100">
              Dashboard &amp; Application Management
            </h2>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              Provides the administrator management UI, role assignments, device inventory, policy authoring, and access request evaluation frontend.
            </p>
          </div>

          <div className="space-y-2 text-xs border-t border-[#382e44] pt-3">
            <div className="flex items-center justify-between text-stone-300">
              <span>Stack:</span>
              <span className="text-[#e3cb85] font-semibold">React + Tailwind + FastAPI + DB</span>
            </div>
            <div className="flex items-center justify-between text-stone-300">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">100% Operational</span>
            </div>
          </div>
        </div>

        {/* Person 2 Card */}
        <div className="p-5 rounded-2xl bg-[#1e1924] border border-emerald-500/50 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
              Person 2
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800">
              COMPLETED (CONNECTED)
            </span>
          </div>

          <div>
            <h2 className="text-base font-bold text-stone-100">
              Zero Trust Engine &amp; OPNsense Firewall
            </h2>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              Calculates dynamic risk, validates device compliance against policies, and dispatches stateful PERMIT / BLOCK rules to the OPNsense firewall.
            </p>
          </div>

          <div className="space-y-2 text-xs border-t border-[#382e44] pt-3">
            <div className="flex items-center justify-between text-stone-300">
              <span>Stack:</span>
              <span className="text-emerald-400 font-semibold">Python + Risk Engine + OPNsense API</span>
            </div>
            <div className="flex items-center justify-between text-stone-300">
              <span>Integration Hook:</span>
              <span className="font-mono text-stone-400">/api/evaluate-access</span>
            </div>
          </div>
        </div>

        {/* Person 3 Card */}
        <div className="p-5 rounded-2xl bg-[#281934] border-2 border-[#cda84f] shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-[#e3cb85]">
              Person 3
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold text-[10px] border border-emerald-800">
              COMPLETED (INTEGRATED)
            </span>
          </div>

          <div>
            <h2 className="text-base font-bold text-stone-100">
              Blockchain &amp; Smart Contract Audit Layer
            </h2>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              Maintains tamper-evident immutable log of device registration, policy mutations, and access decisions on Solidity smart contract with MetaMask authentication.
            </p>
          </div>

          <div className="space-y-2 text-xs border-t border-[#382e44] pt-3">
            <div className="flex items-center justify-between text-stone-300">
              <span>Stack:</span>
              <span className="text-[#cda84f] font-semibold">Solidity + Hardhat + EVM + MetaMask</span>
            </div>
            <div className="flex items-center justify-between text-stone-300">
              <span>Smart Contract:</span>
              <span className="font-mono text-[#e3cb85] text-[11px] truncate max-w-[140px]" title={blockchainStatus?.contract_address || '0x5FbDB...80aa3'}>
                {blockchainStatus?.contract_address ? `${blockchainStatus.contract_address.slice(0, 10)}...` : '0x5FbDB...'}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone-300">
              <span>Status:</span>
              <span className="text-emerald-400 font-bold">100% Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="bg-[#1e1924] border border-[#382e44] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#e3cb85] uppercase tracking-wider">
          End-to-End Zero Trust Access Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs items-center">
          <div className="p-3.5 rounded-xl bg-[#241e2c] border border-[#382e44] text-center">
            <span className="font-bold text-stone-200 block mb-1">1. Admin / User</span>
            <span className="text-stone-400 text-[11px]">Initiates access request or policy update</span>
          </div>

          <div className="flex justify-center text-stone-500">
            <ArrowRight size={20} className="hidden md:block text-[#cda84f]" />
          </div>

          <div className="p-3.5 rounded-xl bg-[#281934] border border-[#cda84f]/50 text-center">
            <span className="font-bold text-[#e3cb85] block mb-1">2. Person 1 Layer</span>
            <span className="text-stone-300 text-[11px]">React Dashboard &amp; FastAPI checks DB state</span>
          </div>

          <div className="flex justify-center text-stone-500">
            <ArrowRight size={20} className="hidden md:block text-[#cda84f]" />
          </div>

          <div className="p-3.5 rounded-xl bg-[#241e2c] border border-emerald-500/30 text-center">
            <span className="font-bold text-emerald-400 block mb-1">3. Person 2 &amp; 3</span>
            <span className="text-stone-300 text-[11px]">OPNsense permits/drops + Blockchain records hash</span>
          </div>
        </div>
      </div>

      {/* Live System Integration Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Person 2 Engine Hook Telemetry */}
        <div className="bg-[#1e1924] border border-[#382e44] rounded-xl p-4">
          <h2 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Server size={14} className="text-emerald-400" />
            <span>Person 2 Engine Connector Telemetry</span>
          </h2>
          <pre className="p-3 rounded-lg bg-[#151119] border border-[#382e44] text-[11px] font-mono text-emerald-300 overflow-x-auto">
            {JSON.stringify(engineStatus || {}, null, 2)}
          </pre>
        </div>

        {/* Person 3 Blockchain Hook Telemetry */}
        <div className="bg-[#1e1924] border border-[#382e44] rounded-xl p-4">
          <h2 className="text-xs font-bold text-stone-200 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Lock size={14} className="text-[#cda84f]" />
            <span>Person 3 Blockchain Connector Telemetry</span>
          </h2>
          <pre className="p-3 rounded-lg bg-[#151119] border border-[#382e44] text-[11px] font-mono text-[#e3cb85] overflow-x-auto">
            {JSON.stringify(blockchainStatus || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
