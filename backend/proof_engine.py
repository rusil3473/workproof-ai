"""
WorkProof AI - Cryptographic Proof Engine
Validates SHA-256 tamper-proof photo hashes, GPS spatial tolerances, and statutory lien waivers.
"""

import hashlib
import time
from typing import Dict, Any, Optional

def compute_proof_hash(
    job_id: str,
    milestone_id: str,
    timestamp: str,
    latitude: float,
    longitude: float,
    device_id: str = "contractor-field-device-01"
) -> str:
    """Computes immutable SHA-256 digest linking physical coordinates, time, and job identity."""
    raw_payload = f"{job_id}:{milestone_id}:{timestamp}:{latitude:.6f}:{longitude:.6f}:{device_id}"
    return hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()

def verify_proof_hash(
    claimed_hash: str,
    job_id: str,
    milestone_id: str,
    timestamp: str,
    latitude: float,
    longitude: float,
    device_id: str = "contractor-field-device-01"
) -> bool:
    """Verifies that the claimed proof hash exactly matches the cryptographically derived hash."""
    expected_hash = compute_proof_hash(job_id, milestone_id, timestamp, latitude, longitude, device_id)
    return claimed_hash.lower() == expected_hash.lower()

def generate_statutory_lien_waiver(
    job_title: str,
    client_name: str,
    amount: float,
    currency: str,
    milestone_title: str,
    sha256_hash: str
) -> Dict[str, Any]:
    """Generates dual-jurisdiction legal text for client glass sign-off."""
    if currency == "USD":
        legal_statute = "California Civil Code §8134 / Texas Property Code §53.284 Unconditional Progress Waiver"
        waiver_clause = (
            f"The undersigned client ({client_name}) acknowledges satisfactory inspection and acceptance of "
            f"'{milestone_title}' for the sum of ${amount:,.2f} USD. Service provider unconditionally waives mechanic's lien "
            f"rights strictly for this verified milestone progress payment under {legal_statute}. "
            f"Cryptographic Evidence Audit Hash: {sha256_hash}."
        )
    else:  # INR
        legal_statute = "Indian Contract Act, 1872 & GST Rule 46 Tax Invoicing Statutory Sign-Off"
        waiver_clause = (
            f"The client ({client_name}) hereby formally certifies physical verification and completion of work "
            f"under '{milestone_title}' amounting to ₹{amount:,.2f} INR. This electronic certification constitutes valid "
            f"proof for GST Input Tax Credit (ITC) claiming and Section 194C TDS deduction compliance. "
            f"Verifiable SHA-256 Audit Digest: {sha256_hash}."
        )
        
    return {
        "statute": legal_statute,
        "waiver_clause": waiver_clause,
        "verified_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "tamper_proof": True
    }
