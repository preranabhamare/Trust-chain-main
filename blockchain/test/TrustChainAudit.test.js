const { expect } = require("chai");
const hre = require("hardhat");

describe("TrustChainAudit Smart Contract (Person 3)", function () {
  let TrustChainAudit;
  let auditContract;
  let owner;
  let admin2;
  let unauthorizedUser;

  beforeEach(async function () {
    [owner, admin2, unauthorizedUser] = await hre.ethers.getSigners();
    TrustChainAudit = await hre.ethers.getContractFactory("TrustChainAudit");
    auditContract = await TrustChainAudit.deploy();
    await auditContract.waitForDeployment();
  });

  it("Should set the deployer as the initial owner and authorized admin", async function () {
    expect(await auditContract.owner()).to.equal(owner.address);
    expect(await auditContract.isAdmin(owner.address)).to.equal(true);
    expect(await auditContract.isAdmin(unauthorizedUser.address)).to.equal(false);
  });

  it("Should allow the owner to authorize a new MetaMask admin", async function () {
    await auditContract.setAdmin(admin2.address, true);
    expect(await auditContract.isAdmin(admin2.address)).to.equal(true);
  });

  it("Should allow an admin to record a security audit event and verify its hash", async function () {
    const testHash = "0x8fa23910cd93b821948123912839120938120938120938120938120938120938";
    
    const tx = await auditContract.recordSecurityEvent(
      "DEVICE_STATUS_CHANGE",
      "DEV-992",
      "CRITICAL",
      "BLOCKED_BY_FIREWALL",
      testHash
    );
    await tx.wait();

    expect(await auditContract.getSecurityEventsCount()).to.equal(1n);
    expect(await auditContract.verifyAuditHash(testHash)).to.equal(true);

    const event = await auditContract.getSecurityEvent(1);
    expect(event.eventType).to.equal("DEVICE_STATUS_CHANGE");
    expect(event.severity).to.equal("CRITICAL");
    expect(event.detailsHash).to.equal(testHash);
    expect(event.recordedBy).to.equal(owner.address);
  });

  it("Should record a Zero Trust access decision", async function () {
    const tx = await auditContract.recordAccessDecision(
      "REQ-8819",
      "alice",
      "DEV-001",
      "Production Database",
      "READ",
      "ALLOW",
      15,
      "Production Database Access",
      "OPNsense [PERMIT 192.168.10.24]",
      "0x1111222233334444555566667777888899990000111122223333444455556666"
    );
    await tx.wait();

    expect(await auditContract.getAccessDecisionsCount()).to.equal(1n);
    const decision = await auditContract.getAccessDecision(1);
    expect(decision.requestId).to.equal("REQ-8819");
    expect(decision.decision).to.equal("ALLOW");
    expect(decision.calculatedRisk).to.equal(15);
  });

  it("Should reject unverified callers attempting to log events", async function () {
    await expect(
      auditContract.connect(unauthorizedUser).recordSecurityEvent(
        "ROGUE_ATTEMPT",
        "DEV-ATTACK",
        "HIGH",
        "BYPASS_ATTEMPT",
        "0xabcdef"
      )
    ).to.be.revertedWith("TrustChainAudit: Caller is not an authorized administrator");
  });
});
