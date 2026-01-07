-- Family Invites Table
-- Stores invite codes for joining families

CREATE TABLE IF NOT EXISTS family_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  
  CONSTRAINT family_invites_code_uppercase CHECK (code = UPPER(code)),
  CONSTRAINT family_invites_code_length CHECK (LENGTH(code) = 6)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_family_invites_code ON family_invites(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_family_invites_family_id ON family_invites(family_id);

-- Enable Row Level Security
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can read active invites (needed for joining)
CREATE POLICY "Anyone can view active invites"
  ON family_invites
  FOR SELECT
  USING (is_active = true AND expires_at > NOW());

-- RLS Policy: Family admins can create invites
CREATE POLICY "Family admins can create invites"
  ON family_invites
  FOR INSERT
  WITH CHECK (
    created_by IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND family_id = family_invites.family_id
    )
  );

-- RLS Policy: Family admins can deactivate invites
CREATE POLICY "Family admins can update invites"
  ON family_invites
  FOR UPDATE
  USING (
    created_by IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
      AND family_id = family_invites.family_id
    )
  );

-- Function to automatically create invite code when family is created
CREATE OR REPLACE FUNCTION create_family_invite_code()
RETURNS TRIGGER AS $$
DECLARE
  v_code VARCHAR(6);
  v_unique BOOLEAN := FALSE;
BEGIN
  -- Generate unique code
  WHILE NOT v_unique LOOP
    v_code := UPPER(
      SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6)
    );
    
    -- Check if code is unique
    SELECT NOT EXISTS(
      SELECT 1 FROM family_invites WHERE code = v_code
    ) INTO v_unique;
  END LOOP;
  
  -- Create invite code
  INSERT INTO family_invites (family_id, code, created_by)
  VALUES (NEW.id, v_code, NEW.created_by);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create invite code automatically
CREATE TRIGGER trigger_create_family_invite
  AFTER INSERT ON families
  FOR EACH ROW
  EXECUTE FUNCTION create_family_invite_code();

-- Function to get active invite code for a family
CREATE OR REPLACE FUNCTION get_family_invite_code(p_family_id UUID)
RETURNS VARCHAR(6)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code VARCHAR(6);
BEGIN
  -- Get active invite code
  SELECT code INTO v_code
  FROM family_invites
  WHERE family_id = p_family_id
    AND is_active = true
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If no active code, create one
  IF v_code IS NULL THEN
    -- Generate unique code
    LOOP
      v_code := UPPER(
        SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6)
      );
      
      EXIT WHEN NOT EXISTS(
        SELECT 1 FROM family_invites WHERE code = v_code
      );
    END LOOP;
    
    -- Create new invite
    INSERT INTO family_invites (family_id, code, created_by)
    SELECT p_family_id, v_code, created_by
    FROM families
    WHERE id = p_family_id;
  END IF;
  
  RETURN v_code;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_family_invite_code(UUID) TO authenticated;

-- Comment on table
COMMENT ON TABLE family_invites IS 'Stores invite codes for families. Automatically generated when family is created.';
