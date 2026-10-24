import os
import uuid
from datetime import datetime
from sqlalchemy.orm import Session
from models import User, Device, Policy, AccessRequest, SecurityEvent
from blockchain_connector import blockchain_service
import urllib.request
import urllib.error

# Configuration hooks for Person 2's completed services
PERSON2_ENGINE_URL = os.getenv("PERSON2_ENGINE_URL", "http://localhost:8001/api/evaluate")
OPNSENSE_API_KEY = os.getenv("OPNSENSE_API_KEY", "simulated_opnsense_key")
OPNSENSE_API_SECRET = os.getenv("OPNSENSE_API_SECRET", "simulated_opnsense_secret")
OPNSENSE_HOST = os.getenv("OPNSENSE_HOST", "https://opnsense.local")


BRIDGE_URL = os.getenv(
    "TRUSTCHAIN_BRIDGE_URL",
    "http://192.168.56.101:8001"
)

BRIDGE_API_KEY = os.getenv("TRUSTCHAIN_BRIDGE_KEY", "")


def send_firewall_decision(decision: str, device_id: str):
    if not BRIDGE_API_KEY:
        return False, "Bridge API key is not configured"

    endpoint = (
        "/api/firewall/allow"
        if decision == "ALLOW"
        else "/api/firewall/block"
    )

    request = urllib.request.Request(
        f"{BRIDGE_URL}{endpoint}?client={'Client-02' if device_id.strip().upper() == 'CLIENT-02' else 'Client-01'}",
        data=b"",
        method="POST",
        headers={"X-API-Key": BRIDGE_API_KEY}
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return response.status == 200, response.read().decode()

    except Exception as exc:
        return False, str(exc)


class ZeroTrustEngineConnector:
    """
    Bridge for Person 2's Zero Trust Engine, Risk Engine, and OPNsense Firewall.
    Executes standard Zero Trust continuous verification and dispatches firewall rules.
    """

    def evaluate_access(
        self,
        db: Session,
        user_id: int,
        device_id: int,
        resource: str,
        action: str = "READ"
    ) -> AccessRequest:
        user = db.query(User).filter(User.id == user_id).first()
        device = db.query(Device).filter(Device.id == device_id).first()

        req_code = f"REQ-{uuid.uuid4().hex[:8].upper()}"

        if not user:
            raise ValueError(f"User with ID {user_id} not found.")
        if not device:
            raise ValueError(f"Device with ID {device_id} not found.")

        # Update last seen
        device.last_seen = datetime.utcnow()

        decision = "DENY"
        reason = ""
        matched_policy = None
        enforced_by = "OPNsense Firewall [BLOCK-DROP]"

        # Step 1: User Identity Verification
        if user.status != "active":
            decision = "DENY"
            reason = f"Identity check failed: User account '{user.username}' is {user.status}."
        
        # Step 2: Device Posture & Status Check
        elif device.status != "active":
            decision = "DENY"
            reason = f"Device security check failed: Device '{device.device_name}' is {device.status}."
        
        else:
            # Step 3: Zero Trust Policy Match
            # Look for explicit or wildcard role match, and resource match
            policies = db.query(Policy).filter(Policy.is_active == True).all()
            
            for pol in policies:
                role_match = (pol.subject_role.lower() in [user.role.lower(), "all", "employee"])
                resource_match = (pol.resource.lower() in [resource.lower(), "all", "*"])
                action_match = (pol.action.upper() in [action.upper(), "ANY", "*"])

                if role_match and resource_match and action_match:
                    matched_policy = pol
                    break

            if not matched_policy:
                decision = "DENY"
                reason = f"No active policy permits role '{user.role}' to access '{resource}' with action '{action}'."
            else:
                # Step 4: Continuous Risk Score Evaluation (Person 2 Risk Engine)
                if device.risk_score <= matched_policy.max_risk_score:
                    decision = "ALLOW"
                    reason = f"Verified: Device risk ({device.risk_score}) satisfies policy threshold (<= {matched_policy.max_risk_score}) for '{matched_policy.name}'."
                    enforced_by = f"OPNsense Firewall [PERMIT {device.ip_address} -> {resource}]"
                else:
                    decision = "DENY"
                    reason = f"High Risk: Device risk ({device.risk_score}) exceeds policy threshold ({matched_policy.max_risk_score}) for '{matched_policy.name}'."
                    enforced_by = f"OPNsense Firewall [BLOCK-DROP {device.ip_address}]"

        # Send final decision to Person 2 Firewall Bridge
        firewall_ok, firewall_response = send_firewall_decision(
    decision, device.device_id
)

        if not firewall_ok:
            print(f"Firewall bridge error: {firewall_response}")
        else:
            print(f"Firewall decision sent: {decision}")

        # Generate Blockchain audit hash (Person 3 interface)
        tx_hash = blockchain_service.generate_audit_hash({
            "request_id": req_code,
            "user": user.username,
            "device": device.device_id,
            "resource": resource,
            "action": action,
            "decision": decision,
            "risk_score": device.risk_score,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Save Access Request record
        access_req = AccessRequest(
            request_id=req_code,
            user_id=user.id,
            device_id=device.id,
            resource=resource,
            action=action,
            calculated_risk=device.risk_score,
            matched_policy_id=matched_policy.id if matched_policy else None,
            decision=decision,
            reason=reason,
            enforced_by=enforced_by,
            blockchain_tx_hash=tx_hash,
            timestamp=datetime.utcnow()
        )
        db.add(access_req)

        # Log security event if access was denied or device is high-risk
        if decision == "DENY":
            sec_event = SecurityEvent(
                event_type="ACCESS_DENIED",
                severity="HIGH" if device.risk_score > 70 else "MEDIUM",
                source_ip=device.ip_address,
                device_name=device.device_name,
                description=f"Access denied for {user.username} on {device.device_name} attempting {action} on {resource}. {reason}",
                tx_hash=tx_hash,
                timestamp=datetime.utcnow()
            )
            db.add(sec_event)

        db.commit()
        db.refresh(access_req)
        return access_req

    def get_status(self):
        return {
            "status": "ONLINE",
            "layer": "Person 2 Zero Trust & OPNsense Layer",
            "policy_engine": "ACTIVE",
            "risk_engine": "ACTIVE",
            "opnsense_gateway": "CONNECTED (Simulated API / Ready for Live Firewall)",
            "opnsense_host": OPNSENSE_HOST,
            "engine_url": PERSON2_ENGINE_URL,
            "capabilities": ["Dynamic ACL Push", "Continuous Risk Evaluation", "Stateful Drop/Pass Rules"]
        }

zt_engine_service = ZeroTrustEngineConnector()