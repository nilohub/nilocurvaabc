import { Button } from "@/components/ui/button";
import { Upload, BarChart3, TrendingUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b shadow-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Análise de Curva ABC</h1>
              <p className="text-sm text-muted-foreground">Nilo Atacadista</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
            
            <Button
              variant={location.pathname === "/dashboard" ? "default" : "ghost"}
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}