-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode TEXT NOT NULL,
  description TEXT NOT NULL,
  subgroup TEXT NOT NULL,
  retail_price NUMERIC(10,2) NOT NULL,
  wholesale_price NUMERIC(10,2),
  company_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to quotations" 
ON public.quotations 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to quotations" 
ON public.quotations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to quotations" 
ON public.quotations 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to quotations" 
ON public.quotations 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better search performance
CREATE INDEX idx_quotations_subgroup ON public.quotations(subgroup);
CREATE INDEX idx_quotations_barcode ON public.quotations(barcode);
CREATE INDEX idx_quotations_created_at ON public.quotations(created_at);