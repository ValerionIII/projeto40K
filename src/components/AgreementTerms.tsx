import { FileCheck, Users, Scale, Download, Copy, Save, RotateCcw, Edit3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const AgreementTerms = () => {
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<{[key: number]: string}>({});
  const [isEditing, setIsEditing] = useState<{[key: number]: boolean}>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<{[key: number]: boolean}>({});
  const { toast } = useToast();

  const agreementOptions = [
    {
      id: 1,
      title: "Acordo Favorável ao Autor",
      type: "author",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      terms: [
        "Pagamento integral de R$ 45.000,00 em 30 dias",
        "Juros e correção monetária desde o vencimento",
        "Honorários advocatícios de 20% sobre o valor",
        "Multa de 2% sobre o valor principal",
        "Reconhecimento da rescisão por culpa do réu"
      ],
      fullText: `TERMO DE ACORDO

Pelo presente instrumento, as partes acordam em:

1. PAGAMENTO: O réu pagará ao autor a quantia de R$ 45.000,00 (quarenta e cinco mil reais), acrescida de juros de mora de 1% ao mês e correção monetária pelo IPCA desde o vencimento.

2. HONORÁRIOS: Pagamento de honorários advocatícios no valor de 20% sobre o montante devido.

3. MULTA: Incidência de multa contratual de 2% sobre o valor principal.

4. PRAZO: Pagamento em parcela única no prazo de 30 (trinta) dias contados da homologação deste acordo.

5. RESCISÃO: Fica reconhecida a rescisão contratual por culpa exclusiva do réu.

6. QUITAÇÃO: Com o pagamento, haverá quitação total e geral entre as partes.`
    },
    {
      id: 2,
      title: "Acordo Equilibrado",
      type: "balanced",
      icon: Scale,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      terms: [
        "Pagamento de R$ 30.000,00 em 6 parcelas mensais",
        "Desconto de 33% do valor original",
        "Sem incidência de juros adicionais",
        "Honorários reduzidos para 10%",
        "Rescisão sem culpa de ambas as partes"
      ],
      fullText: `TERMO DE ACORDO

Pelo presente instrumento, as partes acordam em:

1. PAGAMENTO: O réu pagará ao autor a quantia de R$ 30.000,00 (trinta mil reais), em 6 (seis) parcelas mensais e consecutivas de R$ 5.000,00 cada.

2. DESCONTO: Concedido desconto de 33% sobre o valor original da causa.

3. HONORÁRIOS: Honorários advocatícios reduzidos para 10% sobre o valor do acordo.

4. VENCIMENTO: Primeira parcela vence em 30 dias da homologação, demais no mesmo dia dos meses subsequentes.

5. RESCISÃO: Rescisão contratual sem atribuição de culpa a qualquer das partes.

6. INADIMPLEMENTO: Em caso de atraso superior a 15 dias, vencimento antecipado de todas as parcelas.

7. QUITAÇÃO: Com o pagamento integral, haverá quitação total e geral entre as partes.`
    },
    {
      id: 3,
      title: "Acordo Favorável ao Réu",
      type: "defendant",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      terms: [
        "Pagamento de R$ 20.000,00 em 12 parcelas",
        "Desconto de 55% do valor original",
        "Sem juros e correção monetária",
        "Sem honorários advocatícios",
        "Reconhecimento de falhas na prestação do serviço"
      ],
      fullText: `TERMO DE ACORDO

Pelo presente instrumento, as partes acordam em:

1. PAGAMENTO: O réu pagará ao autor a quantia de R$ 20.000,00 (vinte mil reais), em 12 (doze) parcelas mensais e consecutivas de R$ 1.666,67 cada.

2. DESCONTO: Concedido desconto de 55% sobre o valor original da causa.

3. RECONHECIMENTO: O autor reconhece falhas na prestação do serviço que justificam o desconto concedido.

4. VENCIMENTO: Primeira parcela vence em 30 dias da homologação, demais no mesmo dia dos meses subsequentes.

5. CARÊNCIA: Concedidos 2 meses de carência para início dos pagamentos.

6. RESCISÃO: Rescisão contratual por culpa concorrente de ambas as partes.

7. QUITAÇÃO: Com o pagamento integral, haverá quitação total e geral entre as partes.`
    }
  ];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Texto copiado",
      description: "O termo de acordo foi copiado para a área de transferência."
    });
  };

  const handleDownload = (title: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download iniciado",
      description: "O termo de acordo está sendo baixado."
    });
  };

  // Load saved content from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('agreement-terms-edited');
    if (saved) {
      try {
        setEditedContent(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved content:', error);
      }
    }
  }, []);

  // Auto-save functionality
  const autoSave = useCallback((termId: number, content: string) => {
    const updatedContent = { ...editedContent, [termId]: content };
    setEditedContent(updatedContent);
    localStorage.setItem('agreement-terms-edited', JSON.stringify(updatedContent));
    
    // Mark as saved after a short delay
    setTimeout(() => {
      setHasUnsavedChanges(prev => ({ ...prev, [termId]: false }));
    }, 1000);
  }, [editedContent]);

  const handleContentChange = (termId: number, content: string) => {
    setEditedContent(prev => ({ ...prev, [termId]: content }));
    setHasUnsavedChanges(prev => ({ ...prev, [termId]: true }));
    
    // Auto-save after 2 seconds of no typing
    setTimeout(() => autoSave(termId, content), 2000);
  };

  const handleManualSave = (termId: number) => {
    const content = editedContent[termId];
    if (content) {
      autoSave(termId, content);
      toast({
        title: "Termo salvo",
        description: "As alterações foram salvas automaticamente."
      });
    }
  };

  const handleResetTerm = (termId: number) => {
    const original = agreementOptions.find(opt => opt.id === termId);
    if (original) {
      setEditedContent(prev => ({ ...prev, [termId]: original.fullText }));
      setHasUnsavedChanges(prev => ({ ...prev, [termId]: false }));
      autoSave(termId, original.fullText);
      toast({
        title: "Termo restaurado",
        description: "O texto original foi restaurado."
      });
    }
  };

  const toggleEdit = (termId: number) => {
    setIsEditing(prev => ({ ...prev, [termId]: !prev[termId] }));
  };

  const getCurrentContent = (termId: number) => {
    return editedContent[termId] || agreementOptions.find(opt => opt.id === termId)?.fullText || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <FileCheck className="h-5 w-5" />
            Geração de Termos de Acordo
          </CardTitle>
          <CardDescription>
            Três opções de minutas de acordo baseadas na análise do processo
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Agreement Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {agreementOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Card 
              key={option.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTerm === option.id ? 'ring-2 ring-primary shadow-lg' : ''
              } border-0 bg-gradient-card`}
              onClick={() => setSelectedTerm(selectedTerm === option.id ? null : option.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${option.bgColor} ${option.borderColor} border`}>
                    <IconComponent className={`h-5 w-5 ${option.color}`} />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${option.bgColor} ${option.color} border-0`}
                  >
                    {option.type === 'author' ? 'Favorável ao Autor' : 
                     option.type === 'balanced' ? 'Equilibrado' : 
                     'Favorável ao Réu'}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  {option.terms.map((term, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                      {term}
                    </li>
                  ))}
                </ul>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyText(option.fullText);
                    }}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(option.title, option.fullText);
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Baixar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed View */}
      {selectedTerm && (
        <Card className="shadow-card border-0 bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                {agreementOptions.find(opt => opt.id === selectedTerm)?.title}
                {hasUnsavedChanges[selectedTerm] && (
                  <Badge variant="secondary" className="text-xs">
                    Não salvo
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleEdit(selectedTerm)}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="h-4 w-4" />
                  {isEditing[selectedTerm] ? 'Visualizar' : 'Editar'}
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              {isEditing[selectedTerm] ? 'Editando termo de acordo - salvamento automático ativo' : 'Minuta completa do termo de acordo'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={getCurrentContent(selectedTerm)}
              onChange={(e) => handleContentChange(selectedTerm, e.target.value)}
              readOnly={!isEditing[selectedTerm]}
              className={`min-h-[400px] font-mono text-sm transition-all ${
                isEditing[selectedTerm] 
                  ? 'border-primary ring-1 ring-primary/20 bg-background' 
                  : 'bg-muted/30'
              }`}
              placeholder="Conteúdo do termo de acordo..."
            />
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleCopyText(getCurrentContent(selectedTerm))}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Texto
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    const option = agreementOptions.find(opt => opt.id === selectedTerm);
                    if (option) handleDownload(option.title, getCurrentContent(selectedTerm));
                  }}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Baixar Arquivo
                </Button>
              </div>
              
              {isEditing[selectedTerm] && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetTerm(selectedTerm)}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restaurar Original
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleManualSave(selectedTerm)}
                    disabled={!hasUnsavedChanges[selectedTerm]}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" />
                    Salvar Agora
                  </Button>
                </div>
              )}
            </div>
            
            {isEditing[selectedTerm] && (
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  hasUnsavedChanges[selectedTerm] ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                {hasUnsavedChanges[selectedTerm] ? 'Salvando...' : 'Salvo automaticamente'}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgreementTerms;