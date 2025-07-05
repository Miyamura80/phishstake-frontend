
-- Create definitions table for storing anti-phishing definitions
CREATE TABLE public.definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  stake_amount DECIMAL(18,6) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'deployed')),
  transaction_hash TEXT,
  definition_hash TEXT,
  wallet_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_definitions_user_id ON public.definitions(user_id);
CREATE INDEX idx_definitions_status ON public.definitions(status);

-- Enable Row Level Security
ALTER TABLE public.definitions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own definitions
CREATE POLICY "Users can manage their own definitions" 
  ON public.definitions 
  FOR ALL 
  USING (auth.uid()::text = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_definitions_updated_at 
  BEFORE UPDATE ON public.definitions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
