import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.repositories.hand_repository import HandRepository
from app.models.hand import HandData
import uuid
from datetime import datetime
from unittest.mock import patch, MagicMock

# Create a test client
client = TestClient(app)

# Mock data for testing
mock_hand_data = HandData(
    id=uuid.uuid4(),
    created_at=datetime.utcnow(),
    stack_settings={"Player1": 1000, "Player2": 1000, "Player3": 1000, "Player4": 1000, "Player5": 1000, "Player6": 1000},
    player_roles={"dealer": "Player1", "sb": "Player2", "bb": "Player3"},
    hole_cards={"Player1": ["Ah", "Kd"], "Player2": ["Jc", "Js"], "Player3": ["7h", "8h"], 
                "Player4": ["2c", "3d"], "Player5": ["Qh", "Td"], "Player6": ["5s", "5c"]},
    action_sequence="r200 c c / Flop: [Ks,Qd,Jc] / b400 c / Turn: [2h] / x x / River: [8s] / x b1000 f",
    winnings={"Player1": 1500, "Player2": -1000, "Player3": -500, "Player4": 0, "Player5": 0, "Player6": 0}
)

mock_hand_request = {
    "stack_settings": {"Player1": 1000, "Player2": 1000, "Player3": 1000, "Player4": 1000, "Player5": 1000, "Player6": 1000},
    "player_roles": {"dealer": "Player1", "sb": "Player2", "bb": "Player3"},
    "hole_cards": {"Player1": ["Ah", "Kd"], "Player2": ["Jc", "Js"], "Player3": ["7h", "8h"], 
                  "Player4": ["2c", "3d"], "Player5": ["Qh", "Td"], "Player6": ["5s", "5c"]},
    "action_sequence": "r200 c c / Flop: [Ks,Qd,Jc] / b400 c / Turn: [2h] / x x / River: [8s] / x b1000 f"
}

@pytest.fixture
def mock_repository():
    """Create a mock repository for testing."""
    with patch('app.api.hand.get_hand_repository') as mock_get_repo:
        mock_repo = MagicMock(spec=HandRepository)
        mock_get_repo.return_value = mock_repo
        yield mock_repo

def test_read_root():
    """Test the root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Welcome to the Poker Hand API"}

def test_get_all_hands(mock_repository):
    """Test getting all hands."""
    # Setup mock
    mock_repository.get_all_hands.return_value = [mock_hand_data]
    
    # Make request
    response = client.get("/hands/")
    
    # Assertions
    assert response.status_code == 200
    assert "hands" in response.json()
    assert len(response.json()["hands"]) == 1
    assert mock_repository.get_all_hands.called

def test_get_hand_by_id(mock_repository):
    """Test getting a hand by ID."""
    # Setup mock
    hand_id = str(mock_hand_data.id)
    mock_repository.get_hand_by_id.return_value = mock_hand_data
    
    # Make request
    response = client.get(f"/hands/{hand_id}")
    
    # Assertions
    assert response.status_code == 200
    assert response.json()["id"] == hand_id
    mock_repository.get_hand_by_id.assert_called_once_with(uuid.UUID(hand_id))

def test_get_hand_by_id_not_found(mock_repository):
    """Test getting a non-existent hand."""
    # Setup mock
    hand_id = str(uuid.uuid4())
    mock_repository.get_hand_by_id.return_value = None
    
    # Make request
    response = client.get(f"/hands/{hand_id}")
    
    # Assertions
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

@patch('app.api.hand.process_hand')
def test_create_hand(mock_process_hand, mock_repository):
    """Test creating a hand."""
    # Setup mocks
    mock_process_hand.return_value = mock_hand_data
    mock_repository.create_hand.return_value = mock_hand_data
    
    # Make request
    response = client.post("/hands/", json=mock_hand_request)
    
    # Assertions
    assert response.status_code == 201
    assert "id" in response.json()
    assert "winnings" in response.json()
    mock_process_hand.assert_called_once()
    mock_repository.create_hand.assert_called_once()

@patch('app.api.hand.process_hand')
def test_create_hand_validation_error(mock_process_hand, mock_repository):
    """Test creating a hand with invalid data."""
    # Setup mock to raise ValueError
    mock_process_hand.side_effect = ValueError("Invalid hand data")
    
    # Make request with invalid data
    response = client.post("/hands/", json=mock_hand_request)
    
    # Assertions
    assert response.status_code == 400
    assert "Invalid hand data" in response.json()["detail"]
    mock_process_hand.assert_called_once()
    assert not mock_repository.create_hand.called

@patch('app.api.hand.process_hand')
def test_create_hand_server_error(mock_process_hand, mock_repository):
    """Test server error when creating a hand."""
    # Setup mock to raise unexpected exception
    mock_process_hand.return_value = mock_hand_data
    mock_repository.create_hand.return_value = None  # Simulate DB error
    
    # Make request
    response = client.post("/hands/", json=mock_hand_request)
    
    # Assertions
    assert response.status_code == 500
    assert "Failed to save" in response.json()["detail"]
    mock_process_hand.assert_called_once()
    mock_repository.create_hand.assert_called_once()
