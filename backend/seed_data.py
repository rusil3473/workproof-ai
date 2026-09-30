"""
WorkProof AI - Database Seeder & Schema Initializer
Creates SQLite tables and manages organizations, users, and data purges.
"""

from datetime import datetime, timedelta
import os
from database import engine, SessionLocal, Base
from models import (
    ProjectOrganization, User, ApiKey, DisputeMemory,
    ContextMemorySummary, SubscriptionRecord, PunchItemRecord, LienWaiverRecord,
    JobRecord, MilestoneRecord, OneSignalNotificationRecord
)
from auth_engine import hash_password

WORKPROOF_USERS = {
    "contractor@apexbuild.com": {
        "id": "USR-GC-APEX",
        "org_id": "ORG-VANCE-BUILDERS-01",
        "email": "contractor@apexbuild.com",
        "name": "David Vance (Apex Builders)",
        "role": "general_contractor",
        "tier": "pro",
        "password": "password123"
    },
    "client@homeowner.com": {
        "id": "USR-CLIENT-SARAH",
        "org_id": "ORG-VANCE-BUILDERS-01",
        "email": "client@homeowner.com",
        "name": "Sarah Jenkins",
        "role": "project_owner",
        "tier": "free",
        "password": "password123"
    },
    "inspector@citycode.gov": {
        "id": "USR-INSP-MARCUS",
        "org_id": "ORG-VANCE-BUILDERS-01",
        "email": "inspector@citycode.gov",
        "name": "Marcus Cole (City Code Enforcement)",
        "role": "inspector",
        "tier": "enterprise",
        "password": "password123"
    },
    "gc@workproof.ai": {
        "id": "USR-GC-001",
        "org_id": "ORG-VANCE-BUILDERS-01",
        "email": "gc@workproof.ai",
        "name": "David Vance",
        "role": "general_contractor",
        "tier": "pro",
        "password": "contractor_secret"
    },
    "sub@workproof.ai": {
        "id": "USR-SUB-002",
        "org_id": "ORG-VANCE-BUILDERS-01",
        "email": "sub@workproof.ai",
        "name": "Carlos Mendez",
        "role": "subcontractor",
        "tier": "pro",
        "password": "contractor_secret"
    },
    "owner@workproof.ai": {
        "id": "USR-OWNER-003",
        "org_id": "ORG-VANCE-BUILDERS-01",
        "email": "owner@workproof.ai",
        "name": "Elena Rostova",
        "role": "project_owner",
        "tier": "free",
        "password": "contractor_secret"
    }
}

def seed_organizations(db):
    if not db.query(ProjectOrganization).first():
        org = ProjectOrganization(
            id="ORG-VANCE-BUILDERS-01",
            name="Vance Commercial Builders & Solar",
            license_tier="ENTERPRISE_CONTRACTOR"
        )
        db.add(org)
        db.commit()

def seed_users(db):
    for email, u in WORKPROOF_USERS.items():
        existing = db.query(User).filter((User.email == email) | (User.id == u["id"])).first()
        if not existing:
            user_rec = User(
                id=u["id"],
                org_id=u["org_id"],
                email=u["email"],
                password_hash=hash_password(u["password"]),
                full_name=u["name"],
                role=u["role"],
                tier=u.get("tier", "pro")
            )
            db.add(user_rec)
    db.commit()

def seed_default_jobs(db):
    if db.query(JobRecord).count() == 0:
        # Job 1: US Kitchen Remodel
        job1 = JobRecord(
            id="job-01",
            user_id="USR-GC-APEX",
            org_id="ORG-VANCE-BUILDERS-01",
            title="Modern Kitchen Remodel & Island Lighting",
            category="Renovation",
            client_name="Sarah Jenkins",
            client_phone="+1 (512) 555-0194",
            client_email="client@homeowner.com",
            location_address="2408 Westover Rd, Austin, TX",
            currency="USD",
            total_amount=4200.0,
            status="active",
            created_at=datetime(2026, 9, 15, 9, 0, 0)
        )
        db.add(job1)
        db.flush()

        m1 = MilestoneRecord(
            id="m-01",
            job_id="job-01",
            title="Phase 1: Rough-in Electrical & Recessed Fixtures",
            description="Installed 6 recessed LED cans, island pendant wiring, and dedicated 20A GFCI circuit.",
            amount=1400.0,
            before_photo_url="https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80",
            after_photo_url="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
            before_timestamp=datetime(2026, 9, 16, 10, 15, 0),
            after_timestamp=datetime(2026, 9, 17, 16, 30, 0),
            latitude=30.2984,
            longitude=-97.7601,
            accuracy_meters=3.5,
            sha256_hash="9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
            signature_data_url="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='80'><path d='M 10 40 Q 60 10 100 40 T 180 30' fill='none' stroke='black' stroke-width='3'/></svg>",
            signer_name="Sarah Jenkins",
            signed_at=datetime(2026, 9, 17, 17, 5, 0),
            status="signed",
            created_at=datetime(2026, 9, 15, 9, 30, 0)
        )
        m2 = MilestoneRecord(
            id="m-02",
            job_id="job-01",
            title="Phase 2: Custom Oak Cabinets & Quartz Surface",
            description="Frameless soft-close cabinetry and Calacatta quartz countertops with undermount sink cutout.",
            amount=1800.0,
            before_photo_url="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80",
            before_timestamp=datetime(2026, 9, 18, 8, 30, 0),
            latitude=30.2984,
            longitude=-97.7601,
            accuracy_meters=3.5,
            status="before_captured",
            created_at=datetime(2026, 9, 15, 10, 0, 0)
        )
        m3 = MilestoneRecord(
            id="m-03",
            job_id="job-01",
            title="Phase 3: Backsplash, Appliance Trim & Final Punch",
            description="Handcrafted zellige tile backsplash, dishwasher trim kit, and plumbing fixture test.",
            amount=1000.0,
            status="pending",
            created_at=datetime(2026, 9, 15, 10, 30, 0)
        )
        db.add_all([m1, m2, m3])

        # Job 2: India Solar Installation
        job2 = JobRecord(
            id="job-02",
            user_id="USR-GC-001",
            org_id="ORG-VANCE-BUILDERS-01",
            title="PM Surya Ghar 3kW Rooftop Solar Installation",
            category="Solar Rooftop",
            client_name="Rajesh Sharma",
            client_phone="+91 98450 12345",
            client_email="rajesh.sharma@example.in",
            location_address="Plot 42, HSR Layout Sector 2, Bengaluru, KA",
            currency="INR",
            total_amount=145000.0,
            status="active",
            created_at=datetime(2026, 9, 14, 11, 0, 0)
        )
        db.add(job2)
        db.flush()

        m4 = MilestoneRecord(
            id="m-04",
            job_id="job-02",
            title="Stage 1: Roof Structural Mounting & Earthing Grid",
            description="Installed anodized aluminum rails anchored to RCC roof pillars; dual copper earthing rods tested at <5 ohms.",
            amount=45000.0,
            before_photo_url="https://images.unsplash.com/photo-1508873696983-2df5293cb395?w=800&auto=format&fit=crop&q=80",
            after_photo_url="https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
            before_timestamp=datetime(2026, 9, 15, 9, 30, 0),
            after_timestamp=datetime(2026, 9, 16, 14, 45, 0),
            latitude=12.9121,
            longitude=77.6446,
            accuracy_meters=2.8,
            sha256_hash="4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e",
            signature_data_url="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='80'><path d='M 10 50 Q 50 20 90 50 T 170 40' fill='none' stroke='black' stroke-width='3'/></svg>",
            signer_name="Rajesh Sharma",
            signed_at=datetime(2026, 9, 16, 15, 15, 0),
            status="signed",
            created_at=datetime(2026, 9, 14, 11, 30, 0)
        )
        m5 = MilestoneRecord(
            id="m-05",
            job_id="job-02",
            title="Stage 2: 8x 540W Mono PERC Panels & Inverter Wiring",
            description="Mounted solar PV modules with MC4 connectors; connected 3.3kW hybrid inverter.",
            amount=70000.0,
            status="pending",
            created_at=datetime(2026, 9, 14, 12, 0, 0)
        )
        m6 = MilestoneRecord(
            id="m-06",
            job_id="job-02",
            title="Stage 3: DISCOM Net-Meter Commissioning (Subsidy Release)",
            description="BESCOM bi-directional net-meter sync and ₹78,000 PM Surya Ghar subsidy portal photo upload.",
            amount=30000.0,
            status="pending",
            created_at=datetime(2026, 9, 14, 12, 30, 0)
        )
        db.add_all([m4, m5, m6])
        db.commit()

