import { Button } from "@/components/ui/button";
import { Upload, BarChart3, TrendingUp, LogOut, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isSupervisor } = useAuth();

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
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            
            {isSupervisor && (
              <Button
                variant={location.pathname === "/upload" ? "default" : "ghost"}
                onClick={() => navigate("/upload")}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
            )}

            <div className="flex items-center space-x-2 ml-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-secondary rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-muted-foreground">({user?.role === 'supervisor' ? 'Supervisor' : 'Comprador'})</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}