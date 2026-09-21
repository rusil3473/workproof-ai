"""
Unit Tests for WorkProof AI Backend
Verifies cryptographic proof, statutory lien waivers, RevenueCat webhooks, and Alexa+ intents.
"""

import pytest
from fastapi.testclient import TestClient
from app import app
from proof_engine import compute_proof_hash, verify_proof_hash, generate_statutory_lien_waiver
from revenuecat_webhook import revenuecat_engine
from alexa_voice_engine import alexa_punch_manager

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_proof_hashing_and_verification():
    job_id = "job-test-01"
    milestone_id = "m-test-01"
    timestamp = "2026-09-22T10:00:00Z"
    lat, lon = 30.2672, -97.7431
    
    hash_val = compute_proof_hash(job_id, milestone_id, timestamp, lat, lon)
    assert len(hash_val) == 64
    
    # Valid verification
    assert verify_proof_hash(hash_val, job_id, milestone_id, timestamp, lat, lon) is True
    # Tampered verification
    assert verify_proof_hash(hash_val, job_id, milestone_id, timestamp, lat + 0.001, lon) is False

def test_statutory_lien_waiver_usd_and_inr():
    usd_waiver = generate_statutory_lien_waiver(
        job_title="Kitchen Remodel",
        client_name="Alice Smith",
        amount=2500.0,
        currency="USD",
        milestone_title="Tile Work",
        sha256_hash="abc12345"
    )
    assert "California Civil Code §8134" in usd_waiver["statute"]
    assert "Alice Smith" in usd_waiver["waiver_clause"]
    
    inr_waiver = generate_statutory_lien_waiver(
        job_title="Solar Rooftop 3kW",
        client_name="Rahul Verma",
        amount=45000.0,
        currency="INR",
        milestone_title="Mounting Rails",
        sha256_hash="def67890"
    )
    assert "GST Rule 46" in inr_waiver["statute"]
    assert "₹45,000.00 INR" in inr_waiver["waiver_clause"]

def test_verify_proof_endpoint():
    response = client.post("/api/verify-proof", json={
        "job_id": "job-01",
        "milestone_id": "m-01",
        "latitude": 30.2984,
        "longitude": -97.7601,
        "amount": 1400,
        "currency": "USD",
        "client_name": "Sarah Jenkins",
        "milestone_title": "Phase 1: Rough-in Electrical"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True
    assert data["court_admissibility_score"] > 90

def test_revenuecat_webhook_and_entitlements():
    # Send mock purchase webhook
    event_payload = {
        "type": "INITIAL_PURCHASE",
        "app_user_id": "contractor_test_42",
        "product_id": "workproof_pro_monthly"
    }
    response = client.post("/api/revenuecat/webhook", json=event_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    
    # Retrieve customer entitlements
    cust_resp = client.get("/api/revenuecat/customer/contractor_test_42")
    assert cust_resp.status_code == 200
    cust_data = cust_resp.json()
    assert cust_data["is_active"] is True
    assert "pro_access" in cust_data["entitlements"]

def test_alexa_punchlist_intent():
    response = client.post("/api/alexa/intent", json={
        "intent": "AddPunchListItemIntent",
        "slots": {
            "task": "Caulk kitchen sink backsplash",
            "trade": "Plumbing",
            "priority": "High"
        }
    })
    assert response.status_code == 200
    res_data = response.json()
    assert "Caulk kitchen sink backsplash" in res_data["speech_output"]
    
    # List punch items
    list_resp = client.get("/api/alexa/punchlist")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert any(i["task"] == "Caulk kitchen sink backsplash" for i in items)

def test_dispute_metrics():
    response = client.get("/api/contractor-disputes/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "average_unpaid_retainage_percentage" in data
    assert len(data["top_dispute_causes"]) >= 4

def test_sqlite_persistence():
    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    data = health_resp.json()
    assert "SQLite" in data["database"]["engine"]
    assert data["database"]["stats"]["subscriptions"] >= 1
    assert data["database"]["stats"]["punch_items"] >= 1

