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
    <div className="min-h-screen bg-dashboard-bg">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-8">
        {/* Filters */}
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5" />
              Filtros
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Use os filtros abaixo para refinar a análise dos dados
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
              <div>
                <Select value={filters.store} onValueChange={(value) => setFilters({...filters, store: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Loja" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {availableFilters.stores.map((store) => (
                      <SelectItem key={store} value={store}>{store}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filters.month} onValueChange={(value) => setFilters({...filters, month: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Mês" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {months.filter(m => availableFilters.months.includes(m.value)).map((month) => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filters.year} onValueChange={(value) => setFilters({...filters, year: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Ano" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {availableFilters.years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filters.session} onValueChange={(value) => setFilters({...filters, session: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Sessão" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {availableFilters.sessions.map((session) => (
                      <SelectItem key={session} value={session}>{session}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filters.subgroup} onValueChange={(value) => setFilters({...filters, subgroup: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar Subgrupo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {filters.store && <Badge variant="secondary">{filters.store}</Badge>}
                {filters.month && <Badge variant="secondary">{months.find(m => m.value === filters.month)?.label}</Badge>}
                {filters.year && <Badge variant="secondary">{filters.year}</Badge>}
                {filters.session && <Badge variant="secondary">{filters.session}</Badge>}
                {filters.subgroup && <Badge variant="secondary">{filters.subgroup}</Badge>}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="shadow-card border-0 bg-gradient-card">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Quantidade Total</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {totals.quantity.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-chart-1/10 rounded-full">
                  <Package className="h-4 w-4 sm:h-6 sm:w-6 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Valor Total (BRL)</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    R$ {totals.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-chart-2/10 rounded-full">
                  <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Lucro Total (BRL)</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    R$ {totals.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-chart-3/10 rounded-full">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Lojas Ativas</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {availableFilters.stores.length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-chart-4/10 rounded-full">
                  <Store className="h-4 w-4 sm:h-6 sm:w-6 text-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card className="shadow-card border-0 bg-gradient-card">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Compradores</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {totalBuyers}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-chart-5/10 rounded-full">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">% Lucro/Faturamento</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {profitMarginPercentage.toFixed(1)}%
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-chart-1/10 rounded-full">
                  <Calculator className="h-4 w-4 sm:h-6 sm:w-6 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total de Sessões</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {totalSessions}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-chart-2/10 rounded-full">
                  <Tags className="h-4 w-4 sm:h-6 sm:w-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card border-0 bg-gradient-card">
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total de Subgrupos</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {totalSubgroups}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-chart-3/10 rounded-full">
                  <Grid className="h-4 w-4 sm:h-6 sm:w-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <RevenueAndProfitChart data={filteredData} />
          <TopSubgroupsTable data={filteredData} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <QuantityChart data={filteredData} />
          <StoreDistributionChart data={filteredData} />
        </div>

        {/* Data Table */}
        <DataTable data={filteredData} />
      </div>
    </div>
  );
}