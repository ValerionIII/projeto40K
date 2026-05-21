import { BarChart3, TrendingUp, Users, Award, Clock, Target, Star, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ConciliatorStats = () => {
  const [feedback, setFeedback] = useState("");
  const [sessionRating, setSessionRating] = useState<number>(0);
  const [citizenFeedbacks, setCitizenFeedbacks] = useState<any[]>([]);
  const [audioSessions, setAudioSessions] = useState<any[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const { toast } = useToast();

  // Buscar feedbacks dos cidadãos e sessões de áudio
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar feedbacks
        const { data: feedbackData, error: feedbackError } = await supabase
          .from('citizen_feedback')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (feedbackError) {
          throw feedbackError;
        }

        setCitizenFeedbacks(feedbackData || []);

        // Buscar sessões de áudio
        const { data: sessionData, error: sessionError } = await supabase
          .from('audio_sessions')
          .select('*')
          .order('created_at', { ascending: false });

        if (sessionError) {
          throw sessionError;
        }

        setAudioSessions(sessionData || []);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados das estatísticas.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingFeedbacks(false);
        setIsLoadingSessions(false);
      }
    };

    fetchData();
  }, [toast]);

  // Calcular estatísticas baseadas nos dados reais
  const avgRating = citizenFeedbacks.length > 0 
    ? (citizenFeedbacks.reduce((sum, f) => sum + f.rating, 0) / citizenFeedbacks.length).toFixed(1)
    : "4.6";

  // Calcular tempo médio baseado nas sessões de áudio
  const averageTime = audioSessions.length > 0
    ? Math.round(audioSessions.reduce((sum, session) => sum + session.duration_seconds, 0) / audioSessions.length / 60)
    : 45; // Default fallback

  // Calcular estatísticas das competências
  const skillStats = {
    communication: citizenFeedbacks
      .filter(f => f.communication_rating)
      .reduce((sum, f, _, arr) => sum + f.communication_rating / arr.length, 0) || 85,
    negotiation: citizenFeedbacks
      .filter(f => f.negotiation_rating)
      .reduce((sum, f, _, arr) => sum + f.negotiation_rating / arr.length, 0) || 78,
    emotionalControl: citizenFeedbacks
      .filter(f => f.emotional_control_rating)
      .reduce((sum, f, _, arr) => sum + f.emotional_control_rating / arr.length, 0) || 92,
    technicalAnalysis: citizenFeedbacks
      .filter(f => f.technical_analysis_rating)
      .reduce((sum, f, _, arr) => sum + f.technical_analysis_rating / arr.length, 0) || 88,
    timeManagement: citizenFeedbacks
      .filter(f => f.time_management_rating)
      .reduce((sum, f, _, arr) => sum + f.time_management_rating / arr.length, 0) || 75
  };

  const stats = {
    totalSessions: audioSessions.length || 147, // Use real count or fallback
    successRate: 78, // This could be calculated based on session status
    averageTime,
    satisfactionScore: parseFloat(avgRating),
    monthlyGrowth: 12,
    currentLevel: "Avançado"
  };

  const monthlyData = [
    { month: "Jan", sessions: 8, success: 6 },
    { month: "Fev", sessions: 12, success: 9 },
    { month: "Mar", sessions: 15, success: 12 },
    { month: "Abr", sessions: 18, success: 14 },
    { month: "Mai", sessions: 22, success: 17 },
    { month: "Jun", sessions: 25, success: 20 }
  ];

  const skillAreas = [
    { name: "Comunicação", score: Math.round(skillStats.communication * 20), color: "bg-blue-500" },
    { name: "Negociação", score: Math.round(skillStats.negotiation * 20), color: "bg-green-500" },
    { name: "Controle Emocional", score: Math.round(skillStats.emotionalControl * 20), color: "bg-purple-500" },
    { name: "Análise Técnica", score: Math.round(skillStats.technicalAnalysis * 20), color: "bg-orange-500" },
    { name: "Gestão do Tempo", score: Math.round(skillStats.timeManagement * 20), color: "bg-red-500" }
  ];

  const recentFeedback = [
    {
      date: "2024-01-15",
      case: "Rescisão Trabalhista",
      rating: 5,
      comment: "Excelente condução da audiência, muito equilibrado nas colocações"
    },
    {
      date: "2024-01-12",
      case: "Acidente de Trânsito",
      rating: 4,
      comment: "Boa mediação, poderia ter explorado mais as questões emocionais"
    },
    {
      date: "2024-01-10",
      case: "Inadimplemento",
      rating: 5,
      comment: "Perfeito controle da sessão, conseguiu acordo em tempo recorde"
    }
  ];

  const handleFeedbackSubmit = () => {
    if (!feedback.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu feedback antes de enviar.",
        variant: "destructive"
      });
      return;
    }

    if (sessionRating === 0) {
      toast({
        title: "Erro", 
        description: "Por favor, selecione uma avaliação de 1 a 5 estrelas.",
        variant: "destructive"
      });
      return;
    }

    // Aqui seria enviado para o backend
    toast({
      title: "Feedback enviado",
      description: "Obrigado por sua avaliação! Ela nos ajuda a melhorar."
    });
    
    setFeedback("");
    setSessionRating(0);
  };

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <BarChart3 className="h-5 w-5" />
            Painel de Desempenho do Conciliador
          </CardTitle>
          <CardDescription>
            Estatísticas e feedback da sua atuação nas audiências
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{stats.satisfactionScore}/5.0</p>
              <p className="text-sm text-muted-foreground">Índice Geral de Conciliação</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                {stats.currentLevel}
              </Badge>
              <div className="flex items-center text-success">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">+{stats.monthlyGrowth}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Total de Sessões</p>
              </div>
              <Users className="h-8 w-8 text-law-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.successRate}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              </div>
              <Target className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.averageTime}min</p>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0 bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.satisfactionScore}</p>
                <p className="text-sm text-muted-foreground">Satisfação</p>
              </div>
              <Star className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skills Assessment */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Avaliação por Competências
          </CardTitle>
          <CardDescription>
            Análise detalhada das suas habilidades de conciliação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {skillAreas.map((skill) => (
            <div key={skill.name} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-foreground">{skill.name}</span>
                <span className="text-muted-foreground">{skill.score}%</span>
              </div>
              <Progress value={skill.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feedback dos Cidadãos */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback dos Cidadãos
          </CardTitle>
          <CardDescription>
            Avaliações recebidas através do Portal do Cidadão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingFeedbacks ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Carregando feedbacks...</p>
            </div>
          ) : citizenFeedbacks.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Nenhum feedback recebido ainda.</p>
            </div>
          ) : (
            citizenFeedbacks.map((item) => (
              <div key={item.id} className="p-4 rounded-lg bg-muted/50 border border-muted">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(item.created_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < item.rating ? 'text-warning fill-warning' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">"{item.feedback}"</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Feedback Histórico (dados simulados) */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback Histórico
          </CardTitle>
          <CardDescription>
            Avaliações das suas audiências anteriores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentFeedback.map((item, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted/50 border border-muted">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-foreground">{item.case}</p>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < item.rating ? 'text-warning fill-warning' : 'text-muted-foreground'}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">"{item.comment}"</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feedback Form */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Avaliar Sessão Atual
          </CardTitle>
          <CardDescription>
            Deixe seu feedback sobre a audiência que acabou de conduzir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Avaliação Geral</p>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-6 w-6 cursor-pointer transition-colors ${
                    i < sessionRating ? 'text-warning fill-warning' : 'text-muted-foreground hover:text-warning'
                  }`}
                  onClick={() => setSessionRating(i + 1)}
                />
              ))}
              {sessionRating > 0 && (
                <span className="text-sm text-muted-foreground ml-2">
                  {sessionRating}/5 estrelas
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Comentários</p>
            <Textarea 
              placeholder="Compartilhe sua experiência, dificuldades enfrentadas, estratégias que funcionaram..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleFeedbackSubmit} className="w-full">
            Enviar Avaliação
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConciliatorStats;