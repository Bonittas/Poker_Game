import json
import uuid
from typing import List, Optional
from datetime import datetime
from app.db.database import get_db_cursor, check_table_exists # Import check_table_exists
from app.models.hand import HandData

class HandRepository:
    def __init__(self):
        self.table_name = "hands"
        self.table_exists = check_table_exists(self.table_name)
        if not self.table_exists:
            print(f"Warning: Table 	{self.table_name}	 does not exist. Database operations will fail until the table is created.")

    def create_hand(self, hand: HandData) -> Optional[HandData]:
        """
        Save a hand to the database.
        """
        if not self.table_exists:
            print(f"Error: Cannot create hand, table 	{self.table_name}	 does not exist.")
            return None
            
        try:
            with get_db_cursor(commit=True) as cursor:
                try:
                    # Convert UUID to string to avoid adaptation issues
                    hand_id = str(hand.id)
                    
                    # Convert datetime to ISO format string
                    created_at = hand.created_at.isoformat()
                    
                    # Convert dictionaries to JSON strings
                    stack_settings = json.dumps(hand.stack_settings)
                    player_roles = json.dumps(hand.player_roles)
                    hole_cards = json.dumps(hand.hole_cards)
                    winnings = json.dumps(hand.winnings)
                    
                    cursor.execute(
                        f"""
                        INSERT INTO {self.table_name} (id, created_at, stack_settings, player_roles, hole_cards, action_sequence, winnings)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING id, created_at, stack_settings, player_roles, hole_cards, action_sequence, winnings
                        """,
                        (hand_id, created_at, stack_settings, player_roles, hole_cards, hand.action_sequence, winnings)
                    )
                    
                    result = cursor.fetchone()
                    if result:
                        # Convert row to HandData
                        return self._row_to_hand_data(result)
                    return None
                except Exception as e:
                    print(f"Error in database operation: {e}")
                    # Try with a more direct approach if the first attempt failed
                    try:
                        print("Attempting alternative insert approach...")
                        # Ensure all values are strings to avoid type issues
                        hand_id = str(hand.id)
                        created_at = hand.created_at.isoformat()
                        stack_settings = json.dumps(hand.stack_settings)
                        player_roles = json.dumps(hand.player_roles)
                        hole_cards = json.dumps(hand.hole_cards)
                        action_sequence = hand.action_sequence
                        winnings = json.dumps(hand.winnings)
                        
                        cursor.execute(
                            f"""
                            INSERT INTO {self.table_name} (id, created_at, stack_settings, player_roles, hole_cards, action_sequence, winnings)
                            VALUES (%s, %s, %s, %s, %s, %s, %s)
                            """,
                            (hand_id, created_at, stack_settings, player_roles, hole_cards, action_sequence, winnings)
                        )
                        
                        # Return a reconstructed hand object since we might not have RETURNING capability
                        return HandData(
                            id=uuid.UUID(hand_id),
                            created_at=datetime.fromisoformat(created_at),
                            stack_settings=hand.stack_settings,
                            player_roles=hand.player_roles,
                            hole_cards=hand.hole_cards,
                            action_sequence=action_sequence,
                            winnings=hand.winnings
                        )
                    except Exception as e2:
                        print(f"Alternative insert also failed: {e2}")
                        raise
        except Exception as e:
            print(f"Error creating hand in repository: {e}")
            raise

    def get_all_hands(self) -> List[HandData]:
        """
        Retrieve all hands from the database.
        """
        if not self.table_exists:
            print(f"Error: Cannot get hands, table 	{self.table_name}	 does not exist.")
            return []
            
        try:
            with get_db_cursor() as cursor:
                try:
                    cursor.execute(
                        f"""
                        SELECT id, created_at, stack_settings, player_roles, hole_cards, action_sequence, winnings
                        FROM {self.table_name}
                        ORDER BY created_at DESC
                        """
                    )
                    
                    rows = cursor.fetchall()
                    return [self._row_to_hand_data(row) for row in rows]
                except Exception as e:
                    print(f"Error in SELECT query: {e}")
                    # Return empty list if table doesn't exist or other issues
                    print("Returning empty hands list due to database error")
                    return []
        except Exception as e:
            print(f"Error getting all hands from repository: {e}")
            # Return empty list on error to avoid breaking the frontend
            return []

    def get_hand_by_id(self, hand_id: uuid.UUID) -> Optional[HandData]:
        """
        Retrieve a specific hand by ID.
        """
        if not self.table_exists:
            print(f"Error: Cannot get hand by ID, table 	{self.table_name}	 does not exist.")
            return None
            
        try:
            with get_db_cursor() as cursor:
                try:
                    # Always convert UUID to string for database operations
                    id_str = str(hand_id)
                    cursor.execute(
                        f"""
                        SELECT id, created_at, stack_settings, player_roles, hole_cards, action_sequence, winnings
                        FROM {self.table_name}
                        WHERE id = %s
                        """,
                        (id_str,)
                    )
                    
                    row = cursor.fetchone()
                    if row:
                        return self._row_to_hand_data(row)
                    return None
                except Exception as e:
                    print(f"Error in SELECT by ID query: {e}")
                    return None
        except Exception as e:
            print(f"Error getting hand by ID from repository: {e}")
            return None

    def _row_to_hand_data(self, row) -> HandData:
        """
        Convert a database row to a HandData object with robust error handling.
        """
        try:
            # Handle both tuple and dict-like cursor results
            if hasattr(row, 'keys'):
                # DictCursor
                id_val = row['id']
                created_at = row['created_at']
                stack_settings = row['stack_settings']
                player_roles = row['player_roles']
                hole_cards = row['hole_cards']
                action_sequence = row['action_sequence']
                winnings = row['winnings']
            else:
                # Regular cursor (tuple)
                id_val = row[0]
                created_at = row[1]
                stack_settings = row[2]
                player_roles = row[3]
                hole_cards = row[4]
                action_sequence = row[5]
                winnings = row[6]
            
            # Parse JSON strings if needed (assuming TEXT storage)
            try:
                stack_settings = json.loads(stack_settings) if isinstance(stack_settings, str) else stack_settings or {}
                player_roles = json.loads(player_roles) if isinstance(player_roles, str) else player_roles or {}
                hole_cards = json.loads(hole_cards) if isinstance(hole_cards, str) else hole_cards or {}
                winnings = json.loads(winnings) if isinstance(winnings, str) else winnings or {}
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                # Provide default values if JSON parsing fails
                stack_settings = stack_settings if isinstance(stack_settings, dict) else {}
                player_roles = player_roles if isinstance(player_roles, dict) else {}
                hole_cards = hole_cards if isinstance(hole_cards, dict) else {}
                winnings = winnings if isinstance(winnings, dict) else {}
                
            # Convert string ID to UUID if needed
            try:
                if isinstance(id_val, str):
                    id_val = uuid.UUID(id_val)
            except ValueError:
                # If UUID conversion fails, generate a new one
                print(f"Invalid UUID format: {id_val}, generating new UUID")
                id_val = uuid.uuid4()
                
            # Convert string timestamp to datetime if needed
            try:
                if isinstance(created_at, str):
                    created_at = datetime.fromisoformat(created_at)
                elif not isinstance(created_at, datetime):
                     # Fallback if it's not a string or datetime
                     print(f"Invalid datetime format: {created_at}, using current time")
                     created_at = datetime.utcnow()
            except ValueError:
                # If datetime parsing fails, use current time
                print(f"Invalid datetime format: {created_at}, using current time")
                created_at = datetime.utcnow()
                
            return HandData(
                id=id_val,
                created_at=created_at,
                stack_settings=stack_settings,
                player_roles=player_roles,
                hole_cards=hole_cards,
                action_sequence=action_sequence,
                winnings=winnings
            )
        except Exception as e:
            print(f"Error converting row to HandData: {e}")
            # Return a minimal valid HandData object to avoid breaking the application
            return HandData(
                id=uuid.uuid4(),
                created_at=datetime.utcnow(),
                stack_settings={},
                player_roles={},
                hole_cards={},
                action_sequence="",
                winnings={}
            )
