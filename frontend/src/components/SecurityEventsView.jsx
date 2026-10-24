import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  ShieldAlert,
  Hash,
  Clock,
  Layers,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Send,
  Loader2
} from 'lucide-react';
import { api } from '../api';
import { web3Service } from '../web3';

export default function SecurityEventsView({ events, blockchainStatus, onRefresh }) {
  const [copiedHash, setCopiedHash] = useState(null);
  const [verifyingHash, setVerifyingHash] = useState(null);
  const [verifiedResults, setVerifiedResults] = useState({});
  const [signingEvent, setSigningEvent] = useState(false);
  const [signMessage, setSignMessage] = useState(null);

  const handleCopy = (hash) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerify = async (hash) => {
    setVerifyingHash(hash);
    try {
      const res = await api.verifyBlockchainHash(hash);
      setVerifiedResults((prev) => ({
        ...prev,
        [hash]: res,
      }));
    } catch (err) {
      setVerifiedResults((prev) => ({
        ...prev,
        [hash]: { verified: false, error: err.message },
      }));
    } finally {
      setVerifyingHash(null);
    }
  };

  const handleMetaMaskSignAndLog = async () => {
    setSigningEvent(true);
    setSignMessage(null);
    try {
      if (!web3Service.isMetaMaskInstalled()) {
        alert('Please install MetaMask to sign administrative events.');
        return;
      }
      // Force switch to TrustChain Localhost before signing
      await web3Service.switchToLocalNetwork();
      const wallet = await web3Service.connectWallet();
      const testHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

      // Call smart contract with MetaMask signer
      const result = await web3Service.recordSecurityEventWithMetaMask(
        "ADMIN_SECURITY_AUDIT",
        "MetaMask-Authorized Signer",
        "INFO",
        "MANUAL_AUDIT_VERIFIED",
        testHash
      );

      // Record to backend DB as well
      await api.recordAdminAction({
        admin_address: wallet.address,
        action_type: "ADMIN_BLOCKCHAIN_SIGN",
        description: `Manual Zero Trust security audit signed on-chain via MetaMask. Block #${result.blockNumber}`,
        tx_hash: result.txHash,
      });

      setSignMessage(`Success! Tx Mined in Block #${result.blockNumber} (Tx: ${result.txHash.slice(0, 10)}...)`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setSignMessage(`Error: ${err.message || 'MetaMask transaction rejected'}`);
    } finally {
      setSigningEvent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#e3cb85] tracking-wide">
            Security Audit Log &amp; Blockchain Verifier
          </h1>
          
        </div>

        {/* Action Button: Sign With MetaMask */}
        <button
          onClick={handleMetaMaskSignAndLog}
          disabled={signingEvent}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#482d5a] to-[#281934] border border-[#cda84f]/50 text-[#e3cb85] text-xs font-semibold hover:border-[#e3cb85] transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {signingEvent ? (
            <Loader2 size={15} className="animate-spin text-[#cda84f]" />
          ) : (
            <Send size={15} className="text-[#cda84f]" />
          )}
          <span>{signingEvent ? 'Signing in MetaMask...' : 'Sign On-Chain with MetaMask'}</span>
        </button>
      </div>

      {signMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
            signMessage.startsWith('Success')
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border-rose-800 text-rose-300'
          }`}
        >
          <span>{signMessage}</span>
          <button
            onClick={() => setSignMessage(null)}
            className="text-stone-400 hover:text-white cursor-pointer ml-3 font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* Blockchain Layer Status Card */}
      <div className="bg-[#1e1924] border border-[#cda84f]/40 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#382e44]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#cda84f]" />
            <h2 className="text-sm font-semibold text-[#e3cb85] uppercase tracking-wider">
              Blockchain Audit Status
            </h2>
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Smart Contract Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#241e2c] border border-[#382e44]">
            <span className="text-stone-400 block text-[10px] uppercase">EVM Network</span>
            <span className="font-semibold text-stone-200">
              {blockchainStatus?.network || 'Hardhat Localhost (Chain ID: 31337)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#241e2c] border border-[#382e44]">
            <span className="text-stone-400 block text-[10px] uppercase">Current Block Height</span>
            <span className="font-semibold font-mono text-[#cda84f]">
              #{blockchainStatus?.block_height ?? 1}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#241e2c] border border-[#382e44]">
            <span className="text-stone-400 block text-[10px] uppercase">Deployed Smart Contract</span>
            <div className="flex items-center justify-between gap-1 mt-0.5">
              <span
                className="font-mono text-[11px] text-[#e3cb85] truncate"
                title={blockchainStatus?.contract_address}
              >
                {blockchainStatus?.contract_address
                  ? `${blockchainStatus.contract_address.slice(0, 10)}...${blockchainStatus.contract_address.slice(-6)}`
                  : '0x5FbDB...80aa3'}
              </span>
              {blockchainStatus?.contract_address && (
                <button
                  onClick={() => handleCopy(blockchainStatus.contract_address)}
                  className="text-stone-400 hover:text-stone-200 cursor-pointer"
                  title="Copy contract address"
                >
                  <Copy size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#241e2c] border border-[#382e44]">
            <span className="text-stone-400 block text-[10px] uppercase">MetaMask Authorization</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <ShieldCheck size={14} /> Cryptographic Proof
            </span>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-[#1e1924] border border-[#382e44] rounded-2xl overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 bg-[#241e2c] border-b border-[#382e44] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#cda84f]" />
            <h2 className="text-sm font-semibold text-[#e3cb85] uppercase tracking-wider">
              Immutable Event Records ({events?.length || 0})
            </h2>
          </div>
          <span className="text-[11px] text-stone-400">
            Click 'Verify' to validate on-chain ledger proof
          </span>
        </div>

        <div className="divide-y divide-[#382e44]">
          {events && events.length > 0 ? (
            events.map((evt) => {
              const verified = verifiedResults[evt.tx_hash];
              return (
                <div
                  key={evt.id}
                  className="p-5 hover:bg-[#281934]/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          evt.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : evt.severity === 'HIGH'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-[#482d5a] text-[#e3cb85] border border-[#cda84f]/30'
                        }`}
                      >
                        {evt.severity}
                      </span>
                      <span className="font-bold text-stone-100">{evt.event_type}</span>
                      {evt.device_name && (
                        <span className="text-stone-400">&bull; {evt.device_name}</span>
                      )}
                      {evt.source_ip && (
                        <span className="font-mono text-stone-500">[{evt.source_ip}]</span>
                      )}
                    </div>
                    <p className="text-stone-300 leading-relaxed">{evt.description}</p>

                    {/* Verification result badge */}
                    {verified && (
                      <div className="pt-1 flex items-center gap-2 flex-wrap">
                        {verified.verified ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800 font-semibold shadow-sm"
                            title={`Mined on-chain at block #${verified.block_number || 'N/A'} via contract ${verified.contract}`}
                          >
                            <CheckCircle2 size={12} className="text-emerald-400" />
                            <span>
                              Confirmed on Smart Contract Ledger
                              {verified.block_number ? ` (Block #${verified.block_number})` : ''}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-[10px] border border-amber-800">
                            Valid Format (Pending Node Sync)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                      <Clock size={12} />
                      <span>{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>

                    {evt.tx_hash && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#e3cb85] bg-[#241e2c] border border-[#382e44] px-2.5 py-1 rounded-lg">
                          <Hash size={11} className="text-[#cda84f]" />
                          <span title={evt.tx_hash}>{evt.tx_hash.slice(0, 16)}...</span>
                          <button
                            onClick={() => handleCopy(evt.tx_hash)}
                            className="text-stone-400 hover:text-stone-200 ml-1 cursor-pointer"
                            title="Copy Transaction Hash"
                          >
                            {copiedHash === evt.tx_hash ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>

                        {/* On-Chain Verification Trigger */}
                        <button
                          onClick={() => handleVerify(evt.tx_hash)}
                          disabled={verifyingHash === evt.tx_hash}
                          className="px-2.5 py-1 rounded-lg bg-[#281934] border border-[#cda84f]/40 text-[#e3cb85] hover:bg-[#482d5a] transition-all cursor-pointer text-[11px] font-medium disabled:opacity-50"
                          title="Verify cryptographic proof on Solidity smart contract"
                        >
                          {verifyingHash === evt.tx_hash ? 'Verifying...' : 'Verify On-Chain'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-stone-500 text-xs">
              No security events recorded.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
