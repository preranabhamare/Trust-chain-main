// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TrustChainAudit
 * @dev Person 3: Blockchain & Smart Contract Audit Layer for TrustChain Zero Trust Architecture.
 * Records immutable, tamper-evident logs of access requests, policy mutations, 
 * device status updates, and security events with MetaMask cryptographic authorization.
 */
contract TrustChainAudit {
    address public owner;

    // Authorized MetaMask Administrators
    mapping(address => bool) public authorizedAdmins;

    struct SecurityEvent {
        uint256 id;
        string eventType;      // e.g. "POLICY_MUTATION", "DEVICE_STATUS_CHANGE", "USER_MANAGEMENT", "FIREWALL_TRIGGER"
        string subject;        // Target subject (e.g., Device ID, Username, Policy Name)
        string severity;       // "INFO", "HIGH", "CRITICAL"
        string action;         // Action performed
        string detailsHash;    // Keccak/SHA256 digest of detailed event payload
        address recordedBy;    // MetaMask address of the administrator or backend signer
        uint256 timestamp;
        uint256 blockNumber;
    }

    struct AccessDecision {
        uint256 id;
        string requestId;      // e.g. "REQ-7BFCDF54"
        string username;       // User identity
        string deviceId;       // Device requesting access
        string resource;       // Target protected resource (e.g., "Production Database")
        string action;         // "READ", "WRITE", "EXECUTE"
        string decision;       // "ALLOW" or "DENY"
        uint8 calculatedRisk;  // 0 - 100 risk score
        string policyName;     // Matched policy or "Default Zero Trust Drop"
        string enforcement;    // e.g. "OPNsense Firewall [PERMIT 192.168.10.24 -> DB]"
        bytes32 auditDigest;   // SHA256/Keccak digest of the decision
        uint256 timestamp;
        uint256 blockNumber;
    }

    // Log storage
    SecurityEvent[] private securityEvents;
    AccessDecision[] private accessDecisions;

    // Mapping from hash string to existence for fast on-chain verification
    mapping(string => bool) public registeredHashes;
    mapping(bytes32 => bool) public registeredDigests;

    // Events for real-time web3 listening
    event AdminStatusUpdated(address indexed admin, bool isAuthorized);
    event SecurityEventLogged(
        uint256 indexed id,
        string indexed eventType,
        string severity,
        address indexed recordedBy,
        string detailsHash,
        uint256 timestamp
    );
    event AccessDecisionLogged(
        uint256 indexed id,
        string indexed requestId,
        string decision,
        uint8 calculatedRisk,
        string resource,
        uint256 timestamp
    );

    modifier onlyAdmin() {
        require(
            msg.sender == owner || authorizedAdmins[msg.sender],
            "TrustChainAudit: Caller is not an authorized administrator"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedAdmins[msg.sender] = true;
        emit AdminStatusUpdated(msg.sender, true);
    }

    /**
     * @dev Authorize or revoke a MetaMask administrator account
     */
    function setAdmin(address _admin, bool _status) external onlyAdmin {
        require(_admin != address(0), "Invalid address");
        authorizedAdmins[_admin] = _status;
        emit AdminStatusUpdated(_admin, _status);
    }

    /**
     * @dev Check whether an address is an authorized admin
     */
    function isAdmin(address _admin) external view returns (bool) {
        return (_admin == owner || authorizedAdmins[_admin]);
    }

    /**
     * @dev Record a security audit event on-chain (MetaMask or backend authorized)
     */
    function recordSecurityEvent(
        string memory _eventType,
        string memory _subject,
        string memory _severity,
        string memory _action,
        string memory _detailsHash
    ) external onlyAdmin returns (uint256) {
        uint256 newId = securityEvents.length + 1;

        SecurityEvent memory newEvent = SecurityEvent({
            id: newId,
            eventType: _eventType,
            subject: _subject,
            severity: _severity,
            action: _action,
            detailsHash: _detailsHash,
            recordedBy: msg.sender,
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        securityEvents.push(newEvent);
        registeredHashes[_detailsHash] = true;

        emit SecurityEventLogged(
            newId,
            _eventType,
            _severity,
            msg.sender,
            _detailsHash,
            block.timestamp
        );

        return newId;
    }

    /**
     * @dev Record a Zero Trust access decision on-chain
     */
    function recordAccessDecision(
        string memory _requestId,
        string memory _username,
        string memory _deviceId,
        string memory _resource,
        string memory _action,
        string memory _decision,
        uint8 _calculatedRisk,
        string memory _policyName,
        string memory _enforcement,
        string memory _hashStr
    ) external onlyAdmin returns (uint256) {
        uint256 newId = accessDecisions.length + 1;
        bytes32 digest = keccak256(abi.encodePacked(_requestId, _decision, _calculatedRisk, block.timestamp));

        AccessDecision memory newDecision = AccessDecision({
            id: newId,
            requestId: _requestId,
            username: _username,
            deviceId: _deviceId,
            resource: _resource,
            action: _action,
            decision: _decision,
            calculatedRisk: _calculatedRisk,
            policyName: _policyName,
            enforcement: _enforcement,
            auditDigest: digest,
            timestamp: block.timestamp,
            blockNumber: block.number
        });

        accessDecisions.push(newDecision);
        registeredDigests[digest] = true;
        if (bytes(_hashStr).length > 0) {
            registeredHashes[_hashStr] = true;
        }

        emit AccessDecisionLogged(
            newId,
            _requestId,
            _decision,
            _calculatedRisk,
            _resource,
            block.timestamp
        );

        return newId;
    }

    /**
     * @dev Verify if a particular hash exists on the immutable ledger
     */
    function verifyAuditHash(string memory _hash) external view returns (bool) {
        return registeredHashes[_hash];
    }

    /**
     * @dev Get total count of recorded security events
     */
    function getSecurityEventsCount() external view returns (uint256) {
        return securityEvents.length;
    }

    /**
     * @dev Get total count of recorded access decisions
     */
    function getAccessDecisionsCount() external view returns (uint256) {
        return accessDecisions.length;
    }

    /**
     * @dev Retrieve security event by index (1-indexed)
     */
    function getSecurityEvent(uint256 _id) external view returns (SecurityEvent memory) {
        require(_id > 0 && _id <= securityEvents.length, "Invalid event ID");
        return securityEvents[_id - 1];
    }

    /**
     * @dev Retrieve access decision by index (1-indexed)
     */
    function getAccessDecision(uint256 _id) external view returns (AccessDecision memory) {
        require(_id > 0 && _id <= accessDecisions.length, "Invalid decision ID");
        return accessDecisions[_id - 1];
    }

    /**
     * @dev Quick batch retrieval for dashboard audit view (returns most recent events)
     */
    function getRecentSecurityEvents(uint256 _limit) external view returns (SecurityEvent[] memory) {
        uint256 total = securityEvents.length;
        if (total == 0) {
            return new SecurityEvent[](0);
        }
        uint256 count = _limit > total ? total : _limit;
        SecurityEvent[] memory recent = new SecurityEvent[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = securityEvents[total - 1 - i];
        }
        return recent;
    }
}
