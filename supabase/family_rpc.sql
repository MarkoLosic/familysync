-- RPC helpers to bypass RLS for family create/join

CREATE OR REPLACE FUNCTION public.create_family_and_join(family_name text)
RETURNS families
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_family families;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  INSERT INTO families (name)
  VALUES (family_name)
  RETURNING * INTO new_family;

  UPDATE profiles
  SET family_id = new_family.id,
      role = 'member'
  WHERE id = auth.uid();

  RETURN new_family;
END;
$$;

CREATE OR REPLACE FUNCTION public.join_family_by_code(invite text)
RETURNS families
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  found_family families;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT * INTO found_family
  FROM families
  WHERE invite_code = invite
  LIMIT 1;

  IF found_family.id IS NULL THEN
    RAISE EXCEPTION 'invalid_invite';
  END IF;

  UPDATE profiles
  SET family_id = found_family.id,
      role = 'member'
  WHERE id = auth.uid();

  RETURN found_family;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_family_and_join(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_family_by_code(text) TO authenticated;
