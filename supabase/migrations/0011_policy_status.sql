-- Create policy_status table
-- Stores the standardized Operational Status derived from observation.

CREATE TABLE policy_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outbreak_id UUID REFERENCES outbreaks(id) NOT NULL UNIQUE,
  
  -- Core Status Fields
  monitoring_level TEXT NOT NULL CHECK (monitoring_level IN ('routine', 'enhanced', 'active_response')),
  advisory_code TEXT NOT NULL CHECK (advisory_code IN ('green', 'yellow', 'orange', 'red')),
  
  -- Context
  generated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  reasoning TEXT NOT NULL, -- "Why this status was triggered"
  
  -- SOP Context (Not prescriptive instructions)
  recommended_actions JSONB DEFAULT '[]'::jsonb -- Array of reference action strings
);

-- Enable RLS
ALTER TABLE policy_status ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT SELECT ON policy_status TO authenticated;
GRANT SELECT ON policy_status TO service_role;
GRANT ALL ON policy_status TO service_role; -- Allow pipeline to write
