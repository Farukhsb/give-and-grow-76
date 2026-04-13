CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF auth.uid() <> OLD.user_id THEN
    RAISE EXCEPTION 'You can only update your own profile';
  END IF;

  IF NOT public.has_role(auth.uid(), 'admin') THEN
    IF NEW.user_id <> OLD.user_id
      OR NEW.role <> OLD.role
      OR NEW.points <> OLD.points
      OR NEW.badges IS DISTINCT FROM OLD.badges THEN
      RAISE EXCEPTION 'Protected profile fields cannot be changed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_fields_trigger ON public.profiles;
CREATE TRIGGER protect_profile_fields_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_fields();

COMMENT ON FUNCTION public.protect_profile_fields() IS
'Prevents non-admin users from changing protected profile fields such as role, points, badges, or ownership.';
