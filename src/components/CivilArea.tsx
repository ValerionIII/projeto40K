import { useState } from "react";
import { Star, Send, Video, MessageCircle, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CivilArea = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Optional evaluation fields
  const [communicationRating, setCommunicationRating] = useState<number>(0);
  const [negotiationRating, setNegotiationRating] = useState<number>(0);
  const [emotionalControlRating, setEmotionalControlRating] = useState<number>(0);
  const [technicalAnalysisRating, setTechnicalAnalysisRating] = useState<number>(0);
  const [timeManagementRating, setTimeManagementRating] = useState<number>(0);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  
  const { toast } = useToast();

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !feedback || rating === 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos e dê uma avaliação.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const insertData: any = {
        name: name.trim(),
        email: email.trim(),
        rating,
        feedback: feedback.trim()
      };

      // Add optional ratings if they were provided
      if (communicationRating > 0) insertData.communication_rating = communicationRating;
      if (negotiationRating > 0) insertData.negotiation_rating = negotiationRating;
      if (emotionalControlRating > 0) insertData.emotional_control_rating = emotionalControlRating;
      if (technicalAnalysisRating > 0) insertData.technical_analysis_rating = technicalAnalysisRating;
      if (timeManagementRating > 0) insertData.time_management_rating = timeManagementRating;

      const { error } = await supabase
        .from('citizen_feedback')
        .insert([insertData]);

      if (error) {
        throw error;
      }

      toast({
        title: "Feedback enviado!",
        description: "Obrigado por sua avaliação. Ela nos ajuda a melhorar nossos serviços.",
      });

      // Limpar formulário
      setRating(0);
      setFeedback("");
      setName("");
      setEmail("");
      setCommunicationRating(0);
      setNegotiationRating(0);
      setEmotionalControlRating(0);
      setTechnicalAnalysisRating(0);
      setTimeManagementRating(0);
      setShowOptionalFields(false);
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        title: "Erro ao enviar feedback",
        description: "Houve um problema ao salvar sua avaliação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header específico para civis */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" className="text-law-blue hover:text-law-navy">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Área do Conciliador
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-law-navy">Portal do Cidadão</h1>
                <p className="text-sm text-law-gray">Área para acompanhamento e feedback</p>
              </div>
            </div>
            
            <div className="w-[140px]"></div> {/* Espaçamento para centralizar o título */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Seção de boas-vindas */}
          <Card className="card-elegant">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="h-6 w-6 text-law-blue" />
                <h2 className="text-2xl font-bold text-law-navy">Bem-vindo ao Portal do Cidadão</h2>
              </div>
              <CardDescription className="text-base">
                Este é o seu espaço para acompanhar o processo de conciliação e fornecer feedback sobre o atendimento recebido.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Seção do vídeo explicativo */}
          <Card className="card-elegant">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Video className="h-6 w-6 text-law-blue" />
                <h3 className="text-xl font-semibold text-law-navy">Como Funciona a Conciliação</h3>
              </div>
              <CardDescription>
                Assista ao vídeo explicativo sobre o processo de conciliação e seus direitos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg font-medium">
                    Área reservada para o vídeo explicativo
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    O vídeo será carregado pelo administrador
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de feedback */}
          <Card className="card-elegant">
            <CardHeader>
              <div className="flex items-center space-x-2 mb-2">
                <Star className="h-6 w-6 text-law-gold" />
                <h3 className="text-xl font-semibold text-law-navy">Avalie o Atendimento</h3>
              </div>
              <CardDescription>
                Sua opinião é muito importante para melhorarmos nossos serviços. Por favor, avalie o conciliador e o processo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Avaliação geral do atendimento *</Label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="focus:outline-none transition-colors"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hoverRating || rating)
                              ? "fill-law-gold text-law-gold"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-sm text-muted-foreground">
                      {rating > 0 && (
                        <>
                          {rating} de 5 estrela{rating !== 1 ? 's' : ''}
                          {rating === 1 && ' - Muito insatisfeito'}
                          {rating === 2 && ' - Insatisfeito'}
                          {rating === 3 && ' - Neutro'}
                          {rating === 4 && ' - Satisfeito'}
                          {rating === 5 && ' - Muito satisfeito'}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Comentários e sugestões *</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Conte-nos sobre sua experiência, o que funcionou bem e o que poderia ser melhorado..."
                    className="min-h-[120px] resize-none"
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {feedback.length}/1000 caracteres
                  </p>
                </div>

                {/* Optional Detailed Evaluation */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Avaliação Detalhada (Opcional)</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOptionalFields(!showOptionalFields)}
                    >
                      {showOptionalFields ? "Ocultar" : "Mostrar"} detalhes
                    </Button>
                  </div>

                  {showOptionalFields && (
                    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                      {[
                        { label: "Comunicação", value: communicationRating, setter: setCommunicationRating },
                        { label: "Negociação", value: negotiationRating, setter: setNegotiationRating },
                        { label: "Controle Emocional", value: emotionalControlRating, setter: setEmotionalControlRating },
                        { label: "Análise Técnica", value: technicalAnalysisRating, setter: setTechnicalAnalysisRating },
                        { label: "Gestão de Tempo", value: timeManagementRating, setter: setTimeManagementRating }
                      ].map((field) => (
                        <div key={field.label} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-foreground">{field.label}</span>
                            <span className="text-muted-foreground">
                              {field.value > 0 ? `${field.value}/5` : "Não avaliado"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-5 w-5 cursor-pointer transition-colors ${
                                  i < field.value ? 'text-law-gold fill-law-gold' : 'text-muted-foreground hover:text-law-gold'
                                }`}
                                onClick={() => field.setter(i + 1)}
                              />
                            ))}
                            {field.value > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => field.setter(0)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                Limpar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full md:w-auto button-primary"
                  size="lg"
                  disabled={isSubmitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informações importantes */}
          <Card className="border-law-blue/20 bg-gradient-to-r from-law-blue/5 to-transparent">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-law-navy flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-law-blue" />
                  Informações Importantes
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-law-blue rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    Seu feedback é confidencial e será usado apenas para melhorar nossos serviços.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-law-blue rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    A avaliação não influenciará o resultado do seu processo de conciliação.
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-law-blue rounded-full mr-3 mt-2 flex-shrink-0"></span>
                    Em caso de dúvidas, entre em contato com nossa equipe de suporte.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CivilArea;