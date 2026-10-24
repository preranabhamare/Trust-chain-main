@echo off
title TrustChain - One-Click Environment Setup
cd /d "%~dp0"

echo ========================================================
echo Installing TrustChain Dependencies for all 3 layers:
echo 1. Backend (Python venv + requirements)
echo 2. Frontend (Node.js npm packages + ethers)
echo 3. Blockchain (Hardhat + Smart Contract toolchain)
echo ========================================================
echo.

:: 1. Backend Setup
echo [1/3] Checking Python virtual environment & backend packages...
cd /d "%~dp0backend"

if exist venv\Scripts\activate (
    echo Found existing 'venv'. Activating...
    call venv\Scripts\activate
) else if exist .venv\Scripts\activate (
    echo Found existing '.venv'. Activating...
    call .venv\Scripts\activate
) else if exist env\Scripts\activate (
    echo Found existing 'env'. Activating...
    call env\Scripts\activate
) else (
    echo No existing virtual environment found. Creating 'venv'...
    python -m venv venv
    call venv\Scripts\activate
)

echo Installing/updating Python requirements (FastAPI, SQLAlchemy, Web3)...
pip install -r requirements.txt

:: 2. Frontend Setup
echo.
echo [2/3] Installing Frontend packages (including ethers.js for MetaMask)...
cd /d "%~dp0frontend"
call npm install

:: 3. Blockchain Setup
echo.
echo [3/3] Installing Blockchain packages (Hardhat EVM)...
cd /d "%~dp0blockchain"
call npm install

echo.
echo ========================================================
echo Setup Complete! All dependencies are installed/updated.
echo You can now run 'start-all.bat' to launch everything.
echo ========================================================
pause
