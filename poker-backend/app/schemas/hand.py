from pydantic import BaseModel, Field
from typing import Dict, List, Optional
import uuid
from datetime import datetime

class HandCreateSchema(BaseModel):
    stack_settings: Dict[str, int] = Field(..., example={"Player1": 10000, "Player2": 8500})
    player_roles: Dict[str, str] = Field(..., example={"dealer": "Player1", "sb": "Player2", "bb": "Player3"})
    hole_cards: Dict[str, List[str]] = Field(..., example={"Player1": ["As", "Kh"], "Player2": ["7d", "7c"]})
    action_sequence: str = Field(..., example="r200 c c / Flop: [Ks,Qd,Jc] / b400 c / Turn: [2h] / x x / River: [8s] / x b1000 f")

    class Config:
        from_attributes = True

class HandResponseSchema(BaseModel):
    id: uuid.UUID
    created_at: datetime
    stack_settings: Dict[str, int]
    player_roles: Dict[str, str]
    hole_cards: Dict[str, List[str]]
    action_sequence: str
    winnings: Dict[str, int]

    class Config:
        from_attributes = True

class HandListResponseSchema(BaseModel):
    hands: List[HandResponseSchema]

    class Config:
        from_attributes = True