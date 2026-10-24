@echo off
title TrustChain - Local EVM Blockchain (Person 3)
echo ========================================================
echo Starting TrustChain Local EVM Blockchain Node (Hardhat)
echo Network: http://127.0.0.1:8545
echo Chain ID: 31337 (0x7a69)
echo ========================================================

cd /d "%~dp0blockchain"
npx hardhat node
pause
