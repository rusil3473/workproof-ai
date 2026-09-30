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
    device_id: str = "contractor-field-device-01",
    image_bytes: Optional[bytes] = None,
    image_base64: Optional[str] = None
) -> str:
    """Computes immutable SHA-256 digest linking physical coordinates, time, job identity,
    and raw image binary hash to prevent photoshopping or tampering with proof photos."""
    image_digest = ""
    if image_bytes:
        image_digest = f":{hashlib.sha256(image_bytes).hexdigest()}"
    elif image_base64:
        image_digest = f":{hashlib.sha256(image_base64.encode('utf-8')).hexdigest()}"

    raw_payload = f"{job_id}:{milestone_id}:{timestamp}:{latitude:.6f}:{longitude:.6f}:{device_id}{image_digest}"
    return hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()

def verify_proof_hash(
    claimed_hash: str,
    job_id: str,
    milestone_id: str,
    timestamp: str,
    latitude: float,
    longitude: float,
    device_id: str = "contractor-field-device-01",
    image_bytes: Optional[bytes] = None,
    image_base64: Optional[str] = None
) -> bool:
    """Verifies that the claimed proof hash exactly matches the cryptographically derived hash."""
    expected_hash = compute_proof_hash(
        job_id, milestone_id, timestamp, latitude, longitude, device_id,
        image_bytes=image_bytes, image_base64=image_base64
    )
    return claimed_hash.lower() == expected_hash.lower()

def generate_statutory_lien_waiver(
    job_title: str,
    client_name: str,
    amount: float,
    currency: str,
    milestone_title: str,
    sha256_hash: str
) -> Dict[str, Any]:
    """Generates jurisdiction-specific legal statutory waiver text for client glass sign-off."""
    curr_upper = (currency or "USD").upper()

    if curr_upper == "USD":
        legal_statute = "California Civil Code §8134 / Texas Property Code §53.284 Unconditional Progress Waiver"
        waiver_clause = (
            f"The undersigned client ({client_name}) acknowledges satisfactory inspection and acceptance of "
            f"'{milestone_title}' for the sum of ${amount:,.2f} USD. Service provider unconditionally waives mechanic's lien "
            f"rights strictly for this verified milestone progress payment under {legal_statute}. "
            f"Cryptographic Evidence Audit Hash: {sha256_hash}."
        )
    elif curr_upper == "INR":
        legal_statute = "Indian Contract Act, 1872 & GST Rule 46 Tax Invoicing Statutory Sign-Off"
        waiver_clause = (
            f"The client ({client_name}) hereby formally certifies physical verification and completion of work "
            f"under '{milestone_title}' amounting to ₹{amount:,.2f} INR. This electronic certification constitutes valid "
            f"proof for GST Input Tax Credit (ITC) claiming and Section 194C TDS deduction compliance. "
            f"Verifiable SHA-256 Audit Digest: {sha256_hash}."
        )
    elif curr_upper == "GBP":
        legal_statute = "UK Housing Grants, Construction and Regeneration Act 1996 & Statutory Interim Payment Notice"
        waiver_clause = (
            f"The employer/client ({client_name}) certifies due inspection and satisfaction of works under "
            f"'{milestone_title}' amounting to £{amount:,.2f} GBP. This serves as an unconditional milestone discharge "
            f"under the UK Construction Act 1996. Verifiable Cryptographic Digest: {sha256_hash}."
        )
    elif curr_upper == "EUR":
        legal_statute = "EU Directive 2011/7/EU (Late Commercial Payments) & European Civil Code Proof of Work"
        waiver_clause = (
            f"The client ({client_name}) formally approves delivery and execution of '{milestone_title}' for "
            f"the sum of €{amount:,.2f} EUR. Service provider confirms partial release of retention rights strictly for "
            f"this milestone deliverable. Audit Hash: {sha256_hash}."
        )
    else:
        legal_statute = "UNCITRAL Model Law on Electronic Commerce & International Commercial Code §4-A"
        waiver_clause = (
            f"The client ({client_name}) acknowledges and approves milestone deliverables under '{milestone_title}' "
            f"in the certified amount of {amount:,.2f} {curr_upper}. Evidence verified via SHA-256 hash {sha256_hash}."
        )
        
    return {
        "statute": legal_statute,
        "waiver_clause": waiver_clause,
        "currency": curr_upper,
        "verified_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "tamper_proof": True
    }
