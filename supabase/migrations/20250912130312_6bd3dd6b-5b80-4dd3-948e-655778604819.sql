-- Create table for citizen feedback
CREATE TABLE public.citizen_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.citizen_feedback ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert feedback (public form)
CREATE POLICY "Anyone can submit feedback" 
ON public.citizen_feedback 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow reading all feedback (for conciliator stats)
CREATE POLICY "Anyone can view feedback" 
ON public.citizen_feedback 
FOR SELECT 
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
CREATE TRIGGER update_citizen_feedback_updated_at
BEFORE UPDATE ON public.citizen_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on created_at
CREATE INDEX idx_citizen_feedback_created_at ON public.citizen_feedback(created_at DESC);