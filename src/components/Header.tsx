import { Button } from "@/components/ui/button";
import { Upload, BarChart3, TrendingUp, LogOut, User, Grid3X3, DollarSign } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isSupervisor } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b shadow-card">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-gradient-primary rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-foreground">Análise de Curva ABC</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Nilo Atacadista</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-sm font-bold text-foreground">ABC</h1>
            </div>
          </div>
          
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              onClick={() => navigate("/")}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
              size="sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
            
            <Button
              variant={location.pathname === "/mix-produtos" ? "default" : "ghost"}
              onClick={() => navigate("/mix-produtos")}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
              size="sm"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Mix Produtos</span>
            </Button>
            
            <Button
              variant={location.pathname === "/cotacao" ? "default" : "ghost"}
              onClick={() => navigate("/cotacao")}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
              size="sm"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Cotação</span>
            </Button>
            
            {isSupervisor && (
              <Button
                variant={location.pathname === "/upload" ? "default" : "ghost"}
                onClick={() => navigate("/upload")}
                className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3"
                size="sm"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            )}

            <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">
              <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-secondary rounded-lg">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-xs sm:text-sm font-medium hidden md:inline">{user?.name}</span>
                <span className="text-xs text-muted-foreground hidden lg:inline">({user?.role === 'supervisor' ? 'Supervisor' : 'Comprador'})</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-foreground px-2 sm:px-3"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}