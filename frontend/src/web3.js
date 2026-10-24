import { BrowserProvider, Contract, formatEther } from 'ethers';
import contractData from './contracts/TrustChainAudit.json';

const HARDHAT_CHAIN_ID_DEC = 31337n;
const HARDHAT_CHAIN_ID_HEX = '0x7a69';

export const web3Service = {
  isMetaMaskInstalled: () => {
    return typeof window !== 'undefined' && Boolean(window.ethereum && window.ethereum.isMetaMask);
  },

  getProvider: () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      return new BrowserProvider(window.ethereum);
    }
    return null;
  },

  getSigner: async () => {
    const provider = web3Service.getProvider();
    if (!provider) throw new Error('MetaMask is not installed');
    return await provider.getSigner();
  },

  getContract: async (withSigner = false, customAddress = null) => {
    const provider = web3Service.getProvider();
    if (!provider) throw new Error('MetaMask provider not available');

    // Dynamically fetch live contract address from backend API to prevent stale address calls
    let targetAddress = customAddress || contractData.contractAddress;
    try {
      const res = await fetch('/api/blockchain-status');
      if (res.ok) {
        const data = await res.json();
        if (data && data.contract_address) {
          targetAddress = data.contract_address;
        }
      }
    } catch (_) {
      // Fallback to bundled artifact address if API is offline
    }

    if (withSigner) {
      const signer = await provider.getSigner();
      return new Contract(targetAddress, contractData.abi, signer);
    }
    return new Contract(targetAddress, contractData.abi, provider);
  },

  connectWallet: async () => {
    if (!web3Service.isMetaMaskInstalled()) {
      throw new Error('MetaMask extension is not installed in your browser. Please install MetaMask to continue.');
    }

    const provider = web3Service.getProvider();
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts selected in MetaMask');
    }

    const network = await provider.getNetwork();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balanceWei = await provider.getBalance(address);
    const balance = formatEther(balanceWei);

    return {
      address,
      balance: parseFloat(balance).toFixed(4),
      chainId: network.chainId.toString(),
      isCorrectNetwork: network.chainId === HARDHAT_CHAIN_ID_DEC,
    };
  },

  switchToLocalNetwork: async () => {
    if (!window.ethereum) throw new Error('MetaMask is not installed');

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
      });
    } catch (switchError) {
      // Error code 4902 indicates chain has not been added to MetaMask
      if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: HARDHAT_CHAIN_ID_HEX,
              chainName: 'TrustChain Localhost (Hardhat)',
              rpcUrls: ['http://127.0.0.1:8545'],
              nativeCurrency: {
                name: 'Local Ether',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  },

  signMessage: async (message) => {
    const signer = await web3Service.getSigner();
    return await signer.signMessage(message);
  },

  recordSecurityEventWithMetaMask: async (eventType, subject, severity, action, detailsHash, customAddress = null) => {
    // 1. Force switch to local network so user never sends on Mainnet
    await web3Service.switchToLocalNetwork();

    // 2. Obtain contract with local signer & live contract address
    const contract = await web3Service.getContract(true, customAddress);
    const tx = await contract.recordSecurityEvent(
      eventType,
      subject,
      severity,
      action,
      detailsHash
    );
    const receipt = await tx.wait();
    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      contractAddress: await contract.getAddress(),
    };
  },

  verifyHashOnChain: async (hashStr, customAddress = null) => {
    try {
      const contract = await web3Service.getContract(false, customAddress);
      const isVerified = await contract.verifyAuditHash(hashStr);
      return {
        verified: isVerified,
        contract: await contract.getAddress(),
        hash: hashStr,
      };
    } catch (err) {
      console.error('Verify hash error:', err);
      return { verified: false, error: err.message };
    }
  },

  getContractDetails: () => {
    return {
      contractAddress: contractData.contractAddress,
      network: contractData.network,
      chainId: contractData.chainId,
      deployer: contractData.deployer,
    };
  },
};
