from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional
import uuid

@dataclass
class HandData:
    """Represents a completed poker hand stored in the database."""
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    created_at: datetime = field(default_factory=datetime.utcnow) # Store as UTC
    stack_settings: Dict[str, int] = field(default_factory=dict) # {player_id: stack}
    player_roles: Dict[str, str] = field(default_factory=dict) # {role: player_id}
    hole_cards: Dict[str, List[str]] = field(default_factory=dict) # {player_id: [card1, card2]}
    action_sequence: str = ""
    winnings: Dict[str, int] = field(default_factory=dict) # {player_id: amount_won_or_lost}

