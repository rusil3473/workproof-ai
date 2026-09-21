"""
WorkProof AI - SQLAlchemy 2.0 ORM Models
Relational schema for RevenueCat entitlements, contractor lien waivers, and voice punch-list items.
"""

from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime, Text
from database import Base

class SubscriptionRecord(Base):
    __tablename__ = "subscriptions"

    customer_id = Column(String(128), primary_key=True, index=True)
    entitlement = Column(String(64), default="pro_contractor")
    status = Column(String(32), default="ACTIVE")
    plan_name = Column(String(64), default="Enterprise Pro")
    expires_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "customer_id": self.customer_id,
            "entitlement": self.entitlement,
            "status": self.status,
            "plan_name": self.plan_name,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }

class PunchItemRecord(Base):
    __tablename__ = "punch_items"

    id = Column(String(64), primary_key=True, index=True)
    project_id = Column(String(64), default="PRJ-DEFAULT")
    title = Column(String(256), nullable=False)
    room = Column(String(128), default="General")
    severity = Column(String(32), default="NORMAL")  # NORMAL, HIGH, BLOCKER
    status = Column(String(32), default="OPEN")  # OPEN, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "punch_id": self.id,
            "project_id": self.project_id,
            "title": self.title,
            "task": self.title,
            "room": self.room,
            "severity": self.severity,
            "status": self.status,
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
