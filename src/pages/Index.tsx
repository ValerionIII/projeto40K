import { useState } from "react";
import { Scale, FileText, Brain, Activity, FileCheck, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import DocumentUpload from "@/components/DocumentUpload";
import CaseAnalysis from "@/components/CaseAnalysis";
import LiveFeedback from "@/components/LiveFeedback";
import AgreementTerms from "@/components/AgreementTerms";
import ConciliatorStats from "@/components/ConciliatorStats";

const Index = () => {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16 px-6 bg-gradient-hero">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Scale className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            ConcilIA
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Seu assistente virtual inteligente para condução de audiências de conciliação
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <FileText className="h-8 w-8 text-white mb-4 mx-auto" />
              <h3 className="font-semibold text-white mb-2">Análise de Documentos</h3>
              <p className="text-white/80 text-sm">Processamento inteligente de petições e contestações</p>
            </div>
            <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <Brain className="h-8 w-8 text-white mb-4 mx-auto" />
              <h3 className="font-semibold text-white mb-2">Estratégias Personalizadas</h3>
              <p className="text-white/80 text-sm">Sugestões baseadas no perfil do caso e das partes</p>
            </div>
            <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <Activity className="h-8 w-8 text-white mb-4 mx-auto" />
              <h3 className="font-semibold text-white mb-2">Feedback em Tempo Real</h3>
              <p className="text-white/80 text-sm">Monitoramento e orientações durante a audiência</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-muted/50">
              <TabsTrigger value="upload" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Brain className="h-4 w-4 mr-2" />
                Análise do Caso
              </TabsTrigger>
              <TabsTrigger value="live" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Activity className="h-4 w-4 mr-2" />
                Monitoramento
              </TabsTrigger>
              <TabsTrigger value="agreements" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileCheck className="h-4 w-4 mr-2" />
                Geração de Acordo
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4 mr-2" />
                Estatísticas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="max-w-4xl mx-auto">
                <DocumentUpload />
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="max-w-6xl mx-auto">
                <CaseAnalysis />
              </div>
            </TabsContent>

            <TabsContent value="agreements" className="space-y-6">
              <div className="max-w-6xl mx-auto">
                <AgreementTerms />
              </div>
            </TabsContent>

            <TabsContent value="live" className="space-y-6">
              <div className="max-w-4xl mx-auto">
                <LiveFeedback />
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              <div className="max-w-6xl mx-auto">
                <ConciliatorStats />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Index;
