"""
WorkProof AI - Enterprise Database Configuration
SQLAlchemy 2.0 Engine with SQLite WAL (Write-Ahead Logging) Mode.
Provides durable, zero-latency local storage for lien waivers, voice punches, and RevenueCat subscription records.
"""

import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.environ.get("WORKPROOF_DATABASE_URL", f"sqlite:///{os.path.join(DATABASE_DIR, 'workproof.db')}")

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
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
