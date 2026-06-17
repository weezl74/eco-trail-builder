CREATE OR REPLACE FUNCTION public.profiles_guard_protected_cols()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() IS DISTINCT FROM NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Block self-elevation / PII tampering via direct table writes.
  -- These fields are set at signup (handle_new_user) and may only be
  -- changed by service_role (server-side / admin flows).
  IF OLD.account_type IS DISTINCT FROM NEW.account_type THEN
    RAISE EXCEPTION 'account_type cannot be changed by the user';
  END IF;
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    RAISE EXCEPTION 'phone cannot be changed directly';
  END IF;
  IF OLD.address IS DISTINCT FROM NEW.address THEN
    RAISE EXCEPTION 'address cannot be changed directly';
  END IF;
  IF OLD.postcode IS DISTINCT FROM NEW.postcode THEN
    RAISE EXCEPTION 'postcode cannot be changed directly';
  END IF;
  IF OLD.age IS DISTINCT FROM NEW.age THEN
    RAISE EXCEPTION 'age cannot be changed directly';
  END IF;
  IF OLD.first_name IS DISTINCT FROM NEW.first_name THEN
    RAISE EXCEPTION 'first_name cannot be changed directly';
  END IF;
  IF OLD.last_name IS DISTINCT FROM NEW.last_name THEN
    RAISE EXCEPTION 'last_name cannot be changed directly';
  END IF;

  -- Existing safeguards
  IF COALESCE(NEW.total_points, 0) - COALESCE(OLD.total_points, 0) > 200 THEN
    RAISE EXCEPTION 'Point increase exceeds per-update limit';
  END IF;

  IF COALESCE(NEW.avatar_level, 0) - COALESCE(OLD.avatar_level, 0) > 1 THEN
    RAISE EXCEPTION 'Avatar level jump not allowed';
  END IF;

  IF OLD.calc_bonus_awarded = true AND NEW.calc_bonus_awarded = false THEN
    RAISE EXCEPTION 'calc_bonus_awarded cannot be reset by user';
  END IF;

  RETURN NEW;
END;
$function$;