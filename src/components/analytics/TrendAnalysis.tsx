import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from "recharts";

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

interface TrendAnalysisProps {
  data: SalesData[];
}

const chartConfig = {
  value: {
    label: "Valor",
    color: "hsl(var(--chart-1))",
  },
  profit: {
    label: "Lucro",
    color: "hsl(var(--chart-2))",
  },
  quantity: {
    label: "Quantidade",
    color: "hsl(var(--chart-3))",
  },
};

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  // Agrupar dados por mês para análise de tendência
  const monthlyData = data.reduce((acc, item) => {
    const monthKey = `${item.month}/2024`;
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        value: 0,
        profit: 0,
        quantity: 0,
        count: 0
      };
    }
    acc[monthKey].value += item.value_brl;
    acc[monthKey].profit += item.profit_brl;
    acc[monthKey].quantity += item.quantity_sold;
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const trendData = Object.values(monthlyData)
    .sort((a: any, b: any) => a.month.localeCompare(b.month))
    .slice(-6); // Últimos 6 meses

  // Calcular crescimento
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const currentMonth = trendData[trendData.length - 1];
  const previousMonth = trendData[trendData.length - 2];

  const valueGrowth = previousMonth ? calculateGrowth(currentMonth?.value || 0, previousMonth?.value || 0) : 0;
  const profitGrowth = previousMonth ? calculateGrowth(currentMonth?.profit || 0, previousMonth?.profit || 0) : 0;
  const quantityGrowth = previousMonth ? calculateGrowth(currentMonth?.quantity || 0, previousMonth?.quantity || 0) : 0;

  const getTrendIcon = (growth: number) => {
    if (growth > 5) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (growth < -5) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
  };

  const getTrendColor = (growth: number) => {
    if (growth > 5) return "text-green-500";
    if (growth < -5) return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tendência de Vendas */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Análise de Tendência - Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-4">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--chart-1))" 
                    fill="hsl(var(--chart-1))" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="hsl(var(--chart-2))" 
                    fill="hsl(var(--chart-2))" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {getTrendIcon(valueGrowth)}
                <span className="text-sm font-medium">Faturamento</span>
              </div>
              <p className={`text-lg font-bold ${getTrendColor(valueGrowth)}`}>
                {valueGrowth > 0 ? '+' : ''}{valueGrowth.toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {getTrendIcon(profitGrowth)}
                <span className="text-sm font-medium">Lucro</span>
              </div>
              <p className={`text-lg font-bold ${getTrendColor(profitGrowth)}`}>
                {profitGrowth > 0 ? '+' : ''}{profitGrowth.toFixed(1)}%
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {getTrendIcon(quantityGrowth)}
                <span className="text-sm font-medium">Volume</span>
              </div>
              <p className={`text-lg font-bold ${getTrendColor(quantityGrowth)}`}>
                {quantityGrowth > 0 ? '+' : ''}{quantityGrowth.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance por Sessão */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance por Sessão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.values(data.reduce((acc, item) => {
              if (!acc[item.session]) {
                acc[item.session] = {
                  session: item.session,
                  totalValue: 0,
                  totalProfit: 0,
                  totalQuantity: 0
                };
              }
              acc[item.session].totalValue += item.value_brl;
              acc[item.session].totalProfit += item.profit_brl;
              acc[item.session].totalQuantity += item.quantity_sold;
              return acc;
            }, {} as Record<string, any>))
            .sort((a: any, b: any) => b.totalValue - a.totalValue)
            .slice(0, 8)
            .map((session: any, index: number) => {
              const profitMargin = session.totalValue > 0 ? (session.totalProfit / session.totalValue) * 100 : 0;
              return (
                <div key={session.session} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full bg-chart-${(index % 5) + 1}`} />
                    <div>
                      <p className="font-medium text-sm">{session.session}</p>
                      <p className="text-xs text-muted-foreground">
                        {session.totalQuantity.toLocaleString('pt-BR')} unidades
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      R$ {session.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant={profitMargin > 20 ? "default" : profitMargin > 10 ? "secondary" : "destructive"}>
                      {profitMargin.toFixed(1)}% lucro
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}