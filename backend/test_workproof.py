"""
Unit Tests for WorkProof AI Backend
Verifies cryptographic proof, statutory lien waivers, RevenueCat webhooks,
Amazon Alexa+ intents, JWT RBAC security, scale telemetry, adaptive memory, and B2B API gateway.
"""

import pytest
from fastapi.testclient import TestClient
from app import app
from proof_engine import compute_proof_hash, verify_proof_hash, generate_statutory_lien_waiver
from revenuecat_webhook import revenuecat_engine
from alexa_voice_engine import alexa_punch_manager
from database import SessionLocal
from seed_data import purge_all_demo_data

client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def teardown_test_records():
    yield
    db = SessionLocal()
    try:
        purge_all_demo_data(db)
    finally:
        db.close()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "Token Bucket" in response.json()["scale_limiter"]

def test_scale_telemetry():
    response = client.get("/api/metrics/scale")
    assert response.status_code == 200
    data = response.json()
    assert "100,000" in data["target_scale_capacity"]
    assert "p50_ms" in data["latency_percentiles"]
    assert data["redis_lru_cache"]["hit_ratio_percent"] > 90

def test_auth_and_rbac():
    # Login as General Contractor
    login_resp = client.post("/api/auth/login", json={
        "email": "gc@workproof.ai",
        "password": "contractor_secret"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    assert token is not None

    # Get profile
    profile_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert profile_resp.status_code == 200
    assert profile_resp.json()["role"] == "general_contractor"

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
    event_payload = {
        "type": "INITIAL_PURCHASE",
        "app_user_id": "contractor_test_42",
        "product_id": "workproof_pro_monthly"
    }
    response = client.post("/api/revenuecat/webhook", json=event_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    
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
    
    list_resp = client.get("/api/alexa/punchlist")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert any(i["task"] == "Caulk kitchen sink backsplash" for i in items)

def test_adaptive_dispute_memory():
    # Login as GC
    login_resp = client.post("/api/auth/login", json={
        "email": "gc@workproof.ai",
        "password": "contractor_secret"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Record trade rule
    rec_resp = client.post("/api/memory/record", json={
        "category": "TOLERANCE_SPEC",
        "trade": "Drywall",
        "rule_statement": "Level 5 finish mandatory under grazing light angled < 30 degrees",
        "dispute_prevention_rate": 98.5
    }, headers=headers)
    assert rec_resp.status_code == 200
    rule_id = rec_resp.json()["rule"]["id"]

    # Contractor correction override
    corr_resp = client.post("/api/memory/correct", json={
        "rule_id": rule_id,
        "corrected_statement": "Level 4 acceptable in utility areas, Level 5 required in master living foyer"
    }, headers=headers)
    assert corr_resp.status_code == 200
    assert corr_resp.json()["rule"]["user_modified"] is True
    assert corr_resp.json()["rule"]["confidence_weight"] == 1.0

    # Retrieve context
    ctx_resp = client.get("/api/memory/context", headers=headers)
    assert ctx_resp.status_code == 200
    assert "Level 4 acceptable" in ctx_resp.json()["prompt"]

def test_b2b_api_gateway():
    # Generate B2B API Key
    gen_resp = client.post("/api/v1/keys/generate", json={
        "org_id": "ORG-VANCE-BUILDERS-01",
        "name": "Procore Enterprise Sync",
        "scopes": "proofs:read,proofs:write,waivers:read,punchlist:write,memory:read"
    })
    assert gen_resp.status_code == 200
    api_key = gen_resp.json()["api_key"]
    assert api_key.startswith("wp_live_")

    b2b_headers = {"X-API-Key": api_key}

    # Verify proof via B2B
    proof_resp = client.post("/api/v1/proofs/verify", json={
        "job_id": "PRJ-PROCORE-99",
        "milestone_id": "M-FOUNDATION-01",
        "latitude": 30.2672,
        "longitude": -97.7431,
        "amount": 28500,
        "currency": "USD",
        "job_title": "Commercial Slab Pour",
        "client_name": "Austin Commercial Partners"
    }, headers=b2b_headers)
    assert proof_resp.status_code == 200
    assert proof_resp.json()["verified"] is True
    assert "statutory_waiver" in proof_resp.json()

    # Create punch item via B2B
    punch_resp = client.post("/api/v1/punchlist", json={
        "title": "Re-torque anchor bolts on gridline C-4",
        "room": "Bay 3",
        "severity": "BLOCKER"
    }, headers=b2b_headers)
    assert punch_resp.status_code == 200
    assert punch_resp.json()["item"]["severity"] == "BLOCKER"

    # Query dispute context via B2B
    disp_resp = client.get("/api/v1/memory/dispute-context", headers=b2b_headers)
    assert disp_resp.status_code == 200
    assert "top_trade_rules" in disp_resp.json()

def test_jobs_and_milestones_crud():
    # 0. Unauthenticated access must be rejected with 401 Unauthorized
    unauth_resp = client.get("/api/jobs")
    assert unauth_resp.status_code == 401

    # Authenticate as General Contractor
    login_resp = client.post("/api/auth/login", json={
        "email": "gc@workproof.ai",
        "password": "contractor_secret"
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. List contractor's isolated jobs
    list_resp = client.get("/api/jobs", headers=headers)
    assert list_resp.status_code == 200
    jobs = list_resp.json()
    assert isinstance(jobs, list)

    # 2. Create new job
    create_resp = client.post("/api/jobs", json={
        "title": "HVAC Heat Pump Replacement",
        "category": "HVAC",
        "clientName": "Michael Scott",
        "clientPhone": "+1 (555) 234-5678",
        "clientEmail": "m.scott@dundermifflin.com",
        "locationAddress": "1725 Slough Ave, Scranton, PA",
        "currency": "USD",
        "totalAmount": 8500.0
    }, headers=headers)
    assert create_resp.status_code == 200
    new_job = create_resp.json()
    job_id = new_job["id"]
    assert new_job["title"] == "HVAC Heat Pump Replacement"

    # 3. Get single job
    get_resp = client.get(f"/api/jobs/{job_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == job_id

    # 4. Edit job
    edit_resp = client.put(f"/api/jobs/{job_id}", json={
        "locationAddress": "1725 Slough Ave Suite 200, Scranton, PA",
        "totalAmount": 9200.0
    })
    assert edit_resp.status_code == 200
    assert edit_resp.json()["locationAddress"] == "1725 Slough Ave Suite 200, Scranton, PA"
    assert edit_resp.json()["totalAmount"] == 9200.0

    # 5. Add milestone
    m_resp = client.post(f"/api/jobs/{job_id}/milestones", json={
        "title": "Old Unit Removal & Line Flush",
        "description": "Evacuated R-410A refrigerant and removed compressor.",
        "amount": 2500.0
    })
    assert m_resp.status_code == 200
    m_data = m_resp.json()
    m_id = m_data["id"]
    assert m_data["title"] == "Old Unit Removal & Line Flush"

    # 6. Capture before photo
    cap_resp = client.post(f"/api/milestones/{m_id}/capture", json={
        "mode": "before",
        "photoDataUrl": "data:image/jpeg;base64,mockbeforephoto==",
        "gpsCoordinates": {"latitude": 41.4089, "longitude": -75.6624, "accuracyMeters": 2.5}
    })
    assert cap_resp.status_code == 200
    assert cap_resp.json()["status"] == "before_captured"
    assert cap_resp.json()["beforePhotoUrl"] == "data:image/jpeg;base64,mockbeforephoto=="

    # 7. Capture after photo
    cap_after = client.post(f"/api/milestones/{m_id}/capture", json={
        "mode": "after",
        "photoDataUrl": "data:image/jpeg;base64,mockafterphoto==",
        "gpsCoordinates": {"latitude": 41.4089, "longitude": -75.6624, "accuracyMeters": 2.5}
    })
    assert cap_after.status_code == 200
    assert cap_after.json()["status"] == "completed"
    assert cap_after.json()["sha256Hash"] is not None

    # 8. Sign on glass
    sign_resp = client.post(f"/api/milestones/{m_id}/sign", json={
        "signatureDataUrl": "data:image/svg+xml;utf8,<svg>sig</svg>",
        "signerName": "Michael Scott"
    })
    assert sign_resp.status_code == 200
    assert sign_resp.json()["milestone"]["status"] == "signed"
    assert sign_resp.json()["waiver"]["client_name"] == "Michael Scott"

    # 9. Mark Paid
    pay_resp = client.post(f"/api/milestones/{m_id}/pay", json={})
    assert pay_resp.status_code == 200
    assert pay_resp.json()["status"] == "paid"

    # 10. Delete milestone
    del_m = client.delete(f"/api/milestones/{m_id}")
    assert del_m.status_code == 200
    assert del_m.json()["deleted"] is True

    # 11. Delete job
    del_j = client.delete(f"/api/jobs/{job_id}")
    assert del_j.status_code == 200
    assert del_j.json()["deleted"] is True

def test_punchlist_crud():
    # 1. Create punch item
    create_resp = client.post("/api/alexa/punchlist", json={
        "task": "Align junction box in garage ceiling",
        "room": "Garage",
        "trade": "Electrical",
        "priority": "High"
    })
    assert create_resp.status_code == 200
    item = create_resp.json()
    p_id = item["id"]
    assert item["trade"] == "Electrical"
    assert item["status"] == "pending"

    # 2. Update punch item to completed
    upd_resp = client.put(f"/api/alexa/punchlist/{p_id}", json={
        "status": "completed"
    })
    assert upd_resp.status_code == 200
    assert upd_resp.json()["status"] == "completed"

    # 3. Delete punch item
    del_resp = client.delete(f"/api/alexa/punchlist/{p_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted"] is True

def test_multi_currency_lien_waivers():
    # GBP Waiver
    gbp_w = generate_statutory_lien_waiver(
        job_title="London Loft Conversion",
        client_name="Oliver Wright",
        amount=12500.0,
        currency="GBP",
        milestone_title="Steel Beam Installation",
        sha256_hash="gbp_hash_999"
    )
    assert "UK Housing Grants" in gbp_w["statute"]
    assert "£12,500.00 GBP" in gbp_w["waiver_clause"]

    # EUR Waiver
    eur_w = generate_statutory_lien_waiver(
        job_title="Berlin Office Renovation",
        client_name="Klaus Weber",
        amount=8900.0,
        currency="EUR",
        milestone_title="Floor Screed",
        sha256_hash="eur_hash_888"
    )
    assert "Directive 2011/7/EU" in eur_w["statute"]
    assert "€8,900.00 EUR" in eur_w["waiver_clause"]

def test_revenuecat_direct_subscribe_and_persistence():
    resp = client.post("/api/revenuecat/subscribe", json={
        "customer_id": "test_contractor_direct_99",
        "plan": "annual"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_active"] is True
    assert "pro_contractor" in data["entitlements"]

    # Verify retrieval
    get_resp = client.get("/api/revenuecat/customer/test_contractor_direct_99")
    assert get_resp.status_code == 200
    assert get_resp.json()["is_active"] is True
    assert get_resp.json()["status"] == "ACTIVE"

def test_b2b_scope_validation():
    # Invalid scope should be rejected with 400
    bad_resp = client.post("/api/v1/keys/generate", json={
        "org_id": "ORG-VANCE-BUILDERS-01",
        "scopes": "unauthorized_malicious_scope"
    })
    assert bad_resp.status_code == 400
    assert "Invalid scopes" in bad_resp.json()["detail"]

def test_onesignal_and_stripe_partner_integration():
    """Validates RevenueCat Shipaton mandatory partner tracks: Stripe Funnel & OneSignal Push."""
    # 1. Test OneSignal push notification dispatch & history
    send_resp = client.post("/api/onesignal/send", json={
        "title": "Inspection Complete: Island Lighting",
        "message": "Client has approved work on glass. Lien waiver released.",
        "recipient": "Sarah Jenkins",
        "channel": "OneSignal Web Push"
    })
    assert send_resp.status_code == 200
    notif_data = send_resp.json()
    assert notif_data["delivery_status"] == "DELIVERED"
    assert "OS-" in notif_data["id"]

    # 2. Test OneSignal history retrieval
    hist_resp = client.get("/api/onesignal/notifications")
    assert hist_resp.status_code == 200
    notifs = hist_resp.json()
    assert len(notifs) >= 1
    assert any("OS-" in n["id"] for n in notifs)

    # 3. Test RevenueCat + Stripe Web Billing integration
    sub_resp = client.post("/api/revenuecat/subscribe", json={
        "customer_id": "rc_usr_partner_audit_01",
        "plan": "annual",
        "stripe_customer_id": "cus_contractor_audit_99"
    })
    assert sub_resp.status_code == 200
    sub_data = sub_resp.json()
    assert sub_data["stripe_customer_id"] == "cus_contractor_audit_99"
    assert "RevenueCat + Stripe" in sub_data["gateway"]
    assert "Stripe" in sub_data["funnel_partner"]
    assert "OneSignal" in sub_data["push_partner"]

def test_ai_inspection_and_dispute_risk():
    """Validates real AI Before/After inspection, sheen dispute analysis, and dispute risk engine."""
    # 1. AI Before/After inspection
    insp_resp = client.post("/api/ai/inspect-milestone", json={
        "milestone_id": "m-01",
        "category": "Renovation"
    })
    assert insp_resp.status_code == 200
    report = insp_resp.json()
    assert report["completionPercentage"] >= 90.0
    assert report["sheenUniformityPercentage"] >= 90.0
    assert "UNIFORMITY_CONFIRMED" in report["sheenDisputeAnalysis"]["verdict"]
    assert len(report["tamperProofCertHash"]) == 64

    # 2. AI Dispute Risk Calculator
    risk_resp = client.post("/api/ai/dispute-risk", json={
        "milestoneCount": 3,
        "signedCount": 2,
        "hasGps": True,
        "hasHash": True
    })
    assert risk_resp.status_code == 200
    risk_data = risk_resp.json()
    assert risk_data["disputeShieldScore"] >= 90.0



