-- Supabase RPC Function for Claiming Rewards
-- This function handles the reward claiming transaction atomically
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION claim_reward(
  p_reward_id UUID,
  p_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reward RECORD;
  v_profile RECORD;
  v_new_balance INTEGER;
BEGIN
  -- Get reward details
  SELECT * INTO v_reward
  FROM rewards
  WHERE id = p_reward_id;

  -- Check if reward exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reward not found';
  END IF;

  -- Check if reward is active
  IF NOT v_reward.is_active THEN
    RAISE EXCEPTION 'Reward is not active';
  END IF;

  -- Get user profile
  SELECT * INTO v_profile
  FROM profiles
  WHERE user_id = p_user_id;

  -- Check if profile exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Check if user has enough points
  IF v_profile.points < v_reward.points_required THEN
    RAISE EXCEPTION 'User has insufficient points. Required: %, Current: %', 
      v_reward.points_required, v_profile.points;
  END IF;

  -- Calculate new balance
  v_new_balance := v_profile.points - v_reward.points_required;

  -- Deduct points from user
  UPDATE profiles
  SET 
    points = v_new_balance,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Optional: Create a reward_claims table to track history
  -- INSERT INTO reward_claims (profile_id, reward_id, points_spent, claimed_at)
  -- VALUES (v_profile.id, p_reward_id, v_reward.points_required, NOW());

  -- Return success response
  RETURN json_build_object(
    'success', TRUE,
    'new_balance', v_new_balance,
    'message', 'Reward claimed successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Return error response
    RETURN json_build_object(
      'success', FALSE,
      'new_balance', 0,
      'message', SQLERRM
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION claim_reward(UUID, UUID) TO authenticated;

-- Optional: Create a reward_claims table to track claim history
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  points_spent INTEGER NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT reward_claims_points_spent_positive CHECK (points_spent > 0)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reward_claims_profile_id ON reward_claims(profile_id);
CREATE INDEX IF NOT EXISTS idx_reward_claims_claimed_at ON reward_claims(claimed_at);

-- Enable Row Level Security
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own claim history
CREATE POLICY "Users can view their own reward claims"
  ON reward_claims
  FOR SELECT
  USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

-- RLS Policy: System can insert claims (via RPC function)
CREATE POLICY "System can insert reward claims"
  ON reward_claims
  FOR INSERT
  WITH CHECK (true);

-- Comment the function
COMMENT ON FUNCTION claim_reward IS 'Atomically claims a reward for a user, deducting points and creating a claim record';
