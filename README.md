# TrustChain — Blockchain-Based Zero Trust Network Manager

TrustChain is a cybersecurity project that combines **Zero Trust Architecture, risk-based access control, firewall enforcement, and blockchain-based auditing** to improve network security.

The system evaluates access requests based on user identity, device status, security policies, and risk scores before granting or denying access. It integrates with **OPNsense** for network-level enforcement and uses blockchain smart contracts to maintain a tamper-evident record of important security events and administrative actions.

---

## Project Objectives

- Implement Zero Trust principles by verifying every access request.
- Evaluate security risks and make policy-based access decisions.
- Integrate with OPNsense for firewall enforcement.
- Use blockchain to maintain tamper-evident security audit records.
- Support administrator identity verification using MetaMask.
- Provide a centralized dashboard for managing users, devices, policies, and security events.

---

## System Architecture

```text
              Administrator
                    |
                 MetaMask (Stage 9)
                    |
             React Dashboard (Stage 10)
                    |
               FastAPI Backend (Stage 4)
                    |
       +------------+------------+
       |            |            |
   SQLite / DB  Zero Trust    Blockchain
   Management     Engine      Smart Contracts
   (Stage 7)    (Stage 5)       (Stage 8)
                    |
             OPNsense Firewall
             (Stage 1, 2, 3, 6)
                    |
             Protected Network
```

---

## Technology Stack

| Component | Technology | Owner |
|---|---|---|
| **Frontend** | React.js (Vite), Tailwind CSS, Lucide Icons, Ethers.js | Person 1 & 3 |
| **Backend** | Python, FastAPI, SQLAlchemy, Web3.py | Person 1 & 3 |
| **Database** | SQLite (Plug-and-play local) / PostgreSQL | Person 1 |
| **Network Security** | Zero Trust Policy & Risk Engine | Person 2 |
| **Firewall** | OPNsense REST API | Person 2 |
| **Blockchain** | Local EVM (Hardhat Node at `http://127.0.0.1:8545`) | Person 3 |
| **Smart Contracts** | Solidity (`TrustChainAudit.sol`) | Person 3 |
| **Wallet Integration**| MetaMask (`window.ethereum`) | Person 3 |

---

## Project Division & Status

| Stage | Module | Owner | Status |
|---|---|---|---|
| 1–3 | Virtual network, OPNsense install/config, firewall block/allow test | Person 2 | Completed |
| 4, 7, 10 | FastAPI backend, PostgreSQL/device management, React dashboard | Person 1 | Completed |
| 5, 6 | Zero Trust policy & risk engine, connect FastAPI $\rightarrow$ OPNsense | Person 2 + 1 | Completed |
| **8** | **Blockchain & Solidity Smart Contracts (`TrustChainAudit.sol`)** | **Person 3** | **Completed** |
| **9** | **MetaMask Wallet Integration & Cryptographic Transaction Signing** | **Person 3** | **Completed** |
| 11–12 | Full stack integration & demo testing | All 3 | Completed |

---

## Prerequisites

Before setting up TrustChain, ensure the following tools are installed on your machine:
- **Python**: 3.10 or newer (tested with Python 3.13)
- **Node.js**: v18 or newer (tested with Node.js v22 & npm 10)
- **MetaMask Extension**: Installed in your web browser (Chrome, Edge, Brave, or Firefox)

---

## Setup & Running Guide

You can run TrustChain using either the **Automated (1-Click)** method or the **Detailed Manual** method.

### Method 1: Automated Setup & Launch (Recommended)

#### Step 1: Install Dependencies
Run the automated environment setup script:
```bat
setup.bat
```
What `setup.bat` does:
1. **Backend**: Checks for any existing virtual environment (`venv`, `.venv`, or `env`). If one exists, it preserves it and only installs missing libraries (e.g. `web3`, `fastapi`, `uvicorn`). If none exists, it creates `backend/venv` and installs all dependencies.
2. **Frontend**: Runs `npm install` inside `frontend/` (installs React, Vite, Tailwind CSS, Lucide, and Ethers.js).
3. **Blockchain**: Runs `npm install` inside `blockchain/` (installs Hardhat and Hardhat Toolbox).

#### Step 2: Start All Services
Run the automated launch script:
```bat
start-all.bat
```
This automatically opens four dedicated terminals:
1. **Blockchain Node**: Starts Hardhat local EVM node on `http://127.0.0.1:8545` (Chain ID: `31337`).
2. **Contract Deployer**: Deploys `TrustChainAudit.sol` to the local node and syncs contract artifacts with the backend and frontend.
3. **Backend API**: Starts FastAPI Uvicorn server on `http://127.0.0.1:8000`.
4. **Frontend Dashboard**: Starts Vite React development server on `http://localhost:5173`.

---

### Method 2: Detailed Manual Step-by-Step Setup

If you prefer to configure and run each component manually in separate terminal windows:

#### 1. Blockchain Layer (Local EVM & Smart Contracts)
Open Terminal 1:
```powershell
# Navigate to the blockchain directory
cd blockchain

# Install Hardhat and dependencies
npm install

# Start the local EVM blockchain node
npx hardhat node
```
*Leave Terminal 1 open. You will see: `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/`*

Open a temporary terminal window to deploy the smart contract:
```powershell
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```
*This deploys `TrustChainAudit.sol` and outputs the contract address (e.g. `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9`).*

#### 2. Backend Layer (FastAPI & Zero Trust Engine)
Open Terminal 2:
```powershell
# Navigate to the backend directory
cd backend

# Create a virtual environment (if not already present)
python -m venv venv

# Activate the virtual environment
# Windows PowerShell:
.\venv\Scripts\activate
# Windows Command Prompt:
# call venv\Scripts\activate

# Install backend dependencies (FastAPI, Web3, SQLAlchemy, etc.)
pip install -r requirements.txt

# Start the FastAPI backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend API documentation is now live at: `http://127.0.0.1:8000/docs`.*

#### 3. Frontend Layer (React + Vite Dashboard)
Open Terminal 3:
```powershell
# Navigate to the frontend directory
cd frontend

# Install frontend dependencies (React, Vite, Ethers.js, Tailwind)
npm install

# Start Vite dev server
npm run dev
```
*The React Dashboard is now live at: `http://localhost:5173`.*

---

## MetaMask Configuration for Local EVM

To interact with the smart contracts and sign Zero Trust administrative decisions:

### 1. Add the Localhost Network to MetaMask
- Open **MetaMask** $\rightarrow$ Click the network dropdown (top-left) $\rightarrow$ **Add Network** $\rightarrow$ **Add a network manually**:
  - **Network Name:** `TrustChain Localhost`
  - **New RPC URL:** `http://127.0.0.1:8545`
  - **Chain ID:** `31337`
  - **Currency Symbol:** `ETH`
- Click **Save** and switch to `TrustChain Localhost`.

> [!TIP]
> **Alternative using MetaMask built-in test networks:**  
> MetaMask $\rightarrow$ **Settings** $\rightarrow$ **Advanced** $\rightarrow$ Toggle **"Show test networks"** to **ON** $\rightarrow$ Select **Localhost 8545** (Ensure Chain ID is set to `31337` under Networks settings).

### 2. Import the Pre-Funded Administrator Test Account
- In MetaMask, click the account icon $\rightarrow$ **Add account or hardware wallet** $\rightarrow$ **Import account**.
- Paste the Hardhat default administrator private key:
  ```text
  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
  ```
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` *(pre-loaded with 10,000 free local test ETH)*.

---

## Verification & Testing Guide

1. Open **[http://localhost:5173](http://localhost:5173)** in your browser.
2. **MetaMask Connect:** Click **"Connect MetaMask"** in the top navigation bar. Approve the connection. The header will display your admin address (`Admin: 0xf39F...2266`) and ETH balance.
3. **On-Chain Audit Signing:**
   - Go to **Security & Audit Log** in the sidebar.
   - Click **"Sign On-Chain with MetaMask"**.
   - Confirm the transaction in the MetaMask popup.
   - The transaction is mined into the next block on the local EVM blockchain and recorded in the audit list.
4. **On-Chain Verification:**
   - Click the **"Verify On-Chain"** button next to any recorded event.
   - The dashboard queries the smart contract and returns:
     > `✓ Confirmed on Smart Contract Ledger (Block #...)`
5. **Zero Trust Access Simulation:**
   - Navigate to **Access Requests** $\rightarrow$ Click **"Simulate Access Request"**.
   - Select a user, device, and target resource.
   - The Zero Trust engine evaluates the request, sends the permit/drop decision to the firewall, and automatically logs the tamper-evident decision hash on the blockchain.

---

## Standalone Helper Scripts

| Script | Purpose |
|---|---|
| [`setup.bat`](file:///setup.bat) | One-click installation of all dependencies across Backend, Frontend, and Blockchain. Preserves any existing venv. |
| [`start-all.bat`](file:///start-all.bat) | Launches all 3 layers (Blockchain, FastAPI, React) simultaneously. |
| [`start-blockchain.bat`](file:///start-blockchain.bat) | Launches only the local Hardhat EVM blockchain node on port 8545. |
| [`deploy-contract.bat`](file:///deploy-contract.bat) | Compiles and deploys `TrustChainAudit.sol` to the local node and syncs contract artifacts. |

---

## ⚠️ Academic Disclaimer

TrustChain is an academic cybersecurity project intended for learning, experimentation, and demonstration in a controlled lab environment. It is designed to demonstrate the practical combination of Zero Trust Network Architecture (ZTNA), automated firewall enforcement (OPNsense), and tamper-evident blockchain auditing.