def seed_default_punch_items(db):
    if db.query(PunchItemRecord).count() == 0:
        p1 = PunchItemRecord(
            id="pl-01",
            project_id="job-01",
            title="Touch up baseboard trim on south wall",
            room="Kitchen",
            trade="Carpentry",
            priority="Medium",
            logged_via="Alexa+ Voice",
            severity="NORMAL",
            status="pending",
            created_at=datetime.utcnow()
        )
        p2 = PunchItemRecord(
            id="pl-02",
            project_id="job-01",
            title="Seal water supply line behind dishwasher",
            room="Kitchen",
            trade="Plumbing",
            priority="High",
            logged_via="Alexa+ Voice",
            severity="HIGH",
            status="completed",
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.add_all([p1, p2])
        db.commit()

def migrate_columns(db):
    """Ensures newly added columns exist in SQLite tables without requiring heavy external migration tools."""
    try:
        from sqlalchemy import text
        res = db.execute(text("PRAGMA table_info(punch_items);")).fetchall()
        col_names = [r[1] for r in res]
        if "trade" not in col_names:
            db.execute(text("ALTER TABLE punch_items ADD COLUMN trade VARCHAR(128) DEFAULT 'General Construction';"))
        if "priority" not in col_names:
            db.execute(text("ALTER TABLE punch_items ADD COLUMN priority VARCHAR(32) DEFAULT 'Medium';"))
        if "logged_via" not in col_names:
            db.execute(text("ALTER TABLE punch_items ADD COLUMN logged_via VARCHAR(64) DEFAULT 'Alexa+ Voice';"))
        
        # Subscriptions table migration for Stripe partner fields
        res_sub = db.execute(text("PRAGMA table_info(subscriptions);")).fetchall()
        col_sub_names = [r[1] for r in res_sub]
        if "stripe_customer_id" not in col_sub_names:
            db.execute(text("ALTER TABLE subscriptions ADD COLUMN stripe_customer_id VARCHAR(128) DEFAULT 'cus_contractor_7829';"))
        if "gateway" not in col_sub_names:
            db.execute(text("ALTER TABLE subscriptions ADD COLUMN gateway VARCHAR(64) DEFAULT 'RevenueCat + Stripe Web Billing';"))

        # Users table migration for tier
        res_user = db.execute(text("PRAGMA table_info(users);")).fetchall()
        col_user_names = [r[1] for r in res_user]
        if "tier" not in col_user_names:
            db.execute(text("ALTER TABLE users ADD COLUMN tier VARCHAR(32) DEFAULT 'pro';"))

        # Jobs table migration for user_id
        res_job = db.execute(text("PRAGMA table_info(jobs);")).fetchall()
        col_job_names = [r[1] for r in res_job]
        if "user_id" not in col_job_names:
            db.execute(text("ALTER TABLE jobs ADD COLUMN user_id VARCHAR(64);"))
            
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[MIGRATION NOTE] {e}")

def seed_default_onesignal_notifications(db):
    if db.query(OneSignalNotificationRecord).count() == 0:
        n1 = OneSignalNotificationRecord(
            id="os-notif-01",
            recipient="Sarah Jenkins (Client)",
            title="Inspection Ready: Phase 1 Completed",
            message="Contractor David Vance has uploaded Ghost-aligned photo proof. Tap to sign off on glass.",
            channel="OneSignal Web Push",
            delivery_status="DELIVERED",
            created_at=datetime.utcnow() - timedelta(minutes=45)
        )
        n2 = OneSignalNotificationRecord(
            id="os-notif-02",
            recipient="David Vance (Contractor)",
            title="Disbursement Confirmed via Stripe",
            message="Client signed off on Milestone 1! $1,400 payout deposited directly to your bank account.",
            channel="OneSignal Mobile Push",
            delivery_status="DELIVERED",
            created_at=datetime.utcnow() - timedelta(minutes=20)
        )
        db.add_all([n1, n2])
        db.commit()

def init_db(seed_dummy: bool = False):
    """Initializes SQLite schema in WAL mode and ensures core organizations, users, and authentic jobs exist."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        migrate_columns(db)
        seed_organizations(db)
        seed_users(db)
        seed_default_jobs(db)
        seed_default_punch_items(db)
        seed_default_onesignal_notifications(db)
    except Exception as e:
        db.rollback()
        print(f"[WORKPROOF DB ERROR] {e}")
    finally:
        db.close()

def purge_all_demo_data(db):
    """Purges all demo punch items, waivers, subscriptions, dispute memories, and jobs."""
    try:
        db.query(MilestoneRecord).delete()
        db.query(JobRecord).delete()
        db.query(PunchItemRecord).delete()
        db.query(OneSignalNotificationRecord).delete()
        db.query(LienWaiverRecord).delete()
        db.query(SubscriptionRecord).delete()
        db.query(DisputeMemory).delete()
        db.query(ContextMemorySummary).delete()
        db.query(ApiKey).delete()
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        return False

if __name__ == "__main__":
    init_db()
