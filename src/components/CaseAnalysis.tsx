import { AlertTriangle, Users, Calendar, DollarSign, Scale, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const CaseAnalysis = () => {
  return (
    <div className="space-y-6">
      {/* Resumo do Caso */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-law-navy">
            <Scale className="h-5 w-5" />
            Resumo do Processo
          </CardTitle>
          <CardDescription>
            Análise automatizada baseada nos documentos processados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tipo de Ação</p>
              <Badge variant="secondary" className="bg-law-blue/10 text-law-blue border-law-blue/20">
                Rescisão Contratual
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Valor da Causa</p>
              <p className="text-lg font-bold text-foreground">R$ 45.000,00</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Complexidade</p>
              <div className="flex items-center space-x-2">
                <Progress value={65} className="flex-1" />
                <span className="text-sm font-medium text-warning">Média</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 border border-muted">
            <p className="text-sm text-foreground leading-relaxed">
              <strong>Resumo:</strong> Ação de rescisão contratual movida por empresa prestadora de serviços contra cliente por inadimplemento. 
              Réu contesta alegando descumprimento de prazo e má qualidade do serviço prestado. 
              Pontos principais: pagamento pendente de R$ 45.000 e discussão sobre qualidade da entrega.
            </p>
          </div>

          {/* Resumo em Linguagem Simples */}
          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Explicação Simplificada para as Partes
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>O que aconteceu:</strong> Uma empresa fez um trabalho para um cliente, mas o cliente não pagou os R$ 45.000,00 combinados. 
              A empresa quer cancelar o contrato e receber o dinheiro. O cliente diz que o trabalho não ficou bom e demorou mais que o esperado.
              <br /><br />
              <strong>O que vocês precisam resolver:</strong> Se o cliente vai pagar (e quanto), se o trabalho realmente teve problemas, 
              e como podem chegar a um acordo que seja justo para os dois lados.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pontos de Atenção */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Pontos de Atenção
          </CardTitle>
          <CardDescription>
            Questões sensíveis identificadas no processo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Alta emotividade esperada</p>
              <p className="text-sm text-muted-foreground">
                Histórico de relacionamento comercial longo (5 anos) pode gerar discussões acaloradas
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
            <DollarSign className="h-4 w-4 text-warning mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Questão financeira complexa</p>
              <p className="text-sm text-muted-foreground">
                Valores contestados incluem multas e juros que podem dificultar acordo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estratégias Sugeridas */}
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Lightbulb className="h-5 w-5" />
            Estratégias de Conciliação
          </CardTitle>
          <CardDescription>
            Recomendações baseadas no perfil do caso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <h4 className="font-medium text-foreground mb-2">1. Abordagem Inicial</h4>
              <p className="text-sm text-muted-foreground">
                Comece reconhecendo o relacionamento comercial entre as partes e a importância de preservar a boa-fé
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <h4 className="font-medium text-foreground mb-2">2. Foco nos Interesses</h4>
              <p className="text-sm text-muted-foreground">
                Explore se há possibilidade de novos contratos ou parcerias futuras como parte da solução
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
              <h4 className="font-medium text-foreground mb-2">3. Parcelamento Flexível</h4>
              <p className="text-sm text-muted-foreground">
                Sugira opções de parcelamento que considerem a capacidade financeira atual do devedor
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseAnalysis;