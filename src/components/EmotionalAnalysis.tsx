import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Heart, Zap, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";

interface EmotionalAnalysisProps {
  audioLevel: number;
  frequency: Float32Array;
  isActive: boolean;
  onEmotionDetected: (emotion: string, intensity: number, suggestion: string) => void;
}

interface EmotionState {
  primary: string;
  intensity: number;
  confidence: number;
  suggestion: string;
  color: string;
}

const EmotionalAnalysis = ({ audioLevel, frequency, isActive, onEmotionDetected }: EmotionalAnalysisProps) => {
  const [currentEmotion, setCurrentEmotion] = useState<EmotionState>({
    primary: "neutro",
    intensity: 0,
    confidence: 0,
    suggestion: "",
    color: "bg-muted"
  });
  
  const [emotionHistory, setEmotionHistory] = useState<{ emotion: string; timestamp: number; intensity: number }[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Análise das ondas sonoras para detectar emoção
  const analyzeEmotion = (audioLevel: number, frequencies: Float32Array) => {
    if (!isActive || !frequencies || frequencies.length === 0) return;

    // Análise baseada em diferentes faixas de frequência
    const lowFreq = frequencies.slice(0, frequencies.length * 0.3);
    const midFreq = frequencies.slice(frequencies.length * 0.3, frequencies.length * 0.7);
    const highFreq = frequencies.slice(frequencies.length * 0.7);

    const lowAvg = lowFreq.reduce((sum, val) => sum + val, 0) / lowFreq.length;
    const midAvg = midFreq.reduce((sum, val) => sum + val, 0) / midFreq.length;
    const highAvg = highFreq.reduce((sum, val) => sum + val, 0) / highFreq.length;

    // Detecção de padrões emocionais
    let emotion = "neutro";
    let intensity = 0;
    let confidence = 0;
    let suggestion = "";
    let color = "bg-muted";

    // Tensão/Estresse (frequências altas + volume alto)
    if (highAvg > 150 && audioLevel > 70) {
      emotion = "tensão";
      intensity = Math.min(((highAvg - 150) / 100) * 100, 100);
      confidence = Math.min(((audioLevel - 70) / 30) * 100, 100);
      suggestion = "Detectada tensão na voz. Sugere-se uma pausa ou técnica de respiração.";
      color = "bg-red-500";
    }
    // Calma/Controle (frequências equilibradas + volume moderado)
    else if (lowAvg > 100 && midAvg > 80 && highAvg < 120 && audioLevel < 60) {
      emotion = "calma";
      intensity = Math.min((lowAvg / 150) * 100, 100);
      confidence = 85;
      suggestion = "Tom equilibrado detectado. Continue com essa abordagem.";
      color = "bg-green-500";
    }
    // Agitação (variação alta nas frequências)
    else if (Math.abs(highAvg - lowAvg) > 100 && audioLevel > 60) {
      emotion = "agitação";
      intensity = Math.min((Math.abs(highAvg - lowAvg) / 150) * 100, 100);
      confidence = Math.min(((audioLevel - 60) / 40) * 100, 100);
      suggestion = "Agitação detectada. Tente diminuir o ritmo da fala.";
      color = "bg-orange-500";
    }
    // Confiança (frequências médias dominantes)
    else if (midAvg > lowAvg && midAvg > highAvg && audioLevel >= 40 && audioLevel <= 70) {
      emotion = "confiança";
      intensity = Math.min((midAvg / 120) * 100, 100);
      confidence = 90;
      suggestion = "Tom confiante detectado. Excelente controle da situação.";
      color = "bg-blue-500";
    }
    // Baixa energia
    else if (audioLevel < 30 && lowAvg < 80) {
      emotion = "baixa energia";
      intensity = Math.max(100 - (audioLevel + lowAvg) / 2, 0);
      confidence = 70;
      suggestion = "Energia baixa detectada. Considere elevar ligeiramente o tom.";
      color = "bg-yellow-500";
    }

    const newEmotionState: EmotionState = {
      primary: emotion,
      intensity: Math.round(intensity),
      confidence: Math.round(confidence),
      suggestion,
      color
    };

    setCurrentEmotion(newEmotionState);
    onEmotionDetected(emotion, intensity, suggestion);

    // Adicionar ao histórico
    setEmotionHistory(prev => {
      const newHistory = [...prev, { 
        emotion, 
        timestamp: Date.now(), 
        intensity: Math.round(intensity) 
      }];
      return newHistory.slice(-20); // Manter apenas os últimos 20 registros
    });

    // Gerar recomendações baseadas no padrão
    generateRecommendations(emotion, intensity);
  };

  const generateRecommendations = (emotion: string, intensity: number) => {
    const newRecommendations: string[] = [];

    switch (emotion) {
      case "tensão":
        if (intensity > 80) {
          newRecommendations.push("Faça uma pausa de 30 segundos");
          newRecommendations.push("Pratique respiração profunda");
          newRecommendations.push("Diminua o ritmo da fala");
        }
        break;
      case "agitação":
        newRecommendations.push("Mantenha um tom mais uniforme");
        newRecommendations.push("Foque na clareza das palavras");
        break;
      case "baixa energia":
        newRecommendations.push("Eleve ligeiramente o tom de voz");
        newRecommendations.push("Demonstre mais engajamento");
        break;
      case "calma":
      case "confiança":
        newRecommendations.push("Continue com essa abordagem");
        newRecommendations.push("Excelente controle emocional");
        break;
    }

    setRecommendations(newRecommendations);
  };

  // Análise automática a cada 2 segundos
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      analyzeEmotion(audioLevel, frequency);
    }, 2000);

    return () => clearInterval(interval);
  }, [audioLevel, frequency, isActive]);

  // Estatísticas do histórico emocional
  const emotionStats = emotionHistory.reduce((acc, curr) => {
    acc[curr.emotion] = (acc[curr.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantEmotion = Object.entries(emotionStats)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "neutro";

  return (
    <Card className="shadow-card border-0 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Análise Emocional em Tempo Real
        </CardTitle>
        <CardDescription>
          Monitoramento das ondas sonoras para análise comportamental
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado Emocional Atual */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="font-medium">Estado Atual</span>
            </div>
            <Badge className={`${currentEmotion.color} text-white`}>
              {currentEmotion.primary}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{currentEmotion.intensity}%</p>
            <p className="text-sm text-muted-foreground">
              Confiança: {currentEmotion.confidence}%
            </p>
          </div>
        </div>

        {/* Medidores de Intensidade */}
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Intensidade Emocional</span>
              <span>{currentEmotion.intensity}%</span>
            </div>
            <Progress value={currentEmotion.intensity} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confiança da Análise</span>
              <span>{currentEmotion.confidence}%</span>
            </div>
            <Progress value={currentEmotion.confidence} className="h-2" />
          </div>
        </div>

        {/* Sugestão Atual */}
        {currentEmotion.suggestion && (
          <div className="p-3 rounded-lg bg-law-blue/10 border border-law-blue/20">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-law-blue mt-0.5" />
              <div>
                <p className="text-sm font-medium">Sugestão em Tempo Real</p>
                <p className="text-sm text-muted-foreground">{currentEmotion.suggestion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recomendações Ativas */}
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recomendações Ativas</p>
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        )}

        {/* Emoção Dominante da Sessão */}
        {emotionHistory.length > 5 && (
          <div className="p-3 rounded-lg bg-muted/20 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Emoção Dominante</p>
                <p className="text-lg font-bold text-accent">{dominantEmotion}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
          </div>
        )}

        {/* Histórico Resumido */}
        {emotionHistory.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Últimas Detecções</p>
            <div className="flex flex-wrap gap-1">
              {emotionHistory.slice(-8).map((entry, index) => {
                const emotionColors = {
                  "tensão": "bg-red-100 text-red-800",
                  "calma": "bg-green-100 text-green-800",
                  "agitação": "bg-orange-100 text-orange-800",
                  "confiança": "bg-blue-100 text-blue-800",
                  "baixa energia": "bg-yellow-100 text-yellow-800",
                  "neutro": "bg-gray-100 text-gray-800"
                };
                
                return (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`text-xs ${emotionColors[entry.emotion as keyof typeof emotionColors] || emotionColors.neutro}`}
                  >
                    {entry.emotion}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionalAnalysis;