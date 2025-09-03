-- Create table for product mix configurations
CREATE TABLE public.product_mix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subgroup TEXT NOT NULL,
  class TEXT NOT NULL CHECK (class IN ('A', 'B', 'C')),
  product_description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_mix ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no authentication is implemented)
CREATE POLICY "Allow public read access to product_mix" 
ON public.product_mix 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to product_mix" 
ON public.product_mix 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to product_mix" 
ON public.product_mix 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to product_mix" 
ON public.product_mix 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_mix_updated_at
BEFORE UPDATE ON public.product_mix
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_product_mix_subgroup ON public.product_mix(subgroup);
CREATE INDEX idx_product_mix_class ON public.product_mix(class);