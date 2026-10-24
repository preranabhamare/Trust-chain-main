@echo off
title TrustChain - Zero Trust Network Manager
cd /d "%~dp0"

echo ========================================================
echo Starting TrustChain Full Stack (Person 1, 2, 3)
echo - Person 1: Management Dashboard (Port 5173)
echo - Person 2: Zero Trust & Firewall Engine (Port 8000)
echo - Person 3: EVM Blockchain & MetaMask Bridge (Port 8545)
echo ========================================================

:: 1. Launch Blockchain Node in background (Person 3)
echo [1/4] Starting local EVM Blockchain Node...
start "TrustChain Blockchain (Hardhat EVM)" cmd /k "cd /d "%~dp0blockchain" && npx hardhat node"

:: 2. Wait for node to be ready, then deploy contract synchronously before backend starts
echo [2/4] Waiting for blockchain node to initialize...
timeout /t 4 /nobreak >nul
echo Deploying TrustChainAudit smart contract...
cd /d "%~dp0blockchain"
call npx hardhat run scripts/deploy.js --network localhost
cd /d "%~dp0"

:: 3. Launch Backend with fresh contract_info.json (FastAPI - Person 1 & 2)
echo.
echo [3/4] Launching FastAPI Backend...
start "TrustChain Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && (if exist venv\Scripts\activate call venv\Scripts\activate) && (if exist .venv\Scripts\activate call .venv\Scripts\activate) && (if exist env\Scripts\activate call env\Scripts\activate) && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

:: 4. Launch Frontend (React + Vite - Person 1 & 3)
echo [4/4] Launching React Frontend Dashboard...
start "TrustChain Frontend (React + Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================================
echo All TrustChain services are live!
echo - Frontend Dashboard: http://localhost:5173
echo - Backend API Docs:   http://localhost:8000/docs
echo - Blockchain RPC:     http://127.0.0.1:8545 (Chain ID: 31337)
echo ========================================================
echo.
pause
