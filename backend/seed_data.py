from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from models import User, Device, Policy, AccessRequest, SecurityEvent
from blockchain_connector import blockchain_service

def seed_database(db: Session):
    # Check if data already exists
    if db.query(User).count() > 0:
        return

    print("Seeding TrustChain database with realistic initial data...")

    # 1. Create Users
    users_data = [
        User(username="alice", email="alice.smith@trustchain.local", full_name="Alice Smith", role="DevOps Engineer", department="Infrastructure", status="active"),
        User(username="bob", email="bob.johnson@trustchain.local", full_name="Bob Johnson", role="Backend Engineer", department="Engineering", status="active"),
        User(username="charlie", email="charlie.davis@trustchain.local", full_name="Charlie Davis", role="SecOps Lead", department="Cybersecurity", status="active"),
        User(username="diana", email="diana.prince@trustchain.local", full_name="Diana Prince", role="Admin", department="Executive IT", status="active"),
        User(username="elena", email="elena.rostova@trustchain.local", full_name="Elena Rostova", role="Contractor", department="External Dev", status="active"),
        User(username="frank_inactive", email="frank.vance@trustchain.local", full_name="Frank Vance", role="Employee", department="Marketing", status="inactive"),
    ]
    db.add_all(users_data)
    db.commit()

    alice = db.query(User).filter(User.username == "alice").first()
    bob = db.query(User).filter(User.username == "bob").first()
    charlie = db.query(User).filter(User.username == "charlie").first()
    diana = db.query(User).filter(User.username == "diana").first()
    elena = db.query(User).filter(User.username == "elena").first()

    # 2. Create Devices
    devices_data = [
        Device(device_id="DEV-PC-001", device_name="Alice's MacBook Pro M3", ip_address="192.168.10.24", mac_address="3C:22:FB:45:01:A9", os_type="macOS Sonoma", owner_id=alice.id, risk_score=15, status="active"),
        Device(device_id="DEV-PC-002", device_name="Bob's ThinkPad T14", ip_address="192.168.10.35", mac_address="F0:76:1C:82:33:DE", os_type="Ubuntu 22.04", owner_id=bob.id, risk_score=32, status="active"),
        Device(device_id="DEV-PC-003", device_name="Charlie's SecOps Workstation", ip_address="192.168.10.12", mac_address="00:1B:44:11:3A:B7", os_type="Arch Linux Hardened", owner_id=charlie.id, risk_score=8, status="active"),
        Device(device_id="DEV-PC-004", device_name="Diana's Surface Studio", ip_address="192.168.10.88", mac_address="AC:DE:48:00:11:22", os_type="Windows 11 Pro", owner_id=diana.id, risk_score=18, status="active"),
        Device(device_id="DEV-PC-005", device_name="Elena's BYOD Laptop", ip_address="192.168.20.104", mac_address="88:66:5A:77:BC:10", os_type="Windows 11 Home", owner_id=elena.id, risk_score=58, status="active"),
        Device(device_id="DEV-PC-006", device_name="Rogue / Vulnerable Machine", ip_address="192.168.50.211", mac_address="AA:BB:CC:DD:EE:FF", os_type="Windows 7 Outdated", owner_id=None, risk_score=94, status="blocked"),
    ]
    db.add_all(devices_data)
    db.commit()

    dev_pc_001 = db.query(Device).filter(Device.device_id == "DEV-PC-001").first()
    dev_pc_002 = db.query(Device).filter(Device.device_id == "DEV-PC-002").first()
    dev_pc_003 = db.query(Device).filter(Device.device_id == "DEV-PC-003").first()
    dev_pc_005 = db.query(Device).filter(Device.device_id == "DEV-PC-005").first()
    dev_pc_006 = db.query(Device).filter(Device.device_id == "DEV-PC-006").first()

    # 3. Create Zero Trust Policies
    policies_data = [
        Policy(name="Production Database Access", subject_role="DevOps Engineer", resource="Production Database", action="READ", max_risk_score=40, is_active=True, description="Strict access to production PostgreSQL database for DevOps team"),
        Policy(name="Database Administrative Access", subject_role="DevOps Engineer", resource="Production Database", action="WRITE", max_risk_score=25, is_active=True, description="Write/DDL permissions to production database with high security assurance"),
        Policy(name="Developer API Gateway", subject_role="Backend Engineer", resource="API Gateway", action="READ", max_risk_score=45, is_active=True, description="General API and microservice endpoint querying"),
        Policy(name="Security Vault Admin Console", subject_role="SecOps Lead", resource="Security Vault", action="ADMIN", max_risk_score=20, is_active=True, description="Zero Trust root credential and secret management vault"),
        Policy(name="Company Knowledge Base & Wiki", subject_role="All", resource="Internal Wiki", action="READ", max_risk_score=70, is_active=True, description="Corporate documentation and intranet reading access"),
        Policy(name="Payment Processing Subsystem", subject_role="Admin", resource="Payment Gateway", action="ADMIN", max_risk_score=20, is_active=True, description="PCI-DSS compliant payment processing subsystem management"),
    ]
    db.add_all(policies_data)
    db.commit()

    pol_db_read = db.query(Policy).filter(Policy.name == "Production Database Access").first()
    pol_api = db.query(Policy).filter(Policy.name == "Developer API Gateway").first()
    pol_wiki = db.query(Policy).filter(Policy.name == "Company Knowledge Base & Wiki").first()

    # 4. Create Historical Access Requests
    now = datetime.utcnow()
    requests_data = [
        AccessRequest(
            request_id="REQ-7101",
            user_id=alice.id,
            device_id=dev_pc_001.id,
            resource="Production Database",
            action="READ",
            calculated_risk=15,
            matched_policy_id=pol_db_read.id,
            decision="ALLOW",
            reason="Verified: Device risk (15) satisfies policy threshold (<= 40) for 'Production Database Access'.",
            enforced_by="OPNsense Firewall [PERMIT 192.168.10.24 -> Production Database]",
            blockchain_tx_hash=blockchain_service.generate_audit_hash({"req": "7101"}),
            timestamp=now - timedelta(minutes=140)
        ),
        AccessRequest(
            request_id="REQ-7102",
            user_id=bob.id,
            device_id=dev_pc_002.id,
            resource="API Gateway",
            action="READ",
            calculated_risk=32,
            matched_policy_id=pol_api.id,
            decision="ALLOW",
            reason="Verified: Device risk (32) satisfies policy threshold (<= 45) for 'Developer API Gateway'.",
            enforced_by="OPNsense Firewall [PERMIT 192.168.10.35 -> API Gateway]",
            blockchain_tx_hash=blockchain_service.generate_audit_hash({"req": "7102"}),
            timestamp=now - timedelta(minutes=95)
        ),
        AccessRequest(
            request_id="REQ-7103",
            user_id=elena.id,
            device_id=dev_pc_005.id,
            resource="Production Database",
            action="READ",
            calculated_risk=58,
            matched_policy_id=pol_db_read.id,
            decision="DENY",
            reason="High Risk: Device risk (58) exceeds policy threshold (40) for 'Production Database Access'.",
            enforced_by="OPNsense Firewall [BLOCK-DROP 192.168.20.104]",
            blockchain_tx_hash=blockchain_service.generate_audit_hash({"req": "7103"}),
            timestamp=now - timedelta(minutes=62)
        ),
        AccessRequest(
            request_id="REQ-7104",
            user_id=bob.id,
            device_id=dev_pc_002.id,
            resource="Internal Wiki",
            action="READ",
            calculated_risk=32,
            matched_policy_id=pol_wiki.id,
            decision="ALLOW",
            reason="Verified: Device risk (32) satisfies policy threshold (<= 70) for 'Company Knowledge Base & Wiki'.",
            enforced_by="OPNsense Firewall [PERMIT 192.168.10.35 -> Internal Wiki]",
            blockchain_tx_hash=blockchain_service.generate_audit_hash({"req": "7104"}),
            timestamp=now - timedelta(minutes=34)
        ),
        AccessRequest(
            request_id="REQ-7105",
            user_id=alice.id,
            device_id=dev_pc_006.id,
            resource="Production Database",
            action="WRITE",
            calculated_risk=94,
            matched_policy_id=None,
            decision="DENY",
            reason="Device security check failed: Device 'Rogue / Vulnerable Machine' is blocked.",
            enforced_by="OPNsense Firewall [BLOCK-DROP 192.168.50.211]",
            blockchain_tx_hash=blockchain_service.generate_audit_hash({"req": "7105"}),
            timestamp=now - timedelta(minutes=10)
        ),
    ]
    db.add_all(requests_data)
    db.commit()

    # 5. Create Security Events
    events_data = [
        SecurityEvent(
            event_type="DEVICE_BLOCKED",
            severity="CRITICAL",
            source_ip="192.168.50.211",
            device_name="Rogue / Vulnerable Machine",
            description="Device flagged with critical risk score (94) due to unpatched CVEs and anomalous outbound telemetry. Automatically quarantined.",
            tx_hash=blockchain_service.generate_audit_hash({"event": "quarantine"}),
            timestamp=now - timedelta(hours=3)
        ),
        SecurityEvent(
            event_type="ACCESS_DENIED",
            severity="HIGH",
            source_ip="192.168.20.104",
            device_name="Elena's BYOD Laptop",
            description="Unauthorized access attempt to Production Database denied. Device risk score 58 exceeded threshold 40.",
            tx_hash=blockchain_service.generate_audit_hash({"event": "access_denied_elena"}),
            timestamp=now - timedelta(minutes=62)
        ),
        SecurityEvent(
            event_type="POLICY_CREATED",
            severity="INFO",
            source_ip="192.168.10.12",
            device_name="Charlie's SecOps Workstation",
            description="Zero Trust policy 'Payment Processing Subsystem' created with maximum risk threshold 20.",
            tx_hash=blockchain_service.generate_audit_hash({"event": "policy_add"}),
            timestamp=now - timedelta(hours=5)
        ),
        SecurityEvent(
            event_type="FIREWALL_SYNC",
            severity="INFO",
            source_ip="192.168.1.1",
            device_name="OPNsense Core Gateway",
            description="OPNsense firewall rules synchronized with TrustChain policy engine. 6 stateful ACLs active.",
            tx_hash=blockchain_service.generate_audit_hash({"event": "opnsense_sync"}),
            timestamp=now - timedelta(hours=6)
        ),
    ]
    db.add_all(events_data)
    db.commit()
    print("Database seeding completed successfully!")
