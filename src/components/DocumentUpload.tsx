import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const DocumentUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setIsProcessing(true);
      
      // Simular processamento
      setTimeout(() => {
        const newFiles = files.map(file => file.name);
        setUploadedFiles(prev => [...prev, ...newFiles]);
        setIsProcessing(false);
        
        toast({
          title: "Documentos processados com sucesso",
          description: `${files.length} arquivo(s) analisado(s) pelo sistema.`,
          variant: "default",
        });
      }, 2000);
    }
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-law-navy">
          <FileText className="h-5 w-5" />
          Upload de Documentos
        </CardTitle>
        <CardDescription>
          Faça upload da petição inicial, contestação e outros documentos do processo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-accent transition-colors">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isProcessing}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 rounded-full bg-accent/10">
                <Upload className="h-8 w-8 text-accent" />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  {isProcessing ? "Processando documentos..." : "Clique para fazer upload"}
                </p>
                <p className="text-sm text-muted-foreground">
                  PDF, DOC ou DOCX até 10MB cada
                </p>
              </div>
            </div>
          </label>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Documentos Processados:</h4>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-foreground">{file}</span>
                </div>
                <AlertCircle className="h-4 w-4 text-warning" />
              </div>
            ))}
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" size="lg">
            Iniciar Análise do Processo
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;