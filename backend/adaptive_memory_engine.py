"""
WorkProof AI - Adaptive Dispute & Field Tolerance Memory Engine
Continuously learns contractor trade tolerances, retainage policies, and client scope habits.
Features:
1. Exponential Time-Decay Weighting: w(t) = w0 * exp(-lambda * delta_t_days) with lambda = 0.05.
2. User Correction Reinforcement: Manual corrections bump rule weight to 1.0.
3. Autonomous Context Summarization: Automatically aggregates rules when count > 5 to prevent LLM context bloat.
4. Business Context Synthesis: Injects prioritized trade knowledge into Alexa Voice & Lien Waiver generators.
"""

from datetime import datetime, timedelta
import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import uuid

from models import DisputeMemory, ContextMemorySummary

LAMBDA_DECAY = 0.05  # Half-life approx 14 days
MAX_RULES_BEFORE_SUMMARY = 5

class AdaptiveDisputeMemoryEngine:
    def __init__(self, db: Session):
        self.db = db

    def calculate_decay_weight(self, base_weight: float, updated_at: datetime) -> float:
        """Calculates exponential time-decay weight."""
        if not updated_at:
            return base_weight
        delta_days = (datetime.utcnow() - updated_at).total_seconds() / 86400.0
        decay = math.exp(-LAMBDA_DECAY * max(0.0, delta_days))
        return round(base_weight * decay, 4)

    def record_memory(
        self,
        org_id: str,
        category: str,
        trade: str,
        rule_statement: str,
        dispute_prevention_rate: float = 95.0,
        user_modified: bool = False
    ) -> DisputeMemory:
        """Stores a new trade dispute rule or updates existing matching rule."""
        existing = self.db.query(DisputeMemory).filter(
            DisputeMemory.org_id == org_id,
            DisputeMemory.trade == trade,
            DisputeMemory.category == category
        ).first()

        if existing:
            existing.rule_statement = rule_statement
            existing.dispute_prevention_rate = dispute_prevention_rate
            existing.user_modified = user_modified
            existing.confidence_weight = 1.0 if user_modified else min(1.0, existing.confidence_weight + 0.1)
            existing.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing)
            self._check_and_summarize(org_id)
            return existing

        new_mem = DisputeMemory(
            id=f"DISP-{uuid.uuid4().hex[:8].upper()}",
            org_id=org_id,
            category=category,
            trade=trade,
            rule_statement=rule_statement,
            confidence_weight=1.0 if user_modified else 0.85,
            dispute_prevention_rate=dispute_prevention_rate,
            user_modified=user_modified,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.db.add(new_mem)
        self.db.commit()
        self.db.refresh(new_mem)
        self._check_and_summarize(org_id)
        return new_mem

    def apply_user_correction(self, rule_id: str, corrected_statement: str) -> Optional[DisputeMemory]:
        """Contractor modifies AI-inferred rule, granting it maximum confidence (1.0)."""
        rule = self.db.query(DisputeMemory).filter(DisputeMemory.id == rule_id).first()
        if not rule:
            return None
        rule.rule_statement = corrected_statement
        rule.user_modified = True
        rule.confidence_weight = 1.0
        rule.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(rule)
        return rule

    def get_ranked_context(self, org_id: str) -> List[Dict[str, Any]]:
        """Returns trade dispute memories sorted by decayed weight descending."""
        memories = self.db.query(DisputeMemory).filter(DisputeMemory.org_id == org_id).all()
        ranked = []
        for m in memories:
            effective_weight = 1.0 if m.user_modified else self.calculate_decay_weight(m.confidence_weight, m.updated_at)
            ranked.append({
                "id": m.id,
                "category": m.category,
                "trade": m.trade,
                "rule_statement": m.rule_statement,
                "base_weight": m.confidence_weight,
                "effective_weight": effective_weight,
                "dispute_prevention_rate": m.dispute_prevention_rate,
                "user_modified": m.user_modified,
                "updated_at": m.updated_at.isoformat() if m.updated_at else None
            })
        ranked.sort(key=lambda x: x["effective_weight"], reverse=True)
        return ranked

    def _check_and_summarize(self, org_id: str):
        """Compresses memories into high-density summary if rule count exceeds threshold."""
        count = self.db.query(DisputeMemory).filter(DisputeMemory.org_id == org_id).count()
        if count >= MAX_RULES_BEFORE_SUMMARY:
            memories = self.db.query(DisputeMemory).filter(DisputeMemory.org_id == org_id).all()
            lines = [f"- [{m.trade} / {m.category}]: {m.rule_statement}" for m in memories]
            summary_text = (
                f"Field Execution Summary ({count} active trade rules):\n" + "\n".join(lines[:6])
            )
            summary_rec = ContextMemorySummary(
                id=f"SUMM-{uuid.uuid4().hex[:8].upper()}",
                org_id=org_id,
                summary_text=summary_text,
                rule_count=count,
                compression_ratio=round(len(summary_text) / (count * 150), 2),
                created_at=datetime.utcnow()
            )
            self.db.add(summary_rec)
            self.db.commit()

    def get_latest_summary(self, org_id: str) -> Optional[Dict[str, Any]]:
        summ = self.db.query(ContextMemorySummary).filter(
            ContextMemorySummary.org_id == org_id
        ).order_by(ContextMemorySummary.created_at.desc()).first()
        return summ.to_dict() if summ else None

    def synthesize_dispute_prompt(self, org_id: str) -> str:
        """Synthesizes high-priority trade context for Alexa+ Voice and statutory lien waiver generation."""
        summary = self.get_latest_summary(org_id)
        ranked = self.get_ranked_context(org_id)
        
        prompt_parts = ["=== WORKPROOF FIELD DISPUTE TOLERANCE CONTEXT ==="]
        if summary:
            prompt_parts.append(f"Compressed Knowledge Base: {summary['summary_text']}")
        
        prompt_parts.append("\nTop Active Trade Rules (Highest Weighting):")
        for r in ranked[:4]:
            tag = "[CONTRACTOR OVERRIDE]" if r["user_modified"] else f"[Weight: {r['effective_weight']}]"
            prompt_parts.append(f"• {tag} ({r['trade']}): {r['rule_statement']}")
        
        return "\n".join(prompt_parts)
