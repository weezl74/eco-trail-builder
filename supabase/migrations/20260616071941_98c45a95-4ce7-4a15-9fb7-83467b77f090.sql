
-- Profiles guard: prevent client-side inflation of points/avatar/calc bonus
CREATE OR REPLACE FUNCTION public.profiles_guard_protected_cols()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role (server-side) to do anything
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Only enforce when the row owner is performing the update
  IF auth.uid() IS DISTINCT FROM NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Cap point increases per single update to 200 (decreases allowed for purchases)
  IF COALESCE(NEW.total_points, 0) - COALESCE(OLD.total_points, 0) > 200 THEN
    RAISE EXCEPTION 'Point increase exceeds per-update limit';
  END IF;

  -- Avatar level can only rise by 1 at a time
  IF COALESCE(NEW.avatar_level, 0) - COALESCE(OLD.avatar_level, 0) > 1 THEN
    RAISE EXCEPTION 'Avatar level jump not allowed';
  END IF;

  -- calc_bonus_awarded can only flip false -> true once
  IF OLD.calc_bonus_awarded = true AND NEW.calc_bonus_awarded = false THEN
    RAISE EXCEPTION 'calc_bonus_awarded cannot be reset by user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_protected_cols ON public.profiles;
CREATE TRIGGER profiles_guard_protected_cols
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_guard_protected_cols();

-- Business cards guard: prevent owners from changing their own moderation status
CREATE OR REPLACE FUNCTION public.business_cards_guard_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF auth.uid() = NEW.user_id AND OLD.status IS DISTINCT FROM NEW.status THEN
    RAISE EXCEPTION 'Owners cannot change moderation status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS business_cards_guard_status ON public.business_cards;
CREATE TRIGGER business_cards_guard_status
BEFORE UPDATE ON public.business_cards
FOR EACH ROW EXECUTE FUNCTION public.business_cards_guard_status();
