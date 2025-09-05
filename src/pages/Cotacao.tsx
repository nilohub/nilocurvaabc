import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Filter, DollarSign, Package, Building, Calendar, Barcode, Search, User, TrendingUp, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Quotation {
  id: string;
  barcode: string;
  description: string;
  subgroup: string;
  retail_price: number;
  wholesale_price?: number;
  company_name: string;
  buyer_name: string;
  created_at: string;
}

interface NewQuotation {
  barcode: string;
  description: string;
  subgroup: string;
  retail_price: string;
  wholesale_price: string;
  company_name: string;
  buyer_name: string;
}

interface Filters {
  subgroup: string;
  date_from: string;
  date_to: string;
  search: string;
}

export default function Cotacao() {
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<Quotation[]>([]);
  const [filters, setFilters] = useState<Filters>({
    subgroup: "",
    date_from: "",
    date_to: "",
    search: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableSubgroups, setAvailableSubgroups] = useState<string[]>([]);
  const [buyers] = useState<string[]>(['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira', 'Carlos Ferreira']);
  const [newQuotation, setNewQuotation] = useState<NewQuotation>({
    barcode: "",
    description: "",
    subgroup: "",
    retail_price: "",
    wholesale_price: "",
    company_name: "",
    buyer_name: ""
  });

  useEffect(() => {
    loadQuotations();
    loadSubgroups();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quotations, filters]);

  const loadQuotations = async () => {
    try {
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotations(data || []);
    } catch (error) {
      console.error('Error loading quotations:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cotações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubgroups = async () => {
    try {
      const { data, error } = await supabase
        .from('sales_data')
        .select('subgroup')
        .order('subgroup');

      if (error) throw error;
      
      const uniqueSubgroups = [...new Set(data?.map(item => item.subgroup) || [])];
      setAvailableSubgroups(uniqueSubgroups);
    } catch (error) {
      console.error('Error loading subgroups:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...quotations];

    if (filters.subgroup) {
      filtered = filtered.filter(item => item.subgroup === filters.subgroup);
    }

    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      filtered = filtered.filter(item => new Date(item.created_at) >= fromDate);
    }

    if (filters.date_to) {
      const toDate = new Date(filters.date_to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(item => new Date(item.created_at) <= toDate);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.description.toLowerCase().includes(searchLower) ||
        item.barcode.includes(filters.search) ||
        item.company_name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredQuotations(filtered);
  };

  const clearFilters = () => {
    setFilters({ subgroup: "", date_from: "", date_to: "", search: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuotation.barcode || !newQuotation.description || !newQuotation.subgroup || 
        !newQuotation.retail_price || !newQuotation.company_name || !newQuotation.buyer_name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('quotations')
        .insert({
          barcode: newQuotation.barcode,
          description: newQuotation.description,
          subgroup: newQuotation.subgroup,
          retail_price: parseFloat(newQuotation.retail_price),
          wholesale_price: newQuotation.wholesale_price ? parseFloat(newQuotation.wholesale_price) : null,
          company_name: newQuotation.company_name,
          buyer_name: newQuotation.buyer_name
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cotação adicionada com sucesso"
      });

      setNewQuotation({
        barcode: "",
        description: "",
        subgroup: "",
        retail_price: "",
        wholesale_price: "",
        company_name: "",
        buyer_name: ""
      });
      setIsDialogOpen(false);
      loadQuotations();
    } catch (error) {
      console.error('Error adding quotation:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar cotação",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dashboard-bg">
        <Header />
        <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm sm:text-base">Carregando cotações...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dashboard-bg via-background to-secondary/20">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Animated Header with Gradient Background */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-chart-2 to-chart-3 p-6 sm:p-8 text-white animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-chart-2/90 to-chart-3/90"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="animate-scale-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">Sistema de Cotação</h1>
              </div>
              <p className="text-white/90 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Gerencie cotações de preços de produtos com inteligência
              </p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="group bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                  Nova Cotação
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Adicionar Nova Cotação
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Insira as informações do produto e preços coletados pelo comprador
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="barcode" className="flex items-center gap-2">
                        <Barcode className="h-4 w-4" />
                        Código de Barras *
                      </Label>
                      <Input
                        id="barcode"
                        value={newQuotation.barcode}
                        onChange={(e) => setNewQuotation({...newQuotation, barcode: e.target.value})}
                        placeholder="Ex: 7896542653210"
                        className="transition-all duration-200 focus:scale-[1.02]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buyer_name" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Comprador *
                      </Label>
                      <Select value={newQuotation.buyer_name} onValueChange={(value) => setNewQuotation({...newQuotation, buyer_name: value})}>
                        <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                          <SelectValue placeholder="Selecionar comprador" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border border-border z-50">
                          {buyers.map((buyer) => (
                            <SelectItem key={buyer} value={buyer}>{buyer}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Descrição *
                    </Label>
                    <Input
                      id="description"
                      value={newQuotation.description}
                      onChange={(e) => setNewQuotation({...newQuotation, description: e.target.value})}
                      placeholder="Ex: Açúcar Cristal 1kg"
                      className="transition-all duration-200 focus:scale-[1.02]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subgroup" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Subgrupo *
                    </Label>
                    <Select value={newQuotation.subgroup} onValueChange={(value) => setNewQuotation({...newQuotation, subgroup: value})}>
                      <SelectTrigger className="transition-all duration-200 focus:scale-[1.02]">
                        <SelectValue placeholder="Selecionar subgrupo" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        {availableSubgroups.map((subgroup) => (
                          <SelectItem key={subgroup} value={subgroup}>{subgroup}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="retail_price" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-chart-2" />
                        Preço Varejo (R$) *
                      </Label>
                      <Input
                        id="retail_price"
                        type="number"
                        step="0.01"
                        value={newQuotation.retail_price}
                        onChange={(e) => setNewQuotation({...newQuotation, retail_price: e.target.value})}
                        placeholder="0,00"
                        className="transition-all duration-200 focus:scale-[1.02]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wholesale_price" className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-chart-3" />
                        Preço Atacado (R$)
                      </Label>
                      <Input
                        id="wholesale_price"
                        type="number"
                        step="0.01"
                        value={newQuotation.wholesale_price}
                        onChange={(e) => setNewQuotation({...newQuotation, wholesale_price: e.target.value})}
                        placeholder="0,00"
                        className="transition-all duration-200 focus:scale-[1.02]"
                      />
                    </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Nome da Empresa *
                    </Label>
                    <Input
                      id="company_name"
                      value={newQuotation.company_name}
                      onChange={(e) => setNewQuotation({...newQuotation, company_name: e.target.value})}
                      placeholder="Ex: Atacadista XYZ"
                      className="transition-all duration-200 focus:scale-[1.02]"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1 hover:scale-105 transition-transform duration-200">
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90 hover:scale-105 transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      Salvar Cotação
                    </Button>
                  </div>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Enhanced Filters Card */}
        <Card className="shadow-elegant border-0 bg-gradient-card backdrop-blur-sm animate-fade-in">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              Filtros Inteligentes
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Filtre as cotações por subgrupo, período ou pesquise por termos específicos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
              <div className="space-y-2 group">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Filter className="h-4 w-4 text-primary" />
                  Subgrupo
                </Label>
                <Select value={filters.subgroup} onValueChange={(value) => setFilters({...filters, subgroup: value})}>
                  <SelectTrigger className="transition-all duration-200 hover:shadow-md focus:scale-[1.02] group-hover:border-primary/50">
                    <SelectValue placeholder="Todos os subgrupos" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {availableSubgroups.map((subgroup) => (
                      <SelectItem key={subgroup} value={subgroup}>{subgroup}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 group">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-chart-2" />
                  Data Inicial
                </Label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                  className="transition-all duration-200 hover:shadow-md focus:scale-[1.02] group-hover:border-chart-2/50"
                />
              </div>

              <div className="space-y-2 group">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-chart-3" />
                  Data Final
                </Label>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                  className="transition-all duration-200 hover:shadow-md focus:scale-[1.02] group-hover:border-chart-3/50"
                />
              </div>

              <div className="space-y-2 group">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Search className="h-4 w-4 text-chart-4" />
                  Buscar
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-chart-4" />
                  <Input
                    placeholder="Produto, código ou empresa"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10 transition-all duration-200 hover:shadow-md focus:scale-[1.02] group-hover:border-chart-4/50"
                  />
                </div>
              </div>
            </div>

            {(filters.subgroup || filters.date_from || filters.date_to || filters.search) && (
              <div className="flex items-center gap-3 flex-wrap p-4 bg-secondary/30 rounded-xl border border-secondary">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Filtros ativos:
                </span>
                {filters.subgroup && <Badge variant="secondary" className="hover:scale-105 transition-transform">{filters.subgroup}</Badge>}
                {filters.date_from && <Badge variant="secondary" className="hover:scale-105 transition-transform">A partir de {format(new Date(filters.date_from), 'dd/MM/yyyy')}</Badge>}
                {filters.date_to && <Badge variant="secondary" className="hover:scale-105 transition-transform">Até {format(new Date(filters.date_to), 'dd/MM/yyyy')}</Badge>}
                {filters.search && <Badge variant="secondary" className="hover:scale-105 transition-transform">"{filters.search}"</Badge>}
                <Button variant="ghost" size="sm" onClick={clearFilters} className="hover:scale-105 transition-transform">
                  <Filter className="h-4 w-4 mr-1" />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Quotations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredQuotations.map((quotation, index) => (
            <Card key={quotation.id} className="group shadow-elegant border-0 bg-gradient-card hover:shadow-glow transition-all duration-500 hover:scale-105 animate-fade-in hover-scale" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs font-medium px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                    {quotation.subgroup}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(quotation.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                </div>
                <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {quotation.description}
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 p-2 bg-secondary/30 rounded-lg">
                  <User className="h-4 w-4 text-chart-4" />
                  <span className="text-sm font-medium text-chart-4">
                    {quotation.buyer_name}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl border border-secondary/30">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Barcode className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-mono font-medium">{quotation.barcode}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-chart-2/10 to-chart-2/5 rounded-xl border border-chart-2/20 hover:border-chart-2/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-chart-2/20 rounded-lg">
                        <DollarSign className="h-4 w-4 text-chart-2" />
                      </div>
                      <span className="text-sm font-semibold text-chart-2">Varejo</span>
                    </div>
                    <span className="font-bold text-lg text-chart-2">
                      R$ {quotation.retail_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {quotation.wholesale_price && (
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-chart-3/10 to-chart-3/5 rounded-xl border border-chart-3/20 hover:border-chart-3/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-chart-3/20 rounded-lg">
                          <Package className="h-4 w-4 text-chart-3" />
                        </div>
                        <span className="text-sm font-semibold text-chart-3">Atacado</span>
                      </div>
                      <span className="font-bold text-lg text-chart-3">
                        R$ {quotation.wholesale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-secondary/30">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground flex-1 truncate">
                    {quotation.company_name}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuotations.length === 0 && (
          <Card className="shadow-elegant border-0 bg-gradient-card animate-fade-in">
            <CardContent className="text-center py-12">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Nenhuma cotação encontrada</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    {quotations.length === 0 
                      ? "Comece a adicionar cotações para acompanhar os preços do mercado de forma inteligente."
                      : "Tente ajustar os filtros para encontrar cotações específicas ou remova alguns filtros."
                    }
                  </p>
                  {quotations.length === 0 && (
                    <Button onClick={() => setIsDialogOpen(true)} className="bg-gradient-primary hover:opacity-90">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeira Cotação
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}