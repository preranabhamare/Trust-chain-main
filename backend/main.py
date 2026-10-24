import os
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import engine, Base, get_db
from models import User, Device, Policy, AccessRequest, SecurityEvent
import schemas
from seed_data import seed_database
from engine_connector import zt_engine_service, send_firewall_decision
from blockchain_connector import blockchain_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables
    Base.metadata.create_all(bind=engine)
    # Seed sample data
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="TrustChain — Zero Trust Network Manager API",
    description="Person 1 Dashboard & Application Management Layer connecting to Person 2 Zero Trust Engine & Person 3 Blockchain",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# 1. OVERVIEW & METRICS ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/overview", response_model=schemas.DashboardOverview)
def get_dashboard_overview(db: Session = Depends(get_db)):
    total_devices = db.query(Device).count()
    active_users = db.query(User).filter(User.status == "active").count()
    allowed_requests = db.query(AccessRequest).filter(AccessRequest.decision == "ALLOW").count()
    denied_requests = db.query(AccessRequest).filter(AccessRequest.decision == "DENY").count()
    high_risk_devices = db.query(Device).filter(Device.risk_score >= 70).count()

    # Risk Distribution Breakdown
    low_risk = db.query(Device).filter(Device.risk_score < 30).count()
    medium_risk = db.query(Device).filter(Device.risk_score >= 30, Device.risk_score < 70).count()
    high_risk = db.query(Device).filter(Device.risk_score >= 70).count()

    recent_events = db.query(SecurityEvent).order_by(desc(SecurityEvent.timestamp)).limit(6).all()
    recent_requests_raw = db.query(AccessRequest).order_by(desc(AccessRequest.timestamp)).limit(6).all()

    recent_requests = []
    for r in recent_requests_raw:
        recent_requests.append(schemas.AccessRequestOut(
            id=r.id,
            request_id=r.request_id,
            user_id=r.user_id,
            device_id=r.device_id,
            resource=r.resource,
            action=r.action,
            calculated_risk=r.calculated_risk,
            matched_policy_id=r.matched_policy_id,
            decision=r.decision,
            reason=r.reason,
            enforced_by=r.enforced_by,
            blockchain_tx_hash=r.blockchain_tx_hash,
            timestamp=r.timestamp,
            user_name=r.user.full_name if r.user else "Unknown User",
            device_name=r.device.device_name if r.device else "Unknown Device",
            policy_name=r.matched_policy.name if r.matched_policy else "Default Zero Trust Drop"
        ))

    system_health = "OPTIMAL" if high_risk_devices == 0 else ("WARNING" if high_risk_devices <= 2 else "ELEVATED THREAT")

    return schemas.DashboardOverview(
        total_devices=total_devices,
        active_users=active_users,
        allowed_requests=allowed_requests,
        denied_requests=denied_requests,
        high_risk_devices=high_risk_devices,
        system_health=system_health,
        recent_events=recent_events,
        recent_requests=recent_requests,
        risk_summary={
            "low": low_risk,
            "medium": medium_risk,
            "high": high_risk
        }
    )

# -------------------------------------------------------------
# 2. USER MANAGEMENT ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/users", response_model=List[schemas.UserOut])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    result = []
    for u in users:
        u_out = schemas.UserOut(
            id=u.id,
            username=u.username,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            department=u.department,
            status=u.status,
            created_at=u.created_at,
            device_count=len(u.devices)
        )
        result.append(u_out)
    return result

