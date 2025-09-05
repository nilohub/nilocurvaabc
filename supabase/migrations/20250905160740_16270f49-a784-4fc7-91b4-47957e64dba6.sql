-- Add buyer field to quotations table
ALTER TABLE public.quotations 
ADD COLUMN buyer_name TEXT NOT NULL DEFAULT 'Sistema';