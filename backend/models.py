"""
WorkProof AI - SQLAlchemy 2.0 ORM Models
Relational schema for RevenueCat entitlements, contractor lien waivers, voice punch-list items,
enterprise multi-tenancy, RBAC users, B2B API keys, and adaptive dispute memory.
"""

from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ProjectOrganization(Base):
    __tablename__ = "project_organizations"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    license_tier = Column(String(64), default="ENTERPRISE_CONTRACTOR")  # BASIC, PRO, ENTERPRISE_CONTRACTOR
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "license_tier": self.license_tier,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    org_id = Column(String(64), ForeignKey("project_organizations.id"), nullable=True)
    email = Column(String(128), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(String(64), default="general_contractor")  # general_contractor, subcontractor, project_owner, inspector
    tier = Column(String(32), default="pro")  # free, pro, enterprise
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "org_id": self.org_id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role,
            "tier": self.tier or "pro",
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(64), primary_key=True, index=True)
    org_id = Column(String(64), ForeignKey("project_organizations.id"), nullable=False)
    key_hash = Column(String(256), nullable=False)
    prefix = Column(String(16), nullable=False)
    name = Column(String(128), default="External ERP Gateway")
    scopes = Column(Text, default="proofs:read,proofs:write,waivers:read,punchlist:write,memory:read")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "org_id": self.org_id,
            "prefix": self.prefix,
            "name": self.name,
            "scopes": self.scopes.split(",") if self.scopes else [],
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_used_at": self.last_used_at.isoformat() if self.last_used_at else None
        }

class DisputeMemory(Base):
    __tablename__ = "dispute_memories"

    id = Column(String(64), primary_key=True, index=True)
    org_id = Column(String(64), ForeignKey("project_organizations.id"), nullable=False)
    category = Column(String(64), default="TOLERANCE_SPEC")  # TOLERANCE_SPEC, RETAINAGE_POLICY, SCOPE_CHANGE, SOLAR_DISCOM
    trade = Column(String(64), default="General Construction")  # Drywall, Electrical, Solar, Plumbing
    rule_statement = Column(Text, nullable=False)
    confidence_weight = Column(Float, default=1.0)
    dispute_prevention_rate = Column(Float, default=95.0)
    user_modified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "org_id": self.org_id,
            "category": self.category,
            "trade": self.trade,
            "rule_statement": self.rule_statement,
            "confidence_weight": round(self.confidence_weight, 4),
            "dispute_prevention_rate": round(self.dispute_prevention_rate, 2),
            "user_modified": self.user_modified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class ContextMemorySummary(Base):
    __tablename__ = "context_memory_summaries"

    id = Column(String(64), primary_key=True, index=True)
    org_id = Column(String(64), ForeignKey("project_organizations.id"), nullable=False)
    summary_text = Column(Text, nullable=False)
    rule_count = Column(Integer, default=0)
    compression_ratio = Column(Float, default=0.75)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "org_id": self.org_id,
            "summary_text": self.summary_text,
            "rule_count": self.rule_count,
            "compression_ratio": self.compression_ratio,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class SubscriptionRecord(Base):
    __tablename__ = "subscriptions"

    customer_id = Column(String(128), primary_key=True, index=True)
    entitlement = Column(String(64), default="pro_contractor")
    status = Column(String(32), default="ACTIVE")
    plan_name = Column(String(64), default="Enterprise Pro")
    stripe_customer_id = Column(String(128), default="cus_contractor_7829")
    gateway = Column(String(64), default="RevenueCat + Stripe Web Billing")
    expires_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "customer_id": self.customer_id,
            "entitlement": self.entitlement,
            "status": self.status,
            "plan_name": self.plan_name,
            "stripe_customer_id": self.stripe_customer_id or "cus_contractor_7829",
            "gateway": self.gateway or "RevenueCat + Stripe Web Billing",
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }

