-- Create user types enum
CREATE TYPE public.user_type AS ENUM ('farmer', 'kitchen');

-- Create surplus status enum  
CREATE TYPE public.surplus_status AS ENUM ('available', 'claimed', 'collected', 'expired');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  whatsapp_opted_in BOOLEAN DEFAULT FALSE,
  user_type public.user_type NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create kitchen details table
CREATE TABLE public.kitchen_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  kitchen_name TEXT NOT NULL,
  capacity_people INTEGER NOT NULL DEFAULT 50,
  storage_capacity TEXT, -- refrigeration, dry storage capabilities
  dietary_restrictions TEXT[], -- vegetarian, halal, etc.
  operating_hours TEXT,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create surplus listings table
CREATE TABLE public.surplus_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  expiry_date DATE NOT NULL,
  price DECIMAL DEFAULT 0,
  description TEXT,
  nutritional_info JSONB, -- protein, fiber, vitamins, etc.
  status public.surplus_status NOT NULL DEFAULT 'available',
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table for AI recommendations
CREATE TABLE public.surplus_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surplus_id UUID NOT NULL REFERENCES public.surplus_listings(id) ON DELETE CASCADE,
  kitchen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score DECIMAL NOT NULL DEFAULT 0, -- AI calculated score 0-1
  distance_km DECIMAL,
  nutritional_fit_score DECIMAL,
  capacity_fit_score DECIMAL,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  pickup_scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create impact tracking table
CREATE TABLE public.impact_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surplus_id UUID NOT NULL REFERENCES public.surplus_listings(id) ON DELETE CASCADE,
  kitchen_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kg_rescued DECIMAL NOT NULL,
  estimated_meals INTEGER NOT NULL,
  co2_saved_kg DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surplus_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surplus_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for kitchen details
CREATE POLICY "Kitchens can manage their details" 
ON public.kitchen_details 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view kitchen details for matching" 
ON public.kitchen_details 
FOR SELECT 
USING (true);

-- Create RLS policies for surplus listings
CREATE POLICY "Farmers can manage their surplus" 
ON public.surplus_listings 
FOR ALL 
USING (auth.uid() = farmer_id);

CREATE POLICY "Everyone can view available surplus" 
ON public.surplus_listings 
FOR SELECT 
USING (status = 'available' OR auth.uid() = farmer_id);

-- Create RLS policies for matches
CREATE POLICY "Farmers can see matches for their surplus" 
ON public.surplus_matches 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.surplus_listings 
  WHERE id = surplus_id AND farmer_id = auth.uid()
));

CREATE POLICY "Kitchens can see their matches" 
ON public.surplus_matches 
FOR SELECT 
USING (auth.uid() = kitchen_id);

CREATE POLICY "Kitchens can claim matches" 
ON public.surplus_matches 
FOR UPDATE 
USING (auth.uid() = kitchen_id);

-- Create RLS policies for impact reports
CREATE POLICY "Users can view impact reports they're involved in" 
ON public.impact_reports 
FOR SELECT 
USING (
  auth.uid() IN (
    SELECT farmer_id FROM public.surplus_listings WHERE id = surplus_id
  ) OR auth.uid() = kitchen_id
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kitchen_details_updated_at
  BEFORE UPDATE ON public.kitchen_details
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surplus_listings_updated_at
  BEFORE UPDATE ON public.surplus_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();