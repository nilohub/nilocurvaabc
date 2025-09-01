import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, BarChart3 } from "lucide-react";

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

interface AdvancedAnalyticsProps {
  data: SalesData[];
}

export function AdvancedAnalytics({ data }: AdvancedAnalyticsProps) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Análise mês a mês
  const monthlyData = data.reduce((acc, item) => {
    const monthIndex = parseInt(item.month) - 1;
    const monthName = monthNames[monthIndex] || `Mês ${item.month}`;
    
    if (!acc[monthName]) {
      acc[monthName] = { revenue: 0, profit: 0, quantity: 0 };
    }
    acc[monthName].revenue += item.value_brl || 0;
    acc[monthName].profit += item.profit_brl || 0;
    acc[monthName].quantity += item.quantity_sold || 0;
    return acc;
  }, {} as Record<string, { revenue: number; profit: number; quantity: number }>);

  const monthlyArray = monthNames.map(month => ({
    month,
    ...monthlyData[month] || { revenue: 0, profit: 0, quantity: 0 }
  })).filter(item => item.revenue > 0);

  // Growth rate calculation
  const growthRates = monthlyArray.map((current, index) => {
    if (index === 0) return { ...current, revenueGrowth: 0, profitGrowth: 0 };
    const previous = monthlyArray[index - 1];
    const revenueGrowth = previous.revenue > 0 ? ((current.revenue - previous.revenue) / previous.revenue) * 100 : 0;
    const profitGrowth = previous.profit > 0 ? ((current.profit - previous.profit) / previous.profit) * 100 : 0;
    return { ...current, revenueGrowth, profitGrowth };
  });

  // Performance por loja
  const storePerformance = data.reduce((acc, item) => {
    if (!acc[item.store]) {
      acc[item.store] = { revenue: 0, profit: 0, quantity: 0, margin: 0 };
    }
    acc[item.store].revenue += item.value_brl || 0;
    acc[item.store].profit += item.profit_brl || 0;
    acc[item.store].quantity += item.quantity_sold || 0;
    return acc;
  }, {} as Record<string, { revenue: number; profit: number; quantity: number; margin: number }>);

  // Calcular margem para cada loja
  Object.keys(storePerformance).forEach(store => {
    const data = storePerformance[store];
    data.margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
  });

  const topStores = Object.entries(storePerformance)
    .sort(([,a], [,b]) => b.revenue - a.revenue)
    .slice(0, 5);

  // Métricas gerais
  const totalRevenue = data.reduce((sum, item) => sum + (item.value_brl || 0), 0);
  const totalProfit = data.reduce((sum, item) => sum + (item.profit_brl || 0), 0);
  const totalQuantity = data.reduce((sum, item) => sum + (item.quantity_sold || 0), 0);
  const overallMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const averageTicket = totalQuantity > 0 ? totalRevenue / totalQuantity : 0;

  // Último mês com dados
  const lastMonth = growthRates[growthRates.length - 1];
  const previousMonth = growthRates[growthRates.length - 2];

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-primary border-0 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            {lastMonth && (
              <div className="flex items-center gap-1 mt-1">
                {lastMonth.revenueGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-200" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-200" />
                )}
                <span className={`text-sm ${lastMonth.revenueGrowth >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                  {lastMonth.revenueGrowth.toFixed(1)}% vs mês anterior
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-success border-0 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            {lastMonth && (
              <div className="flex items-center gap-1 mt-1">
                {lastMonth.profitGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-200" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-200" />
                )}
                <span className={`text-sm ${lastMonth.profitGrowth >= 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                  {lastMonth.profitGrowth.toFixed(1)}% vs mês anterior
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-info border-0 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMargin.toFixed(1)}%</div>
            <div className="flex items-center gap-1 mt-1">
              <Target className="w-4 h-4 text-blue-200" />
              <span className="text-sm text-blue-200">Margem geral</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-warning border-0 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <BarChart3 className="w-4 h-4 text-orange-200" />
              <span className="text-sm text-orange-200">Por unidade vendida</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Mês */}
      <Card className="bg-gradient-card border-0">
        <CardHeader>
          <CardTitle>Crescimento Mensal</CardTitle>
          <CardDescription>Comparativo de crescimento mês a mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {growthRates.slice(-6).map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                <div>
                  <h4 className="font-medium">{month.month}</h4>
                  <p className="text-sm text-muted-foreground">
                    R$ {month.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={month.revenueGrowth >= 0 ? "default" : "destructive"}>
                    {month.revenueGrowth >= 0 ? "+" : ""}{month.revenueGrowth.toFixed(1)}% Receita
                  </Badge>
                  <Badge variant={month.profitGrowth >= 0 ? "default" : "destructive"}>
                    {month.profitGrowth >= 0 ? "+" : ""}{month.profitGrowth.toFixed(1)}% Lucro
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Lojas */}
      <Card className="bg-gradient-card border-0">
        <CardHeader>
          <CardTitle>Top 5 Lojas por Performance</CardTitle>
          <CardDescription>Ranking das lojas por faturamento e margem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStores.map(([store, performance], index) => (
              <div key={store} className="flex items-center justify-between p-4 rounded-lg bg-card/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{store}</h4>
                    <p className="text-sm text-muted-foreground">
                      {performance.quantity.toLocaleString('pt-BR')} unidades vendidas
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    R$ {performance.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant={performance.margin >= overallMargin ? "default" : "secondary"}>
                    {performance.margin.toFixed(1)}% margem
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}