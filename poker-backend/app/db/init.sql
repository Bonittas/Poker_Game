CREATE TABLE IF NOT EXISTS hands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stack_settings JSONB,
    player_roles JSONB,
    hole_cards JSONB,
    action_sequence TEXT,
    winnings JSONB
);