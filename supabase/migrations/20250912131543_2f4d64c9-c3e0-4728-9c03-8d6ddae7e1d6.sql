-- Add optional evaluation fields to citizen_feedback table
ALTER TABLE public.citizen_feedback 
ADD COLUMN communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
ADD COLUMN negotiation_rating INTEGER CHECK (negotiation_rating >= 1 AND negotiation_rating <= 5),
ADD COLUMN emotional_control_rating INTEGER CHECK (emotional_control_rating >= 1 AND emotional_control_rating <= 5),
ADD COLUMN technical_analysis_rating INTEGER CHECK (technical_analysis_rating >= 1 AND technical_analysis_rating <= 5),
ADD COLUMN time_management_rating INTEGER CHECK (time_management_rating >= 1 AND time_management_rating <= 5);

-- Create table for audio sessions
CREATE TABLE public.audio_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  audio_data TEXT, -- Base64 encoded audio data
  transcription TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for audio_sessions
ALTER TABLE public.audio_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for audio_sessions
CREATE POLICY "Anyone can create audio sessions" 
ON public.audio_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view audio sessions" 
ON public.audio_sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update audio sessions" 
ON public.audio_sessions 
FOR UPDATE 
USING (true);

-- Create trigger for audio_sessions timestamps
CREATE TRIGGER update_audio_sessions_updated_at
BEFORE UPDATE ON public.audio_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_audio_sessions_created_at ON public.audio_sessions(created_at DESC);
CREATE INDEX idx_audio_sessions_status ON public.audio_sessions(status);
CREATE INDEX idx_citizen_feedback_ratings ON public.citizen_feedback(communication_rating, negotiation_rating, emotional_control_rating, technical_analysis_rating, time_management_rating);