@app.post("/api/users", response_model=schemas.UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this username or email already exists.")

    user = User(
        username=user_in.username,
        email=user_in.email,
        full_name=user_in.full_name,
        role=user_in.role,
        department=user_in.department,
        status=user_in.status,
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log security event
    sec_event = SecurityEvent(
        event_type="USER_CREATED",
        severity="INFO",
        description=f"New user '{user.username}' created with role '{user.role}' in department '{user.department}'",
        tx_hash=blockchain_service.generate_audit_hash({"action": "create_user", "username": user.username}),
        timestamp=datetime.utcnow()
    )
    db.add(sec_event)
    db.commit()

    return schemas.UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        department=user.department,
        status=user.status,
        created_at=user.created_at,
        device_count=0
    )

@app.put("/api/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, user_in: schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.role is not None:
        user.role = user_in.role
    if user_in.department is not None:
        user.department = user_in.department
    if user_in.status is not None:
        user.status = user_in.status

    db.commit()
    db.refresh(user)

    return schemas.UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        department=user.department,
        status=user.status,
        created_at=user.created_at,
        device_count=len(user.devices)
    )

@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    username = user.username

    # Remove access requests associated with this user or any of their owned devices
    user_device_ids = [d.id for d in user.devices]
    if user_device_ids:
        db.query(AccessRequest).filter(AccessRequest.device_id.in_(user_device_ids)).delete(synchronize_session=False)
    db.query(AccessRequest).filter(AccessRequest.user_id == user_id).delete(synchronize_session=False)
    db.query(Device).filter(Device.owner_id == user_id).delete(synchronize_session=False)
    db.expire_all()

    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
    db.commit()

    sec_event = SecurityEvent(
        event_type="USER_DELETED",
        severity="INFO",
        description=f"User '{username}' and associated devices were removed from the directory",
        tx_hash=blockchain_service.generate_audit_hash({"action": "delete_user", "username": username}),
        timestamp=datetime.utcnow()
    )
    db.add(sec_event)
    db.commit()

    return {"message": f"User {username} deleted successfully."}

# -------------------------------------------------------------
# 3. DEVICE MANAGEMENT ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/devices", response_model=List[schemas.DeviceOut])
def get_devices(db: Session = Depends(get_db)):
    devices = db.query(Device).all()
    result = []
    for d in devices:
        result.append(schemas.DeviceOut(
            id=d.id,
            device_id=d.device_id,
            device_name=d.device_name,
            ip_address=d.ip_address,
            mac_address=d.mac_address,
            os_type=d.os_type,
            owner_id=d.owner_id,
            risk_score=d.risk_score,
            status=d.status,
            last_seen=d.last_seen,
            created_at=d.created_at,
            owner_name=d.owner.full_name if d.owner else "Unassigned"
        ))
    return result

@app.post("/api/devices", response_model=schemas.DeviceOut, status_code=status.HTTP_201_CREATED)
def register_device(device_in: schemas.DeviceCreate, db: Session = Depends(get_db)):
    existing = db.query(Device).filter(Device.device_id == device_in.device_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Device ID already registered.")

    device = Device(
        device_id=device_in.device_id,
        device_name=device_in.device_name,
        ip_address=device_in.ip_address,
        mac_address=device_in.mac_address,
        os_type=device_in.os_type,
        owner_id=device_in.owner_id,
        risk_score=device_in.risk_score,
        status=device_in.status,
        last_seen=datetime.utcnow(),
        created_at=datetime.utcnow()
    )
    db.add(device)
    db.commit()
    db.refresh(device)

    # Log security & blockchain event
    tx_hash = blockchain_service.generate_audit_hash({
        "action": "register_device",
        "device_id": device.device_id,
        "ip": device.ip_address,
        "risk_score": device.risk_score
    })
    sec_event = SecurityEvent(
        event_type="DEVICE_REGISTERED",
        severity="INFO",
        source_ip=device.ip_address,
        device_name=device.device_name,
        description=f"Device '{device.device_name}' ({device.device_id}) registered with initial risk score {device.risk_score}",
        tx_hash=tx_hash,
        timestamp=datetime.utcnow()
    )
    db.add(sec_event)
    db.commit()

    return schemas.DeviceOut(
        id=device.id,
        device_id=device.device_id,
        device_name=device.device_name,
        ip_address=device.ip_address,
        mac_address=device.mac_address,
        os_type=device.os_type,
        owner_id=device.owner_id,
        risk_score=device.risk_score,
        status=device.status,
        last_seen=device.last_seen,
        created_at=device.created_at,
        owner_name=device.owner.full_name if device.owner else "Unassigned"
    )

@app.put("/api/devices/{device_id}", response_model=schemas.DeviceOut)
def update_device(device_id: int, device_in: schemas.DeviceUpdate, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found.")

    if device_in.device_name is not None:
        device.device_name = device_in.device_name
    if device_in.ip_address is not None:
        device.ip_address = device_in.ip_address
    if device_in.os_type is not None:
        device.os_type = device_in.os_type
    if device_in.owner_id is not None:
        device.owner_id = device_in.owner_id
    if device_in.risk_score is not None:
        old_score = device.risk_score
        device.risk_score = device_in.risk_score
        if device.risk_score >= 70 and old_score < 70:
            # Trigger high risk alert
            sec_event = SecurityEvent(
                event_type="HIGH_RISK_DETECTED",
                severity="HIGH",
                source_ip=device.ip_address,
                device_name=device.device_name,
                description=f"Device risk score increased to high risk level: {device.risk_score}/100",
                tx_hash=blockchain_service.generate_audit_hash({"risk_elevated": device.device_id}),
                timestamp=datetime.utcnow()
            )
            db.add(sec_event)

    if device_in.status is not None:
        device.status = device_in.status

    db.commit()
    db.refresh(device)

    return schemas.DeviceOut(
        id=device.id,
        device_id=device.device_id,
        device_name=device.device_name,
        ip_address=device.ip_address,
        mac_address=device.mac_address,
        os_type=device.os_type,
        owner_id=device.owner_id,
        risk_score=device.risk_score,
        status=device.status,
        last_seen=device.last_seen,
        created_at=device.created_at,
        owner_name=device.owner.full_name if device.owner else "Unassigned"
    )


@app.post("/api/devices/{device_id}/toggle-status")
def toggle_device_status(
    device_id: int,
    payload: schemas.DeviceToggleStatus,
    db: Session = Depends(get_db)
):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found.")

    if payload.status not in ["active", "blocked", "quarantined"]:
        raise HTTPException(status_code=400, detail="Invalid device status.")

    old_status = device.status

    if payload.status in ["blocked", "active"]:
        decision = "DENY" if payload.status == "blocked" else "ALLOW"

        firewall_ok, firewall_response = send_firewall_decision(
            decision, device.device_id
        )

        if not firewall_ok:
            raise HTTPException(
                status_code=502,
                detail=f"Firewall update failed: {firewall_response}"
            )

    device.status = payload.status
    db.commit()

    event_type = (
        "DEVICE_BLOCKED" if payload.status == "blocked"
        else "DEVICE_UNBLOCKED" if payload.status == "active"
        else "DEVICE_QUARANTINED"
    )
    severity = "CRITICAL" if payload.status == "blocked" else "INFO"

    tx_hash = blockchain_service.generate_audit_hash({
        "action": "toggle_device_status",
        "device_id": device.device_id,
        "old_status": old_status,
        "new_status": payload.status
    })

    sec_event = SecurityEvent(
        event_type=event_type,
        severity=severity,
        source_ip=device.ip_address,
        device_name=device.device_name,
        description=(
            f"Device '{device.device_name}' status changed "
            f"from '{old_status}' to '{payload.status}'. "
            "Firewall update completed."
        ),
        tx_hash=tx_hash,
        timestamp=datetime.utcnow()
    )
    db.add(sec_event)
    db.commit()

    return {
        "message": f"Device {device.device_name} is now {payload.status}.",
        "status": device.status
    }


@app.delete("/api/devices/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found.")
    name = device.device_name
    dev_identifier = device.device_id
    source_ip = device.ip_address

    # Remove historical access requests referencing this device to avoid FK constraint errors
    db.query(AccessRequest).filter(AccessRequest.device_id == device_id).delete(synchronize_session=False)
    db.expire_all()

    device = db.query(Device).filter(Device.id == device_id).first()
    if device:
        db.delete(device)
    db.commit()

    sec_event = SecurityEvent(
        event_type="DEVICE_UNREGISTERED",
        severity="INFO",
        source_ip=source_ip,
        device_name=name,
        description=f"Device '{name}' ({dev_identifier}) was unregistered from inventory",
        tx_hash=blockchain_service.generate_audit_hash({"action": "delete_device", "device_id": dev_identifier}),
        timestamp=datetime.utcnow()
    )
    db.add(sec_event)
    db.commit()

    return {"message": f"Device {name} deleted successfully."}

# -------------------------------------------------------------
# 4. POLICY MANAGEMENT ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/policies", response_model=List[schemas.PolicyOut])
def get_policies(db: Session = Depends(get_db)):
    return db.query(Policy).order_by(desc(Policy.created_at)).all()

@app.post("/api/policies", response_model=schemas.PolicyOut, status_code=status.HTTP_201_CREATED)
def create_policy(policy_in: schemas.PolicyCreate, db: Session = Depends(get_db)):
    policy = Policy(
        name=policy_in.name,
        subject_role=policy_in.subject_role,
        resource=policy_in.resource,
        action=policy_in.action,
        max_risk_score=policy_in.max_risk_score,
        is_active=policy_in.is_active,
        description=policy_in.description,
        created_at=datetime.utcnow()
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)

    tx_hash = blockchain_service.generate_audit_hash({
        "action": "create_policy",
        "policy_id": policy.id,
        "name": policy.name,
        "rule": f"{policy.subject_role} -> {policy.resource} -> {policy.action} -> Risk <= {policy.max_risk_score}"
    })

    sec_event = SecurityEvent(
        event_type="POLICY_CREATED",
        severity="INFO",
        description=f"Zero Trust policy '{policy.name}' created ({policy.subject_role} -> {policy.resource} -> {policy.action} -> Risk < {policy.max_risk_score})",
        tx_hash=tx_hash,
        timestamp=datetime.utcnow()
    )
    db.add(sec_event)
    db.commit()

    return policy

@app.put("/api/policies/{policy_id}", response_model=schemas.PolicyOut)
def update_policy(policy_id: int, policy_in: schemas.PolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")

    if policy_in.name is not None:
        policy.name = policy_in.name
    if policy_in.subject_role is not None:
        policy.subject_role = policy_in.subject_role
    if policy_in.resource is not None:
        policy.resource = policy_in.resource
    if policy_in.action is not None:
        policy.action = policy_in.action
    if policy_in.max_risk_score is not None:
        policy.max_risk_score = policy_in.max_risk_score
    if policy_in.is_active is not None:
        policy.is_active = policy_in.is_active
    if policy_in.description is not None:
        policy.description = policy_in.description

    db.commit()
    db.refresh(policy)
    return policy

@app.delete("/api/policies/{policy_id}")
def delete_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found.")
    name = policy.name

    # Unlink any historical access requests referencing this policy
    db.query(AccessRequest).filter(AccessRequest.matched_policy_id == policy_id).update(
        {AccessRequest.matched_policy_id: None}, synchronize_session=False
    )
    db.expire_all()

    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if policy:
        db.delete(policy)
    db.commit()

    sec_event = SecurityEvent(
        event_type="POLICY_DELETED",
        severity="INFO",
        description=f"Zero Trust policy '{name}' was removed",
        tx_hash=blockchain_service.generate_audit_hash({"action": "delete_policy", "name": name}),
        timestamp=datetime.utcnow()
    )
    db.add(sec_event)
    db.commit()

    return {"message": f"Policy '{name}' deleted."}

# -------------------------------------------------------------
# 5. ACCESS REQUEST INTERFACE & ZERO TRUST SIMULATOR
# -------------------------------------------------------------

@app.get("/api/access-requests", response_model=List[schemas.AccessRequestOut])
def get_access_requests(
    decision: Optional[str] = Query(None, description="Filter by ALLOW or DENY"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(AccessRequest)
    if decision:
        query = query.filter(AccessRequest.decision == decision.upper())
    requests_raw = query.order_by(desc(AccessRequest.timestamp)).limit(limit).all()

    result = []
    for r in requests_raw:
        result.append(schemas.AccessRequestOut(
            id=r.id,
            request_id=r.request_id,
            user_id=r.user_id,
            device_id=r.device_id,
            resource=r.resource,
            action=r.action,
            calculated_risk=r.calculated_risk,
            matched_policy_id=r.matched_policy_id,
            decision=r.decision,
            reason=r.reason,
            enforced_by=r.enforced_by,
            blockchain_tx_hash=r.blockchain_tx_hash,
            timestamp=r.timestamp,
            user_name=r.user.full_name if r.user else "Unknown User",
            device_name=r.device.device_name if r.device else "Unknown Device",
            policy_name=r.matched_policy.name if r.matched_policy else "No Matching Policy"
        ))
    return result

@app.post("/api/evaluate-access", response_model=schemas.AccessRequestOut)
def evaluate_access(eval_in: schemas.EvaluateAccessInput, db: Session = Depends(get_db)):
    """
    Simulates / triggers live Zero Trust access evaluation.
    Evaluates identity, device posture & risk, matches policies, decides ALLOW/DENY,
    dispatches OPNsense firewall rule, and creates blockchain audit hash.
    """
    try:
        req = zt_engine_service.evaluate_access(
            db=db,
            user_id=eval_in.user_id,
            device_id=eval_in.device_id,
            resource=eval_in.resource,
            action=eval_in.action
        )
        return schemas.AccessRequestOut(
            id=req.id,
            request_id=req.request_id,
            user_id=req.user_id,
            device_id=req.device_id,
            resource=req.resource,
            action=req.action,
            calculated_risk=req.calculated_risk,
            matched_policy_id=req.matched_policy_id,
            decision=req.decision,
            reason=req.reason,
            enforced_by=req.enforced_by,
            blockchain_tx_hash=req.blockchain_tx_hash,
            timestamp=req.timestamp,
            user_name=req.user.full_name if req.user else "Unknown User",
            device_name=req.device.device_name if req.device else "Unknown Device",
            policy_name=req.matched_policy.name if req.matched_policy else "No Matching Policy"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# -------------------------------------------------------------
# 6. SECURITY EVENTS
# -------------------------------------------------------------

@app.get("/api/security-events", response_model=List[schemas.SecurityEventOut])
def get_security_events(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(SecurityEvent).order_by(desc(SecurityEvent.timestamp)).limit(limit).all()

# -------------------------------------------------------------
# 7. INTEGRATION STATUS & BLOCKCHAIN VERIFICATION (Person 2 & Person 3)
# -------------------------------------------------------------

@app.get("/api/engine-status")
def get_zero_trust_engine_status():
    return zt_engine_service.get_status()

@app.get("/api/blockchain-status")
def get_blockchain_status():
    return blockchain_service.get_status()

@app.post("/api/blockchain/verify-hash")
def verify_blockchain_hash(payload: dict):
    tx_hash = payload.get("hash", "")
    if not tx_hash:
        raise HTTPException(status_code=400, detail="Hash parameter is required")
    return blockchain_service.verify_audit_hash(tx_hash)

@app.post("/api/blockchain/record-admin-action")
def record_admin_action(payload: dict, db: Session = Depends(get_db)):
    """
    Receives MetaMask-authenticated admin actions and records them in the audit log.
    """
    admin_address = payload.get("admin_address", "Unknown MetaMask Admin")
    action_type = payload.get("action_type", "ADMIN_ACTION")
    description = payload.get("description", "Administrative change signed via MetaMask")
    tx_hash = payload.get("tx_hash") or blockchain_service.generate_audit_hash({
        "action": action_type,
        "admin": admin_address,
        "description": description
    })

    evt = SecurityEvent(
        event_type=action_type,
        severity="INFO",
        description=f"[MetaMask: {admin_address[:6]}...{admin_address[-4:]}] {description}",
        tx_hash=tx_hash,
        timestamp=datetime.utcnow()
    )
    db.add(evt)
    db.commit()
    db.refresh(evt)
    return {
        "status": "RECORDED",
        "event_id": evt.id,
        "tx_hash": tx_hash,
        "admin": admin_address
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "TrustChain Management Layer (Person 1)",
        "timestamp": datetime.utcnow().isoformat()
    }

