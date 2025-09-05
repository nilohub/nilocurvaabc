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
import { Plus, Filter, DollarSign, Package, Building, Calendar, Barcode, Search } from "lucide-react";
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
  created_at: string;
}

interface NewQuotation {
  barcode: string;
  description: string;
  subgroup: string;
  retail_price: string;
  wholesale_price: string;
  company_name: string;
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
  const [newQuotation, setNewQuotation] = useState<NewQuotation>({
    barcode: "",
    description: "",
    subgroup: "",
    retail_price: "",
    wholesale_price: "",
    company_name: ""
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
        !newQuotation.retail_price || !newQuotation.company_name) {
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
          company_name: newQuotation.company_name
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
        company_name: ""
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
    <div className="min-h-screen bg-dashboard-bg">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Header with Title and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Sistema de Cotação</h1>
            <p className="text-muted-foreground">Gerencie cotações de preços de produtos</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4" />
                Nova Cotação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Cotação</DialogTitle>
                <DialogDescription>
                  Insira as informações do produto e preços coletados
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Código de Barras *</Label>
                  <Input
                    id="barcode"
                    value={newQuotation.barcode}
                    onChange={(e) => setNewQuotation({...newQuotation, barcode: e.target.value})}
                    placeholder="Ex: 7896542653210"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={newQuotation.description}
                    onChange={(e) => setNewQuotation({...newQuotation, description: e.target.value})}
                    placeholder="Ex: Açúcar Cristal 1kg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subgroup">Subgrupo *</Label>
                  <Select value={newQuotation.subgroup} onValueChange={(value) => setNewQuotation({...newQuotation, subgroup: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar subgrupo" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      {availableSubgroups.map((subgroup) => (
                        <SelectItem key={subgroup} value={subgroup}>{subgroup}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="retail_price">Preço Varejo (R$) *</Label>
                    <Input
                      id="retail_price"
                      type="number"
                      step="0.01"
                      value={newQuotation.retail_price}
                      onChange={(e) => setNewQuotation({...newQuotation, retail_price: e.target.value})}
                      placeholder="0,00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wholesale_price">Preço Atacado (R$)</Label>
                    <Input
                      id="wholesale_price"
                      type="number"
                      step="0.01"
                      value={newQuotation.wholesale_price}
                      onChange={(e) => setNewQuotation({...newQuotation, wholesale_price: e.target.value})}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_name">Nome da Empresa *</Label>
                  <Input
                    id="company_name"
                    value={newQuotation.company_name}
                    onChange={(e) => setNewQuotation({...newQuotation, company_name: e.target.value})}
                    placeholder="Ex: Atacadista XYZ"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90">
                    Salvar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Filtros
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Filtre as cotações por subgrupo, data ou busca
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="space-y-2">
                <Label>Subgrupo</Label>
                <Select value={filters.subgroup} onValueChange={(value) => setFilters({...filters, subgroup: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os subgrupos" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {availableSubgroups.map((subgroup) => (
                      <SelectItem key={subgroup} value={subgroup}>{subgroup}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Produto, código ou empresa"
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {(filters.subgroup || filters.date_from || filters.date_to || filters.search) && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {filters.subgroup && <Badge variant="secondary">{filters.subgroup}</Badge>}
                {filters.date_from && <Badge variant="secondary">A partir de {format(new Date(filters.date_from), 'dd/MM/yyyy')}</Badge>}
                {filters.date_to && <Badge variant="secondary">Até {format(new Date(filters.date_to), 'dd/MM/yyyy')}</Badge>}
                {filters.search && <Badge variant="secondary">"{filters.search}"</Badge>}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quotations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredQuotations.map((quotation) => (
            <Card key={quotation.id} className="shadow-card border-0 bg-gradient-card hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="text-xs">{quotation.subgroup}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(quotation.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <CardTitle className="text-base font-semibold line-clamp-2">{quotation.description}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Barcode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{quotation.barcode}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-chart-2" />
                      <span className="text-sm font-medium">Varejo</span>
                    </div>
                    <span className="font-bold text-chart-2">
                      R$ {quotation.retail_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {quotation.wholesale_price && (
                    <div className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-chart-3" />
                        <span className="text-sm font-medium">Atacado</span>
                      </div>
                      <span className="font-bold text-chart-3">
                        R$ {quotation.wholesale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{quotation.company_name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuotations.length === 0 && (
          <Card className="shadow-card border-0">
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma cotação encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {quotations.length === 0 
                  ? "Adicione sua primeira cotação clicando no botão 'Nova Cotação'."
                  : "Tente ajustar os filtros para encontrar cotações específicas."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}