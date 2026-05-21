import { useState, useEffect } from "react";
import { Mic, MicOff, Activity, Clock, Users, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LiveFeedback = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [feedback, setFeedback] = useState<Array<{ type: 'success' | 'warning' | 'info', message: string, time: string }>>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        
        // Simular feedback em tempo real
        if (duration % 10 === 0 && duration > 0) {
          const feedbackMessages = [
            { type: 'success' as const, message: 'Boa abordagem! Tom conciliador mantido.', time: formatTime(duration) },
            { type: 'warning' as const, message: 'Atenção: uma das partes parece mais resistente.', time: formatTime(duration) },
            { type: 'info' as const, message: 'Sugestão: explore mais os interesses mútuos.', time: formatTime(duration) },
          ];
          const randomFeedback = feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)];
          setFeedback(prev => [randomFeedback, ...prev.slice(0, 4)]);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRecording, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setDuration(0);
      setFeedback([]);
    }
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-law-navy">
          <Activity className="h-5 w-5" />
          Monitoramento em Tempo Real
        </CardTitle>
        <CardDescription>
          Análise ao vivo da condução da audiência
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles de Gravação */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-muted">
          <div className="flex items-center space-x-3">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? "destructive" : "default"}
              className={isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-gradient-primary hover:opacity-90"}
            >
              {isRecording ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isRecording ? "Parar" : "Iniciar"} Monitoramento
            </Button>
            {isRecording && (
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-foreground">{formatTime(duration)}</span>
              </div>
            )}
          </div>
          {isRecording && (
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              <Activity className="h-3 w-3 mr-1" />
              Ativo
            </Badge>
          )}
        </div>

        {/* Métricas da Audiência */}
        {isRecording && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-accent/5 border border-accent/20">
              <Users className="h-5 w-5 mx-auto mb-1 text-accent" />
              <p className="text-sm font-medium text-foreground">Participação</p>
              <p className="text-lg font-bold text-accent">Equilibrada</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-success/5 border border-success/20">
              <MessageSquare className="h-5 w-5 mx-auto mb-1 text-success" />
              <p className="text-sm font-medium text-foreground">Tom</p>
              <p className="text-lg font-bold text-success">Positivo</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-warning/5 border border-warning/20">
              <Clock className="h-5 w-5 mx-auto mb-1 text-warning" />
              <p className="text-sm font-medium text-foreground">Ritmo</p>
              <p className="text-lg font-bold text-warning">Adequado</p>
            </div>
          </div>
        )}

        {/* Feedback em Tempo Real */}
        {feedback.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Feedback Recente:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {feedback.map((item, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm border ${
                    item.type === 'success'
                      ? 'bg-success/5 border-success/20 text-success'
                      : item.type === 'warning'
                      ? 'bg-warning/5 border-warning/20 text-warning'
                      : 'bg-accent/5 border-accent/20 text-accent'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span>{item.message}</span>
                    <span className="text-xs opacity-75 ml-2">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isRecording && feedback.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Mic className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Clique em "Iniciar Monitoramento" para receber feedback em tempo real</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveFeedback;