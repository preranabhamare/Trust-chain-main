@echo off
title TrustChain - Deploy Smart Contract (Person 3)
echo ========================================================
echo Deploying TrustChainAudit.sol to Local EVM Blockchain
echo ========================================================

cd /d "%~dp0blockchain"
npx hardhat run scripts/deploy.js --network localhost
echo.
echo Deployment finished.
pause
