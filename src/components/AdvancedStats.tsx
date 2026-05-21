import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, TrendingUp, Target, Zap, Activity, BarChart3, Users, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  avgDuration: number;
  totalTime: number;
  successRate: number;
  longestSession: number;
  shortestSession: number;
  todaySessions: number;
  weekSessions: number;
}

interface EmotionalMetrics {
  dominantEmotion: string;
  emotionalStability: number;
  stressEpisodes: number;
  calmPeriods: number;
  confidenceMoments: number;
}

interface AdvancedStatsProps {
  currentSessionDuration: number;
  isRecording: boolean;
  emotionHistory: Array<{emotion: string; intensity: number; timestamp: number}>;
}

const AdvancedStats = ({ currentSessionDuration, isRecording, emotionHistory }: AdvancedStatsProps) => {
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSessions: 0,
    completedSessions: 0,
    avgDuration: 0,
    totalTime: 0,
    successRate: 0,
    longestSession: 0,
    shortestSession: 0,
    todaySessions: 0,
    weekSessions: 0
  });

  const [emotionalMetrics, setEmotionalMetrics] = useState<EmotionalMetrics>({
    dominantEmotion: "neutro",
    emotionalStability: 0,
    stressEpisodes: 0,
    calmPeriods: 0,
    confidenceMoments: 0
  });

  const [isLoading, setIsLoading] = useState(true);

  // Buscar estatísticas das sessões
  useEffect(() => {
    const fetchSessionStats = async () => {
      try {
        const { data: sessions, error } = await supabase
          .from('audio_sessions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (sessions) {
          const completed = sessions.filter(s => s.status === 'completed');
          const durations = completed.map(s => s.duration_seconds).filter(d => d > 0);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          const todaySessions = sessions.filter(s => 
            new Date(s.created_at) >= today
          ).length;
          
          const weekSessions = sessions.filter(s => 
            new Date(s.created_at) >= weekAgo
          ).length;

          setSessionStats({
            totalSessions: sessions.length,
            completedSessions: completed.length,
            avgDuration: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
            totalTime: durations.reduce((a, b) => a + b, 0),
            successRate: sessions.length > 0 ? Math.round((completed.length / sessions.length) * 100) : 0,
            longestSession: durations.length > 0 ? Math.max(...durations) : 0,
            shortestSession: durations.length > 0 ? Math.min(...durations) : 0,
            todaySessions,
            weekSessions
          });
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionStats();
  }, []);

  // Calcular métricas emocionais
  useEffect(() => {
    if (emotionHistory.length === 0) return;

    const emotions = emotionHistory.map(e => e.emotion);
    const intensities = emotionHistory.map(e => e.intensity);
    
    // Emoção dominante
    const emotionCounts = emotions.reduce((acc, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || "neutro";

    // Estabilidade emocional (baseada na variação das intensidades)
    const avgIntensity = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const variance = intensities.reduce((acc, intensity) => 
      acc + Math.pow(intensity - avgIntensity, 2), 0) / intensities.length;
    const stability = Math.max(0, 100 - Math.sqrt(variance));

    // Contar episódios específicos
    const stressEpisodes = emotions.filter(e => e === 'tensão' || e === 'agitação').length;
    const calmPeriods = emotions.filter(e => e === 'calma').length;
    const confidenceMoments = emotions.filter(e => e === 'confiança').length;

    setEmotionalMetrics({
      dominantEmotion,
      emotionalStability: Math.round(stability),
      stressEpisodes,
      calmPeriods,
      confidenceMoments
    });
  }, [emotionHistory]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatMinutes = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calcular tendência da semana
  const weeklyTrend = sessionStats.weekSessions > 0 ? 
    Math.round(((sessionStats.weekSessions - (sessionStats.totalSessions - sessionStats.weekSessions)) / Math.max(sessionStats.totalSessions - sessionStats.weekSessions, 1)) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas de Tempo e Sessões */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estatísticas de Sessões
          </CardTitle>
          <CardDescription>
            Análise detalhada do tempo e quantidade de sessões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total de Sessões */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-law-blue" />
                <span className="text-sm font-medium">Total</span>
              </div>
              <p className="text-2xl font-bold">{sessionStats.totalSessions}</p>
              <p className="text-xs text-muted-foreground">sessões iniciadas</p>
            </div>

            {/* Sessões Concluídas */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">Concluídas</span>
              </div>
              <p className="text-2xl font-bold text-success">{sessionStats.completedSessions}</p>
              <p className="text-xs text-muted-foreground">{sessionStats.successRate}% taxa</p>
            </div>

            {/* Tempo Médio */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium">Tempo Médio</span>
              </div>
              <p className="text-2xl font-bold">{formatMinutes(sessionStats.avgDuration)}</p>
              <p className="text-xs text-muted-foreground">por sessão</p>
            </div>

            {/* Sessões Hoje */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Hoje</span>
              </div>
              <p className="text-2xl font-bold text-accent">{sessionStats.todaySessions}</p>
              <p className="text-xs text-muted-foreground">sessões</p>
            </div>
          </div>

          {/* Progresso Semanal */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Meta Semanal (10 sessões)</span>
              <span className="text-sm text-muted-foreground">{sessionStats.weekSessions}/10</span>
            </div>
            <Progress value={(sessionStats.weekSessions / 10) * 100} className="h-2" />
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className={`h-4 w-4 ${weeklyTrend >= 0 ? 'text-success' : 'text-destructive'}`} />
              <span className={weeklyTrend >= 0 ? 'text-success' : 'text-destructive'}>
                {weeklyTrend >= 0 ? '+' : ''}{weeklyTrend}% vs semana anterior
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Emocionais */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Métricas Emocionais
          </CardTitle>
          <CardDescription>
            Análise do estado emocional durante as sessões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Emoção Dominante */}
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Emoção Dominante</p>
                <Badge className="mt-1 bg-law-blue text-white">
                  {emotionalMetrics.dominantEmotion}
                </Badge>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Estabilidade Emocional</span>
                  <span>{emotionalMetrics.emotionalStability}%</span>
                </div>
                <Progress value={emotionalMetrics.emotionalStability} className="h-2" />
              </div>
            </div>

            {/* Contadores Emocionais */}
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Momentos de Estresse</span>
                  <Badge variant="outline" className="text-red-600 border-red-200">
                    {emotionalMetrics.stressEpisodes}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Períodos de Calma</span>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    {emotionalMetrics.calmPeriods}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Momentos de Confiança</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    {emotionalMetrics.confidenceMoments}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessão Atual */}
      {isRecording && (
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Sessão Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Duração Atual</p>
                <p className="text-2xl font-bold text-accent">{formatMinutes(currentSessionDuration)}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="bg-success text-white">
                  Em Andamento
                </Badge>
              </div>
            </div>

            {currentSessionDuration > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso vs Tempo Médio</span>
                  <span>{Math.round((currentSessionDuration / sessionStats.avgDuration) * 100)}%</span>
                </div>
                <Progress 
                  value={Math.min((currentSessionDuration / sessionStats.avgDuration) * 100, 100)} 
                  className="h-2" 
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Records */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Records de Tempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Sessão Mais Longa</p>
              <p className="text-lg font-bold">{formatTime(sessionStats.longestSession)}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Sessão Mais Rápida</p>
              <p className="text-lg font-bold">{formatTime(sessionStats.shortestSession)}</p>
            </div>
            
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Tempo Total Gravado</p>
              <p className="text-xl font-bold text-law-blue">{formatTime(sessionStats.totalTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedStats;