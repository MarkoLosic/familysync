-- Verify that 'username' column exists in profiles table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'username';

-- Should return:
-- column_name | data_type | is_nullable
-- username    | text      | NO (or YES)

-- If it doesn't exist, check what columns DO exist:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
