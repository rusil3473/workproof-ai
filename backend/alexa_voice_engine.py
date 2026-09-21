"""
WorkProof AI - Amazon Alexa+ Voice Punch-List Co-Pilot
Supports hands-free contractor voice punch-list logging, milestone updates, and retainage queries.
"""

from typing import Dict, Any, List
import uuid
import time

class AlexaVoicePunchListManager:
    def __init__(self):
        self.punch_items: List[Dict[str, Any]] = [
            {
                "id": "pl-01",
                "task": "Touch up drywall taping on south corner",
                "trade": "Drywall / Paint",
                "priority": "Medium",
                "status": "pending",
                "logged_via": "Alexa+ Voice",
                "timestamp": "2026-09-21T14:30:00Z"
            },
            {
                "id": "pl-02",
                "task": "Calibrate GFCI outlet on kitchen island circuit",
                "trade": "Electrical",
                "priority": "High",
                "status": "completed",
                "logged_via": "Alexa+ Voice",
                "timestamp": "2026-09-21T15:10:00Z"
            }
        ]

    def process_alexa_intent(self, intent_name: str, slots: Dict[str, Any]) -> Dict[str, Any]:
        """Processes incoming Amazon Alexa+ voice intents."""
        if intent_name == "AddPunchListItemIntent":
            item_text = slots.get("task", "Inspection punch item")
            trade = slots.get("trade", "General")
            priority = slots.get("priority", "Normal")
            
            new_item = {
                "id": f"pl-{uuid.uuid4().hex[:6]}",
                "task": item_text,
                "trade": trade,
                "priority": priority,
                "status": "pending",
                "logged_via": "Alexa+ Voice",
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            self.punch_items.append(new_item)
            return {
                "speech_output": f"Added punch item for {trade}: '{item_text}'. Logged to WorkProof ledger.",
                "card_title": "WorkProof Voice Punch Added",
                "item": new_item
            }
            
        elif intent_name == "GetRetainageSummaryIntent":
            total_items = len(self.punch_items)
            pending = sum(1 for p in self.punch_items if p["status"] == "pending")
            return {
                "speech_output": f"You have {pending} pending punch items blocking final retainage payout out of {total_items} total recorded items.",
                "card_title": "WorkProof Retainage Status",
                "pending_count": pending,
                "total_count": total_items
            }
            
        elif intent_name == "CompletePunchItemIntent":
            item_id = slots.get("item_id")
            for item in self.punch_items:
                if item["id"] == item_id or item_id in item["task"].lower():
                    item["status"] = "completed"
                    return {
                        "speech_output": f"Marked '{item['task']}' as completed.",
                        "card_title": "WorkProof Item Completed",
                        "item": item
                    }
            return {
                "speech_output": "Could not find matching punch item.",
                "card_title": "Item Not Found"
            }
            
        return {
            "speech_output": "WorkProof Alexa Co-Pilot is listening. You can add punch items or check retainage status.",
            "card_title": "WorkProof Help"
        }

    def list_all_items(self) -> List[Dict[str, Any]]:
        return self.punch_items

alexa_punch_manager = AlexaVoicePunchListManager()
