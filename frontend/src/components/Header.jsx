import React, { useState, useEffect } from 'react';
import { Shield, Wallet, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { web3Service } from '../web3';

export default function Header({ systemHealth, onRefresh, isRefreshing, onWalletChange }) {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Check if wallet is already connected
  const checkInitialWallet = async () => {
    if (web3Service.isMetaMaskInstalled() && window.ethereum.selectedAddress) {
      try {
        const wallet = await web3Service.connectWallet();
        setAccount(wallet.address);
        setBalance(wallet.balance);
        setIsCorrectNetwork(wallet.isCorrectNetwork);
        if (onWalletChange) onWalletChange(wallet.address);
      } catch (err) {
        console.log('Wallet auto-connect note:', err);
      }
    }
  };

  useEffect(() => {
    checkInitialWallet();

    if (web3Service.isMetaMaskInstalled()) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (onWalletChange) onWalletChange(accounts[0]);
          checkInitialWallet();
        } else {
          setAccount(null);
          setBalance(null);
          if (onWalletChange) onWalletChange(null);
        }
      };

      const handleChainChanged = () => {
        checkInitialWallet();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const handleConnectWallet = async () => {
    setErrorMsg(null);
    setIsConnecting(true);
    try {
      if (!web3Service.isMetaMaskInstalled()) {
        setErrorMsg('MetaMask extension is not installed. Please install MetaMask in your browser.');
        return;
      }
      const wallet = await web3Service.connectWallet();
      setAccount(wallet.address);
      setBalance(wallet.balance);
      setIsCorrectNetwork(wallet.isCorrectNetwork);
      if (onWalletChange) onWalletChange(wallet.address);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to connect MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await web3Service.switchToLocalNetwork();
      await checkInitialWallet();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to switch network');
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-[#151119]/95 backdrop-blur-md border-b border-[#382e44] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#482d5a] to-[#281934] border border-[#cda84f]/40 flex items-center justify-center shadow-lg shadow-[#482d5a]/20">
          <Shield className="w-5 h-5 text-[#e3cb85]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-wider text-[#e3cb85]">TRUSTCHAIN</span>
            
          </div>
          <p className="text-xs text-stone-400">Blockchain-Audited Zero Trust Network Manager</p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* System Health Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e1924] border border-[#382e44]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-stone-300">OPNsense &amp; Engine:</span>
          <span className="text-xs font-semibold text-emerald-400">ACTIVE</span>
        </div>

        {/* Network Mismatch Warning Button */}
        {account && !isCorrectNetwork && (
          <button
            onClick={handleSwitchNetwork}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-950/80 border border-amber-600 text-amber-300 hover:bg-amber-900 transition-all cursor-pointer"
            title="Switch MetaMask to TrustChain Localhost (Chain ID: 31337)"
          >
            <AlertCircle size={14} className="text-amber-400" />
            <span>Switch to Local EVM</span>
          </button>
        )}

        {/* MetaMask Admin Identity Button */}
        <div className="relative">
          <button
            onClick={account ? null : handleConnectWallet}
            disabled={isConnecting}
            title={account ? `Admin Connected: ${account}` : 'Click to connect MetaMask wallet'}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              account
                ? 'bg-[#241e2c] border-[#cda84f]/60 text-[#e3cb85] shadow-sm shadow-[#cda84f]/10'
                : 'bg-[#482d5a] border-[#cda84f]/40 text-[#f3f0e6] hover:bg-[#5a3970]'
            }`}
          >
            <Wallet size={14} className={account ? 'text-[#cda84f]' : 'text-[#f3f0e6]'} />
            <span className="font-mono">
              {isConnecting
                ? 'Connecting...'
                : account
                ? `Admin: ${formatAddress(account)}`
                : 'Connect MetaMask'}
            </span>
            {account && balance && (
              <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-[#1e1924] text-[10px] text-stone-300 border border-[#382e44]">
                {balance} ETH
              </span>
            )}
            {account ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="MetaMask Connected"></span>
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Not Connected"></span>
            )}
          </button>

          {errorMsg && (
            <div className="absolute right-0 mt-2 w-72 p-2.5 rounded-lg bg-rose-950 border border-rose-800 text-rose-200 text-[11px] shadow-xl z-50 flex items-start gap-2">
              <AlertCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{errorMsg}</p>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-[10px] underline text-rose-300 hover:text-white mt-1 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-[#1e1924] border border-[#382e44] text-stone-300 hover:text-[#e3cb85] hover:border-[#cda84f]/40 transition-all disabled:opacity-50 cursor-pointer"
          title="Refresh All Data"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-[#cda84f]' : ''} />
        </button>
      </div>
    </header>
  );
}
