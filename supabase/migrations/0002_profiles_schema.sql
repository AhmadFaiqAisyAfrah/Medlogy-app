-- Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  organization TEXT,
  role TEXT CHECK (role IN ('Public Health Analyst', 'Researcher', 'Student', 'Policy / Government', 'Clinician', 'General Observer')),
  country TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to create profile on signup (Optional safety net, but we will mostly use Server Action)
-- Standard Supabase pattern uses a trigger to ensure profile exists.
-- However, we have extra fields that come from the form.
-- We'll rely on the Server Action to insert the profile data.
-- But to be safe, we can allow the user to insert their own profile IF it matches their ID.
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);
