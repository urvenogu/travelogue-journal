-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Auto-grant admin to the FIRST user that signs up (since this is a single-admin blog)
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Replace permissive policies with admin-only
DROP POLICY "Authenticated users can insert days" ON public.days;
DROP POLICY "Authenticated users can update days" ON public.days;
DROP POLICY "Authenticated users can delete days" ON public.days;

CREATE POLICY "Admins can insert days" ON public.days
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update days" ON public.days
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete days" ON public.days
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY "Authenticated users can insert entries" ON public.entries;
DROP POLICY "Authenticated users can update entries" ON public.entries;
DROP POLICY "Authenticated users can delete entries" ON public.entries;

CREATE POLICY "Admins can insert entries" ON public.entries
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update entries" ON public.entries
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete entries" ON public.entries
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY "Authenticated users can upload entry images" ON storage.objects;
DROP POLICY "Authenticated users can update entry images" ON storage.objects;
DROP POLICY "Authenticated users can delete entry images" ON storage.objects;

CREATE POLICY "Admins can upload entry images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'entry-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update entry images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'entry-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete entry images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'entry-images' AND public.has_role(auth.uid(), 'admin'));