class OneSignalNotificationRecord(Base):
    __tablename__ = "onesignal_notifications"

    id = Column(String(64), primary_key=True, index=True)
    recipient = Column(String(128), default="Contractor & Client")
    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    channel = Column(String(64), default="OneSignal Push")  # OneSignal Push, Web Push, SMS
    delivery_status = Column(String(32), default="DELIVERED")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "recipient": self.recipient,
            "title": self.title,
            "message": self.message,
            "channel": self.channel,
            "delivery_status": self.delivery_status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class PunchItemRecord(Base):
    __tablename__ = "punch_items"

    id = Column(String(64), primary_key=True, index=True)
    project_id = Column(String(64), default="PRJ-DEFAULT")
    title = Column(String(256), nullable=False)
    room = Column(String(128), default="General")
    trade = Column(String(128), default="General Construction")
    priority = Column(String(32), default="Medium")  # Low, Medium, High
    logged_via = Column(String(64), default="Alexa+ Voice")  # Alexa+ Voice, Manual Entry
    severity = Column(String(32), default="NORMAL")  # NORMAL, HIGH, BLOCKER
    status = Column(String(32), default="pending")  # pending, completed, OPEN, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        is_completed = self.status.lower() in ("completed", "resolved")
        return {
            "id": self.id,
            "punch_id": self.id,
            "project_id": self.project_id,
            "title": self.title,
            "task": self.title,
            "room": self.room,
            "trade": self.trade,
            "priority": self.priority,
            "logged_via": self.logged_via,
            "severity": self.severity,
            "status": "completed" if is_completed else "pending",
            "timestamp": self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class LienWaiverRecord(Base):
    __tablename__ = "lien_waivers"

    id = Column(String(64), primary_key=True, index=True)
    job_title = Column(String(256), nullable=False)
    client_name = Column(String(128), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    proof_hash = Column(String(128), nullable=False)
    statutory_code = Column(String(128), default="US Uniform Lien Law § 3121")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "waiver_id": self.id,
            "job_title": self.job_title,
            "client_name": self.client_name,
            "amount": self.amount,
            "currency": self.currency,
            "proof_hash": self.proof_hash,
            "statutory_code": self.statutory_code,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class JobRecord(Base):
    __tablename__ = "jobs"

    id = Column(String(64), primary_key=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True, index=True)
    org_id = Column(String(64), ForeignKey("project_organizations.id"), nullable=True)
    title = Column(String(256), nullable=False)
    category = Column(String(64), default="Renovation")
    client_name = Column(String(128), nullable=False)
    client_phone = Column(String(64), default="")
    client_email = Column(String(128), default="")
    location_address = Column(String(256), default="")
    currency = Column(String(8), default="USD")  # USD, INR, EUR, GBP
    total_amount = Column(Float, default=0.0)
    status = Column(String(32), default="active")  # active, completed, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    milestones = relationship(
        "MilestoneRecord",
        back_populates="job",
        cascade="all, delete-orphan",
        order_by="MilestoneRecord.created_at",
        lazy="selectin"
    )

    def to_dict(self, include_milestones=True):
        data = {
            "id": self.id,
            "userId": self.user_id,
            "orgId": self.org_id,
            "title": self.title,
            "category": self.category,
            "clientName": self.client_name,
            "clientPhone": self.client_phone,
            "clientEmail": self.client_email,
            "locationAddress": self.location_address,
            "currency": self.currency,
            "totalAmount": self.total_amount,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_milestones:
            data["milestones"] = [m.to_dict() for m in self.milestones]
        return data

class MilestoneRecord(Base):
    __tablename__ = "milestones"

    id = Column(String(64), primary_key=True, index=True)
    job_id = Column(String(64), ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(256), nullable=False)
    description = Column(Text, default="")
    amount = Column(Float, default=0.0)
    before_photo_url = Column(Text, nullable=True)
    after_photo_url = Column(Text, nullable=True)
    before_timestamp = Column(DateTime, nullable=True)
    after_timestamp = Column(DateTime, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    accuracy_meters = Column(Float, nullable=True)
    sha256_hash = Column(String(128), nullable=True)
    signature_data_url = Column(Text, nullable=True)
    signer_name = Column(String(128), nullable=True)
    signed_at = Column(DateTime, nullable=True)
    status = Column(String(32), default="pending")  # pending, before_captured, completed, signed, paid
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    job = relationship("JobRecord", back_populates="milestones")

    def to_dict(self):
        gps = None
        if self.latitude is not None and self.longitude is not None:
            gps = {
                "latitude": self.latitude,
                "longitude": self.longitude,
                "accuracyMeters": self.accuracy_meters or 3.0
            }
        return {
            "id": self.id,
            "jobId": self.job_id,
            "title": self.title,
            "description": self.description or "",
            "amount": self.amount,
            "beforePhotoUrl": self.before_photo_url,
            "afterPhotoUrl": self.after_photo_url,
            "beforeTimestamp": self.before_timestamp.isoformat() if self.before_timestamp else None,
            "afterTimestamp": self.after_timestamp.isoformat() if self.after_timestamp else None,
            "gpsCoordinates": gps,
            "sha256Hash": self.sha256_hash,
            "signatureDataUrl": self.signature_data_url,
            "signerName": self.signer_name,
            "signedAt": self.signed_at.isoformat() if self.signed_at else None,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None
        }

