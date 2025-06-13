import axios from "axios";

export interface HandCreateRequest {
  stack_settings: Record<string, number>;
  player_roles: Record<string, string>;
  hole_cards: Record<string, string[]>;
  action_sequence: string;
}

export interface HandData {
  id: string;
  created_at: string;
  stack_settings: Record<string, number>;
  player_roles: Record<string, string>;
  hole_cards: Record<string, string[]>;
  action_sequence: string;
  winnings: Record<string, number>;
}

export const apiService = {
  createHand: async (handData: HandCreateRequest): Promise<HandData | null> => {
    try {
      const response = await axios.post("http://localhost:8000/hands", handData);
      return response.data;
    } catch (error) {
      console.error("Error creating hand:", error);
      return null;
    }
  },

  getAllHands: async (): Promise<HandData[]> => {
    try {
      const response = await axios.get("http://localhost:8000/hands");
      return response.data.hands || [];
    } catch (error) {
      console.error("Error fetching hands:", error);
      return [];
    }
  },
};
