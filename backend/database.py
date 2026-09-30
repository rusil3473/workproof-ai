"""
WorkProof AI - Enterprise Hybrid Cloud Database Architecture
Supports both Cloud-Hosted PostgreSQL (Supabase, Neon, AWS Aurora)
and High-Concurrency Local SQLite in WAL Mode.
Engineered for lien waivers, voice punches, and RevenueCat subscription records.
"""

import os
import time
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import QueuePool

DATABASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DB_URL = os.environ.get("DATABASE_URL") or os.environ.get("WORKPROOF_DATABASE_URL")

if RAW_DB_URL:
    if RAW_DB_URL.startswith("postgres://"):
        DATABASE_URL = RAW_DB_URL.replace("postgres://", "postgresql://", 1)
    else:
        DATABASE_URL = RAW_DB_URL
    IS_POSTGRES = "postgresql" in DATABASE_URL
else:
    DATABASE_URL = f"sqlite:///{os.path.join(DATABASE_DIR, 'workproof.db')}"
    IS_POSTGRES = False

if IS_POSTGRES:
    engine = create_engine(
        DATABASE_URL,
        poolclass=QueuePool,
        pool_size=20,
        max_overflow=40,
        pool_timeout=30,
        pool_recycle=1800,
        pool_pre_ping=True,
        echo=False
    )
else:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.execute("PRAGMA busy_timeout=5000;")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_database_health() -> dict:
    """Verifies live database connectivity, dialect, and query roundtrip latency."""
    start_time = time.time()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1;"))
        latency_ms = round((time.time() - start_time) * 1000, 2)
        return {
            "status": "HEALTHY",
            "dialect": "postgresql" if IS_POSTGRES else "sqlite",
            "connection_mode": "CLOUD_HOSTED_DATABASE" if IS_POSTGRES else "LOCAL_WAL_PERSISTENT",
            "latency_ms": latency_ms
        }
    except Exception as e:
        return {
            "status": "DEGRADED",
            "error": str(e),
            "dialect": "postgresql" if IS_POSTGRES else "sqlite"
        }
