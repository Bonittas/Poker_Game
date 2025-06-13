from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
import uuid
from pydantic import TypeAdapter # Import TypeAdapter

from app.schemas.hand import HandCreateSchema, HandResponseSchema, HandListResponseSchema
from app.services.hand_logic import process_hand
from app.repositories.hand_repository import HandRepository
from app.models.hand import HandData

router = APIRouter(
    prefix="/hands",
    tags=["hands"],
    responses={404: {"description": "Not found"}},
)

# Dependency to get the repository instance
def get_hand_repository() -> HandRepository:
    return HandRepository()

# Create a TypeAdapter for the list response
hand_list_adapter = TypeAdapter(List[HandResponseSchema])

@router.post("/", response_model=HandResponseSchema, status_code=status.HTTP_201_CREATED)
def create_hand_endpoint(
    hand_input: HandCreateSchema,
    repo: HandRepository = Depends(get_hand_repository)
):
    """
    Receives hand data from the client, calculates winnings using pokerkit,
    saves the completed hand to the database, and returns the saved hand data.
    """
    try:
        processed_hand_data: HandData = process_hand(hand_input)
        saved_hand: Optional[HandData] = repo.create_hand(processed_hand_data)

        if not saved_hand:
            if not repo.table_exists:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database table \'hands\' does not exist. Cannot save hand.")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to save hand data to database.")

        # Use Pydantic V2 model_validate for single object
        return HandResponseSchema.model_validate(saved_hand)

    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        print(f"Error in create_hand_endpoint: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"An unexpected error occurred while processing the hand: {type(e).__name__} - {e}")

@router.get("/", response_model=HandListResponseSchema)
def get_all_hands_endpoint(
    repo: HandRepository = Depends(get_hand_repository)
):
    """
    Retrieves all saved hand histories from the database.
    """
    try:
        hands: List[HandData] = repo.get_all_hands()
        if not repo.table_exists and not hands:
             return HandListResponseSchema(hands=[])
             
        # Use TypeAdapter for list validation/conversion from attributes
        validated_hands = hand_list_adapter.validate_python(hands, from_attributes=True)
        return HandListResponseSchema(hands=validated_hands)
        
    except Exception as e:
        print(f"Error in get_all_hands_endpoint: {e}")
        # Add more detail to the exception message if possible
        error_detail = f"Failed to retrieve hand histories: {type(e).__name__} - {e}"
        # Check for specific Pydantic validation errors
        if hasattr(e, 'errors'):
            error_detail += f" Validation Errors: {e.errors()}"
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_detail)

@router.get("/{hand_id}", response_model=HandResponseSchema)
def get_hand_by_id_endpoint(
    hand_id: uuid.UUID,
    repo: HandRepository = Depends(get_hand_repository)
):
    """
    Retrieves a specific hand history by its UUID.
    """
    try:
        hand: Optional[HandData] = repo.get_hand_by_id(hand_id)
        if hand is None:
             if not repo.table_exists:
                  raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Hand with ID {hand_id} not found (table missing).")
             raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Hand with ID {hand_id} not found.")

        # Use Pydantic V2 model_validate for single object
        return HandResponseSchema.model_validate(hand)
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error in get_hand_by_id_endpoint: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve hand history: {type(e).__name__} - {e}")

