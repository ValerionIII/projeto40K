import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mic, MicOff, Square, Play, Pause, Clock, Volume2, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EmotionalAnalysis from "./EmotionalAnalysis";
import AdvancedStats from "./AdvancedStats";

const AudioMonitor = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [sessionName, setSessionName] = useState("");
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<Float32Array>(new Float32Array(0));
  const [emotionHistory, setEmotionHistory] = useState<Array<{emotion: string; intensity: number; timestamp: number}>>([]);
  const [feedbackInterval, setFeedbackInterval] = useState<NodeJS.Timeout | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutro");
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const { toast } = useToast();

  // Format time helper
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Audio level and frequency monitoring
  useEffect(() => {
    if (isRecording && !isPaused && analyserRef.current) {
      const updateAudioAnalysis = () => {
        const bufferLength = analyserRef.current!.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const frequencyArray = new Float32Array(bufferLength);
        
        // Get audio level data
        analyserRef.current!.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(Math.round((average / 255) * 100));
        
        // Get frequency data for emotion analysis
        analyserRef.current!.getFloatFrequencyData(frequencyArray);
        setFrequencyData(new Float32Array(frequencyArray));
      };

      const analysisInterval = setInterval(updateAudioAnalysis, 100);
      return () => clearInterval(analysisInterval);
    }
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 2,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;

      // Set up advanced audio analysis
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Maior resolução para melhor análise emocional
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await saveSession();
      };

      // Create new session in database
      const newSessionName = `Sessão ${new Date().toLocaleString('pt-BR')}`;
      setSessionName(newSessionName);
      
      const { data, error } = await supabase
        .from('audio_sessions')
        .insert({
          session_name: newSessionName,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCurrentSession(data.id);
      mediaRecorder.start(1000); // Record in 1-second chunks
      setIsRecording(true);
      setDuration(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Start feedback every 10 seconds
      setFeedbackInterval(setInterval(() => {
        provideFeedbackUpdate();
      }, 10000));

      toast({
        title: "Gravação iniciada",
        description: "Monitoramento com análise emocional ativado."
      });

    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o microfone.",
        variant: "destructive"
      });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
        setIsPaused(false);
        toast({
          title: "Gravação retomada",
          description: "O monitoramento foi retomado."
        });
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsPaused(true);
        toast({
          title: "Gravação pausada",
          description: "O monitoramento foi pausado."
        });
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (feedbackInterval) {
      clearInterval(feedbackInterval);
      setFeedbackInterval(null);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
    setIsPaused(false);
    setAudioLevel(0);
    setFrequencyData(new Float32Array(0));
  };

  const saveSession = async () => {
    if (!currentSession || audioChunksRef.current.length === 0) return;

    try {
      // Convert audio to base64
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Update session with audio data, duration and emotional analysis
        const emotionalSummary = generateEmotionalSummary();
        
        const { error } = await supabase
          .from('audio_sessions')
          .update({
            duration_seconds: duration,
            audio_data: base64Audio.split(',')[1], // Remove data URL prefix
            status: 'completed',
            sentiment_analysis: emotionalSummary,
            ai_insights: `Sessão de ${formatTime(duration)} com emoção dominante: ${currentEmotion}. ${emotionalSummary.insights || ''}`
          })
          .eq('id', currentSession);

        if (error) {
          throw error;
        }

        toast({
          title: "Sessão salva",
          description: `Gravação de ${formatTime(duration)} foi salva com sucesso.`
        });
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a sessão de áudio.",
        variant: "destructive"
      });
    } finally {
      setCurrentSession(null);
      setSessionName("");
      setDuration(0);
      setEmotionHistory([]);
      setCurrentEmotion("neutro");
    }
  };

  // Generate emotional summary for session
  const generateEmotionalSummary = () => {
    const emotions = emotionHistory.map(e => e.emotion);
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "neutro";

    const avgIntensity = emotionHistory.length > 0 
      ? Math.round(emotionHistory.reduce((sum, e) => sum + e.intensity, 0) / emotionHistory.length)
      : 0;

    return {
      dominant_emotion: dominantEmotion,
      emotion_distribution: emotionCounts,
      average_intensity: avgIntensity,
      total_changes: emotionHistory.length,
      insights: `Emoção dominante: ${dominantEmotion}. Intensidade média: ${avgIntensity}%. Total de mudanças emocionais: ${emotionHistory.length}.`
    };
  };

  // Provide feedback every 10 segundos
  const provideFeedbackUpdate = () => {
    const now = Date.now();
    const windowStart = now - 10_000; // últimos 10s

    // Use eventos dos últimos 10s; se vazio, usa as últimas 5 detecções
    const windowEmotions = emotionHistory.filter(e => e.timestamp >= windowStart);
    const recentEmotions = windowEmotions.length > 0 ? windowEmotions : emotionHistory.slice(-5);

    const recentStress = recentEmotions.filter(e => e.emotion === 'tensão' || e.emotion === 'agitação').length;
    const recentCalm = recentEmotions.filter(e => e.emotion === 'calma' || e.emotion === 'confiança').length;

    const suggestions: Record<string, string> = {
      'tensão': 'Sugestão: reduza o ritmo, valide sentimentos e proponha uma pausa breve.',
      'agitação': 'Sugestão: use perguntas abertas e resuma pontos de acordo para desacelerar.',
      'calma': 'Sugestão: avance para temas objetivos e formalize consensos parciais.',
      'confiança': 'Sugestão: explore opções e teste compromissos específicos.',
      'neutro': 'Sugestão: reforce regras do diálogo e peça exemplos concretos.'
    };

    let message: string;
    let type: 'default' | 'destructive' = 'default';

    if (recentStress >= 3) {
      type = 'destructive';
      message = `⚠️ Padrão de tensão elevado nos últimos 10s. ${suggestions['tensão']}`;
    } else if (recentCalm >= 3) {
      message = `✅ Clima estável nos últimos 10s. ${suggestions['calma']}`;
    } else {
      const tip = suggestions[currentEmotion] || suggestions['neutro'];
      message = `🎧 Últimos 10s: emoção atual "${currentEmotion}". ${tip}`;
    }

    toast({
      title: 'Feedback Automático',
      description: message,
      variant: type
    });
  };

  // Handle emotion detection
  const handleEmotionDetected = (emotion: string, intensity: number, suggestion: string) => {
    setCurrentEmotion(emotion);
    
    // Add to history only if it's a significant change
    const lastEmotion = emotionHistory[emotionHistory.length - 1];
    if (!lastEmotion || lastEmotion.emotion !== emotion || Math.abs(lastEmotion.intensity - intensity) > 20) {
      setEmotionHistory(prev => [...prev, {
        emotion,
        intensity: Math.round(intensity),
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Monitoramento de Áudio Avançado
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedStats(!showAdvancedStats)}
            >
              <Brain className="h-4 w-4 mr-2" />
              {showAdvancedStats ? 'Ocultar' : 'Ver'} Estatísticas
            </Button>
          </CardTitle>
          <CardDescription>
            Monitoramento inteligente com análise emocional em tempo real
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <Button onClick={startRecording} className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Iniciar Gravação
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button onClick={pauseRecording} variant="outline" size="sm">
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button onClick={stopRecording} variant="destructive" size="sm">
                  <Square className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {isRecording && (
            <Badge variant={isPaused ? "secondary" : "default"} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
              {isPaused ? 'PAUSADO' : 'GRAVANDO'}
            </Badge>
          )}
        </div>

        {/* Session Info */}
        {isRecording && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">{formatTime(duration)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-law-blue text-white">
                  {currentEmotion}
                </Badge>
                <span className="text-sm text-muted-foreground">{sessionName}</span>
              </div>
            </div>

            {/* Audio Level Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Volume2 className="h-3 w-3" />
                  Nível de Áudio
                </span>
                <span className="text-muted-foreground">{audioLevel}%</span>
              </div>
              <Progress value={audioLevel} className="h-2" />
            </div>

            {/* Emotion History Preview */}
            {emotionHistory.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Mudanças Emocionais Recentes</p>
                <div className="flex flex-wrap gap-1">
                  {emotionHistory.slice(-6).map((entry, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {entry.emotion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Placeholder when not recording */}
        {!isRecording && (
          <div className="text-center py-8 text-muted-foreground">
            <MicOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Inicie uma gravação para monitoramento inteligente com análise emocional</p>
          </div>
        )}
      </CardContent>
    </Card>

      {/* Emotional Analysis Component */}
      {isRecording && (
        <EmotionalAnalysis
          audioLevel={audioLevel}
          frequency={frequencyData}
          isActive={isRecording && !isPaused}
          onEmotionDetected={handleEmotionDetected}
        />
      )}

      {/* Advanced Statistics */}
      {showAdvancedStats && (
        <AdvancedStats
          currentSessionDuration={duration}
          isRecording={isRecording}
          emotionHistory={emotionHistory}
        />
      )}
    </div>
  );
};

export default AudioMonitor;