"""
WorkProof AI - RevenueCat Webhook & Entitlement Engine
Handles V2 Webhooks for App Store, Google Play, and Stripe subscriptions.
"""

from typing import Dict, Any, List
import time

class RevenueCatManager:
    def __init__(self):
        # In-memory mock subscription ledger
        self.subscribers: Dict[str, Dict[str, Any]] = {
            "rc_usr_contractor_7829": {
                "user_id": "rc_usr_contractor_7829",
                "tier": "pro_annual",
                "entitlements": ["pro_access", "ghost_camera_4k", "unlimited_jobs", "tamper_proof_pdf"],
                "active_since": "2026-09-01T00:00:00Z",
                "expires_at": "2027-09-01T00:00:00Z",
                "is_active": True,
                "latest_event": "INITIAL_PURCHASE"
            }
        }

    def get_customer_info(self, user_id: str) -> Dict[str, Any]:
        """Returns customer entitlements and subscription status."""
        if user_id not in self.subscribers:
            return {
                "user_id": user_id,
                "tier": "free",
                "entitlements": ["basic_camera"],
                "is_active": False,
                "expires_at": None,
                "remaining_free_jobs": 3
            }
        return self.subscribers[user_id]

    def process_webhook_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Processes RevenueCat webhook payload."""
        event_type = event_data.get("type", "UNKNOWN")
        app_user_id = event_data.get("app_user_id", "rc_anonymous")
        product_id = event_data.get("product_id", "workproof_pro_monthly")
        
        if event_type in ("INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE"):
            self.subscribers[app_user_id] = {
                "user_id": app_user_id,
                "tier": "pro_annual" if "annual" in product_id else "pro_monthly",
                "entitlements": ["pro_access", "ghost_camera_4k", "unlimited_jobs", "tamper_proof_pdf"],
                "active_since": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "expires_at": "2027-09-22T00:00:00Z",
                "is_active": True,
                "latest_event": event_type
            }
            status_msg = f"Subscription activated: {event_type} for {app_user_id}"
        elif event_type == "EXPIRATION":
            if app_user_id in self.subscribers:
                self.subscribers[app_user_id]["is_active"] = False
                self.subscribers[app_user_id]["latest_event"] = "EXPIRATION"
            status_msg = f"Subscription expired for {app_user_id}"
        else:
            status_msg = f"Handled unhandled event {event_type}"

        return {
            "status": "success",
            "message": status_msg,
            "subscriber": self.get_customer_info(app_user_id)
        }

revenuecat_engine = RevenueCatManager()
