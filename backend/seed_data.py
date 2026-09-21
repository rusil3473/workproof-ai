"""
WorkProof AI - Database Seeder & Schema Initializer
Creates SQLite tables and populates sample subscriptions, voice punches, and statutory lien waivers.
"""

from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import SubscriptionRecord, PunchItemRecord, LienWaiverRecord

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing = db.query(SubscriptionRecord).first()
        if existing:
            return  # Already seeded

        print("[WORKPROOF DATABASE] Seeding initial records into SQLite...")
        now = datetime.utcnow()

        # 1. Pro Subscriptions
        sub = SubscriptionRecord(
            customer_id="cust_contractor_881",
            entitlement="pro_contractor",
            status="ACTIVE",
            plan_name="Enterprise Commercial Contractor",
            expires_at=now + timedelta(days=365)
        )
        db.add(sub)

        # 2. Voice Punch Items
        p1 = PunchItemRecord(
            id="PUNCH-001",
            project_id="PRJ-DALLAS-COMMERCIAL",
            title="Inspect HVAC condensation drain pipe clearance",
            room="Mechanical Room 2B",
            severity="HIGH",
            status="OPEN",
            created_at=now - timedelta(hours=4)
        )
        p2 = PunchItemRecord(
            id="PUNCH-002",
            project_id="PRJ-DALLAS-COMMERCIAL",
            title="Seal drywall joint above electrical conduit",
            room="Sector 4 Corridor",
            severity="NORMAL",
            status="RESOLVED",
            created_at=now - timedelta(days=1)
        )
        db.add_all([p1, p2])

        # 3. Sample Lien Waiver
        waiver = LienWaiverRecord(
            id="WAIVER-9901",
            job_title="Apex Logistics Bay Drywall & Electrical",
            client_name="Apex Global Distribution LLC",
            amount=8500.0,
            currency="USD",
            proof_hash="0x4e8a1f7c89b21d3e64a991f2c4b8e019a7731dff08",
            statutory_code="California Civil Code § 8132 / Texas Property Code § 53.281",
            created_at=now - timedelta(days=2)
        )
        db.add(waiver)

        db.commit()
        print("[WORKPROOF DATABASE] SQLite WAL mode database initialized and seeded!")

    except Exception as e:
        db.rollback()
        print(f"[WORKPROOF DATABASE ERROR] Seeding failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
