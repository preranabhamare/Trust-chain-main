from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    role = Column(String(50), default="Employee")  # Admin, SecOps, DevOps Engineer, Backend Engineer, Employee, Contractor
    department = Column(String(50), default="Engineering")
    status = Column(String(20), default="active")  # active, inactive, suspended
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    devices = relationship("Device", back_populates="owner", cascade="all, delete-orphan")
    access_requests = relationship("AccessRequest", back_populates="user", cascade="all, delete-orphan")


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(50), unique=True, index=True, nullable=False) # e.g. DEV-PC-001
    device_name = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=False)
    mac_address = Column(String(50), nullable=True)
    os_type = Column(String(50), default="Windows 11")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    risk_score = Column(Integer, default=15)  # 0 to 100
    status = Column(String(20), default="active")  # active, blocked, quarantine
    last_seen = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="devices")
    access_requests = relationship("AccessRequest", back_populates="device", cascade="all, delete-orphan")


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    subject_role = Column(String(50), nullable=False) # Employee, DevOps Engineer, Admin, All
    resource = Column(String(100), nullable=False) # Database, Production Server, Internal Wiki, API Gateway
    action = Column(String(50), default="READ") # READ, WRITE, ADMIN, SSH, ANY
    max_risk_score = Column(Integer, default=40) # Access allowed only if risk <= max_risk_score
    is_active = Column(Boolean, default=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AccessRequest(Base):
    __tablename__ = "access_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(Integer, ForeignKey("devices.id"), nullable=False)
    resource = Column(String(100), nullable=False)
    action = Column(String(50), default="READ")
    calculated_risk = Column(Integer, nullable=False)
    matched_policy_id = Column(Integer, ForeignKey("policies.id"), nullable=True)
    decision = Column(String(20), nullable=False) # ALLOW, DENY
    reason = Column(String(255), nullable=False)
    enforced_by = Column(String(100), default="OPNsense Firewall") # Firewall rule or engine tag
    blockchain_tx_hash = Column(String(66), nullable=True) # 0x...
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="access_requests")
    device = relationship("Device", back_populates="access_requests")
    matched_policy = relationship("Policy")


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False) # ACCESS_DENIED, DEVICE_BLOCKED, HIGH_RISK_DETECTED, etc.
    severity = Column(String(20), default="INFO") # INFO, LOW, MEDIUM, HIGH, CRITICAL
    source_ip = Column(String(50), nullable=True)
    device_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    tx_hash = Column(String(66), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
