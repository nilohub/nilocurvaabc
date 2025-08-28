import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, ShoppingCart } from 'lucide-react';

export default function Login() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira seu código de acesso",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const success = login(code.trim());
    
    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      navigate('/');
    } else {
      toast({
        title: "Código inválido",
        description: "Verifique seu código de acesso e tente novamente",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Company Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-primary rounded-2xl shadow-glow">
              <TrendingUp className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Nilo Atacadista</h1>
          <p className="text-xl text-muted-foreground">Análise de Curva ABC</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-2">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <ShoppingCart className="h-6 w-6" />
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">
                  Código de Acesso
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Digite seu código"
                  className="h-12 text-lg text-center font-mono tracking-wider"
                  disabled={isLoading}
                  autoFocus
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar no Sistema"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground text-center font-medium">
                "No quieto, no quieto, o Nilo vende mais barato."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}