import { Scale, FileText, Brain, Users, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Scale className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-law-navy">ConcilIA</h1>
              <p className="text-sm text-law-gray">Assistente Jurídico Inteligente</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-foreground hover:text-law-blue">
              <FileText className="h-4 w-4 mr-2" />
              Documentos
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-law-blue">
              <Brain className="h-4 w-4 mr-2" />
              Estratégias
            </Button>
            <Button variant="ghost" className="text-foreground hover:text-law-blue">
              <Users className="h-4 w-4 mr-2" />
              Audiências
            </Button>
            <Link to="/civil">
              <Button variant="outline" className="border-law-blue text-law-blue hover:bg-law-blue hover:text-white">
                <User className="h-4 w-4 mr-2" />
                Portal do Cidadão
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;