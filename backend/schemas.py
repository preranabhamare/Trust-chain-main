from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: str = "Employee"
    department: str = "Engineering"
    status: str = "active"

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    status: Optional[str] = None

class UserOut(UserBase):
    id: int
    created_at: datetime
    device_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


# --- Device Schemas ---
class DeviceBase(BaseModel):
    device_id: str
    device_name: str
    ip_address: str
    mac_address: Optional[str] = None
    os_type: str = "Windows 11"
    owner_id: Optional[int] = None
    risk_score: int = Field(default=15, ge=0, le=100)
    status: str = "active"

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    device_name: Optional[str] = None
    ip_address: Optional[str] = None
    os_type: Optional[str] = None
    owner_id: Optional[int] = None
    risk_score: Optional[int] = Field(default=None, ge=0, le=100)
    status: Optional[str] = None

class DeviceToggleStatus(BaseModel):
    status: str # "active", "blocked", "quarantine"

class DeviceOut(DeviceBase):
    id: int
    last_seen: datetime
    created_at: datetime
    owner_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- Policy Schemas ---
class PolicyBase(BaseModel):
    name: str
    subject_role: str # e.g. Employee, DevOps Engineer, Admin, All
    resource: str     # Database, Production Server, Internal Wiki, etc.
    action: str = "READ" # READ, WRITE, ADMIN, SSH, ANY
    max_risk_score: int = Field(default=40, ge=0, le=100)
    is_active: bool = True
    description: Optional[str] = None

class PolicyCreate(PolicyBase):
    pass

class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    subject_role: Optional[str] = None
    resource: Optional[str] = None
    action: Optional[str] = None
    max_risk_score: Optional[int] = Field(default=None, ge=0, le=100)
    is_active: Optional[bool] = None
    description: Optional[str] = None

class PolicyOut(PolicyBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Access Request Schemas ---
class EvaluateAccessInput(BaseModel):
    user_id: int
    device_id: int
    resource: str
    action: str = "READ"

class AccessRequestOut(BaseModel):
    id: int
    request_id: str
    user_id: int
    device_id: int
    resource: str
    action: str
    calculated_risk: int
    matched_policy_id: Optional[int] = None
    decision: str # ALLOW, DENY
    reason: str
    enforced_by: str
    blockchain_tx_hash: Optional[str] = None
    timestamp: datetime
    user_name: Optional[str] = None
    device_name: Optional[str] = None
    policy_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- Security Event Schemas ---
class SecurityEventCreate(BaseModel):
    event_type: str
    severity: str = "INFO"
    source_ip: Optional[str] = None
    device_name: Optional[str] = None
    description: str

class SecurityEventOut(BaseModel):
    id: int
    event_type: str
    severity: str
    source_ip: Optional[str] = None
    device_name: Optional[str] = None
    description: str
    tx_hash: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Dashboard Overview Schema ---
class DashboardOverview(BaseModel):
    total_devices: int
    active_users: int
    allowed_requests: int
    denied_requests: int
    high_risk_devices: int
    system_health: str
    recent_events: List[SecurityEventOut]
    recent_requests: List[AccessRequestOut]
    risk_summary: dict
