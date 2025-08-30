import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { RevenueAndProfitChart } from "@/components/charts/RevenueAndProfitChart";
import { QuantityChart } from "@/components/charts/QuantityChart";
import { StoreDistributionChart } from "@/components/charts/StoreDistributionChart";
import { TopSubgroupsTable } from "@/components/charts/TopSubgroupsTable";
import { DataTable } from "@/components/DataTable";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, DollarSign, Package, Store, Users, Calculator, Tags, Grid, Filter, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SalesData {
  id: string;
  month: string;
  session: string;
  group: string;
  subgroup: string;
  store: string;
  quantity_sold: number;
  value_brl: number;
  profit_brl: number;
  quantity_percentage: number;
  value_percentage: number;
  profit_percentage: number;
  created_at: string;
}

interface Filters {
  store: string;
  month: string;
  year: string;
  session: string;
  subgroup: string;
}

export default function Dashboard() {
  const { } = useAuth();
  const [data, setData] = useState<SalesData[]>([]);
  const [filteredData, setFilteredData] = useState<SalesData[]>([]);
  const [filters, setFilters] = useState<Filters>({
    store: "",
    month: "",
    year: "",
    session: "",
    subgroup: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [availableFilters, setAvailableFilters] = useState({
    stores: [] as string[],
    months: [] as string[],
    years: [] as string[],
    sessions: [] as string[],
    subgroups: [] as string[]
  });

  // Load data from Supabase
  useEffect(() => {
    loadData();
  }, []);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [data, filters]);

  const loadData = async () => {
    try {
      const { data: salesData, error } = await supabase
        .from('sales_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setData(salesData || []);
      
      // Extract unique values for filters
      const stores = [...new Set(salesData?.map(item => item.store) || [])];
      const months = [...new Set(salesData?.map(item => item.month) || [])];
      const years = [...new Set(salesData?.map(item => new Date(item.created_at).getFullYear().toString()) || [])];
      const sessions = [...new Set(salesData?.map(item => item.session) || [])];
      const subgroups = [...new Set(salesData?.map(item => item.subgroup) || [])];

      setAvailableFilters({ stores, months, years, sessions, subgroups });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...data];

    if (filters.store) {
      filtered = filtered.filter(item => item.store === filters.store);
    }
    if (filters.month) {
      filtered = filtered.filter(item => item.month === filters.month);
    }
    if (filters.year) {
      filtered = filtered.filter(item => new Date(item.created_at).getFullYear().toString() === filters.year);
    }
    if (filters.session) {
      filtered = filtered.filter(item => item.session === filters.session);
    }
    if (filters.subgroup) {
      filtered = filtered.filter(item => item.subgroup === filters.subgroup);
    }

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setFilters({ store: "", month: "", year: "", session: "", subgroup: "" });
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Mês,Ano,Sessão,Subgrupo,Loja,Quantidade Vendida,Valor (BRL),Lucro (BRL),% Quantidade,% Valor,% Lucro\n" +
      filteredData.map(row => 
        `${row.month},${new Date(row.created_at).getFullYear()},${row.session},${row.subgroup},${row.store},${row.quantity_sold},${row.value_brl},${row.profit_brl},${row.quantity_percentage},${row.value_percentage},${row.profit_percentage}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals and metrics
  const totals = filteredData.reduce(
    (acc, item) => ({
      quantity: acc.quantity + (item.quantity_sold || 0),
      value: acc.value + (item.value_brl || 0),
      profit: acc.profit + (item.profit_brl || 0),
      avgQuantityPercentage: acc.avgQuantityPercentage + (item.quantity_percentage || 0),
      avgValuePercentage: acc.avgValuePercentage + (item.value_percentage || 0),
      avgProfitPercentage: acc.avgProfitPercentage + (item.profit_percentage || 0)
    }),
    { quantity: 0, value: 0, profit: 0, avgQuantityPercentage: 0, avgValuePercentage: 0, avgProfitPercentage: 0 }
  );

  const dataCount = filteredData.length;
  if (dataCount > 0) {
    totals.avgQuantityPercentage /= dataCount;
    totals.avgValuePercentage /= dataCount;
    totals.avgProfitPercentage /= dataCount;
  }

  // Calculate additional metrics
  const totalBuyers = 13; // Total de compradores (incluindo supervisores)
  const profitMarginPercentage = totals.value > 0 ? (totals.profit / totals.value) * 100 : 0;
  const totalSessions = availableFilters.sessions.length;
  const totalSubgroups = availableFilters.subgroups.length;

  const months = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dashboard-bg">
        <Header />
        <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground text-sm sm:text-base">Carregando dados...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
        {/* Filters */}
        <Card className="shadow-lg border-0 bg-gradient-card hover-lift backdrop-blur-sm">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-3 text-lg sm:text-xl bg-gradient-primary bg-clip-text text-transparent">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              Filtros de Análise
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Configure os filtros para personalizar sua análise de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Loja</label>
                  <Select value={filters.store} onValueChange={(value) => setFilters({...filters, store: value})}>
                    <SelectTrigger className="h-11 border-2 focus:border-primary transition-colors">
                      <SelectValue placeholder="Todas as lojas" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="">Todas as lojas</SelectItem>
                      {availableFilters.stores.map((store) => (
                        <SelectItem key={store} value={store}>{store}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Mês</label>
                  <Select value={filters.month} onValueChange={(value) => setFilters({...filters, month: value})}>
                    <SelectTrigger className="h-11 border-2 focus:border-primary transition-colors">
                      <SelectValue placeholder="Todos os meses" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="">Todos os meses</SelectItem>
                      {months.filter(m => availableFilters.months.includes(m.value)).map((month) => (
                        <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Ano</label>
                  <Select value={filters.year} onValueChange={(value) => setFilters({...filters, year: value})}>
                    <SelectTrigger className="h-11 border-2 focus:border-primary transition-colors">
                      <SelectValue placeholder="Todos os anos" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="">Todos os anos</SelectItem>
                      {availableFilters.years.map((year) => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sessão</label>
                  <Select value={filters.session} onValueChange={(value) => setFilters({...filters, session: value})}>
                    <SelectTrigger className="h-11 border-2 focus:border-primary transition-colors">
                      <SelectValue placeholder="Todas as sessões" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="">Todas as sessões</SelectItem>
                      {availableFilters.sessions.map((session) => (
                        <SelectItem key={session} value={session}>{session}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subgrupo</label>
                  <Select value={filters.subgroup} onValueChange={(value) => setFilters({...filters, subgroup: value})}>
                    <SelectTrigger className="h-11 border-2 focus:border-primary transition-colors">
                      <SelectValue placeholder="Todos os subgrupos" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border border-border shadow-lg z-50">
                      <SelectItem value="">Todos os subgrupos</SelectItem>
                      {availableFilters.subgroups
                        .filter(subgroup => {
                          if (!filters.session) return true;
                          return data.some(item => item.session === filters.session && item.subgroup === subgroup);
                        })
                        .map((subgroup) => (
                          <SelectItem key={subgroup} value={subgroup}>{subgroup}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>

            {(filters.store || filters.month || filters.year || filters.session || filters.subgroup) && (
              <div className="flex items-center gap-3 flex-wrap p-4 bg-accent/50 rounded-lg border border-accent">
                <span className="text-sm font-medium text-foreground">Filtros ativos:</span>
                {filters.store && <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{filters.store}</Badge>}
                {filters.month && <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{months.find(m => m.value === filters.month)?.label}</Badge>}
                {filters.year && <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{filters.year}</Badge>}
                {filters.session && <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{filters.session}</Badge>}
                {filters.subgroup && <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">{filters.subgroup}</Badge>}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearFilters}
                  className="ml-auto border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="shadow-kpi border-0 bg-gradient-primary hover-lift group animate-fade-in">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-primary-foreground/80">Quantidade Total</p>
                  <p className="text-xl sm:text-3xl font-bold text-primary-foreground mt-2">
                    {totals.quantity.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs sm:text-sm text-primary-foreground/70 mt-1">unidades vendidas</p>
                </div>
                <div className="p-3 sm:p-4 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-kpi border-0 bg-gradient-success hover-lift group animate-fade-in">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-success-foreground/80">Valor Total</p>
                  <p className="text-xl sm:text-3xl font-bold text-success-foreground mt-2">
                    R$ {totals.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs sm:text-sm text-success-foreground/70 mt-1">faturamento bruto</p>
                </div>
                <div className="p-3 sm:p-4 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-success-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-kpi border-0 bg-gradient-purple hover-lift group animate-fade-in">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-white/80">Lucro Total</p>
                  <p className="text-xl sm:text-3xl font-bold text-white mt-2">
                    R$ {totals.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs sm:text-sm text-white/70 mt-1">margem de lucro</p>
                </div>
                <div className="p-3 sm:p-4 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-kpi border-0 bg-gradient-cyan hover-lift group animate-fade-in">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-white/80">Lojas Ativas</p>
                  <p className="text-xl sm:text-3xl font-bold text-white mt-2">
                    {availableFilters.stores.length}
                  </p>
                  <p className="text-xs sm:text-sm text-white/70 mt-1">pontos de venda</p>
                </div>
                <div className="p-3 sm:p-4 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                  <Store className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <Card className="shadow-card border-0 bg-gradient-card hover-lift animate-slide-up">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-gradient-warning rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalBuyers}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Compradores</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card hover-lift animate-slide-up">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-gradient-success rounded-full">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{profitMarginPercentage.toFixed(1)}%</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Margem de Lucro</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card hover-lift animate-slide-up">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-gradient-primary rounded-full">
                  <Tags className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalSessions}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sessões</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card hover-lift animate-slide-up">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 bg-gradient-purple rounded-full">
                  <Grid className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{totalSubgroups}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Subgrupos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <div className="animate-fade-in">
            <RevenueAndProfitChart data={filteredData} />
          </div>
          <div className="animate-slide-up">
            <TopSubgroupsTable data={filteredData} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          <div className="animate-scale-in">
            <QuantityChart data={filteredData} />
          </div>
          <div className="animate-fade-in">
            <StoreDistributionChart data={filteredData} />
          </div>
        </div>

        {/* Data Table */}
        <div className="animate-slide-up">
          <DataTable data={filteredData} />
        </div>
      </div>
    </div>
  );
}