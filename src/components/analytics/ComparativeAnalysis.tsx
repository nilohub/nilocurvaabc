import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ComposedChart, Area, AreaChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart3, TrendingUp, Calendar, Users } from "lucide-react";

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

interface ComparativeAnalysisProps {
  data: SalesData[];
}

const chartConfig = {
  value: {
    label: "Faturamento",
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
  margin: {
    label: "Margem %",
    color: "hsl(var(--chart-4))",
  },
};

export function ComparativeAnalysis({ data }: ComparativeAnalysisProps) {
  // Análise comparativa por mês
  const monthlyComparison = data.reduce((acc, item) => {
    const monthKey = `${item.month.padStart(2, '0')}/2024`;
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        value: 0,
        profit: 0,
        quantity: 0,
        margin: 0,
        count: 0
      };
    }
    acc[monthKey].value += item.value_brl;
    acc[monthKey].profit += item.profit_brl;
    acc[monthKey].quantity += item.quantity_sold;
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, any>);

  const monthlyData = Object.values(monthlyComparison).map((month: any) => ({
    ...month,
    margin: month.value > 0 ? (month.profit / month.value) * 100 : 0
  })).sort((a: any, b: any) => a.month.localeCompare(b.month));

  // Top 10 subgrupos por faturamento
  const subgroupComparison = data.reduce((acc, item) => {
    if (!acc[item.subgroup]) {
      acc[item.subgroup] = {
        subgroup: item.subgroup,
        value: 0,
        profit: 0,
        quantity: 0,
        margin: 0
      };
    }
    acc[item.subgroup].value += item.value_brl;
    acc[item.subgroup].profit += item.profit_brl;
    acc[item.subgroup].quantity += item.quantity_sold;
    return acc;
  }, {} as Record<string, any>);

  const topSubgroups = Object.values(subgroupComparison)
    .map((sg: any) => ({
      ...sg,
      margin: sg.value > 0 ? (sg.profit / sg.value) * 100 : 0
    }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 10);

  // Análise comparativa por sessão
  const sessionComparison = data.reduce((acc, item) => {
    if (!acc[item.session]) {
      acc[item.session] = {
        session: item.session,
        value: 0,
        profit: 0,
        quantity: 0,
        margin: 0,
        stores: new Set()
      };
    }
    acc[item.session].value += item.value_brl;
    acc[item.session].profit += item.profit_brl;
    acc[item.session].quantity += item.quantity_sold;
    acc[item.session].stores.add(item.store);
    return acc;
  }, {} as Record<string, any>);

  const sessionData = Object.values(sessionComparison)
    .map((session: any) => ({
      ...session,
      margin: session.value > 0 ? (session.profit / session.value) * 100 : 0,
      storeCount: session.stores.size
    }))
    .sort((a: any, b: any) => b.value - a.value)
    .slice(0, 8);

  // Métricas de comparação
  const currentMonthData = monthlyData[monthlyData.length - 1];
  const previousMonthData = monthlyData[monthlyData.length - 2];
  
  const valueGrowth = previousMonthData && currentMonthData 
    ? ((currentMonthData.value - previousMonthData.value) / previousMonthData.value) * 100
    : 0;

  const profitGrowth = previousMonthData && currentMonthData
    ? ((currentMonthData.profit - previousMonthData.profit) / previousMonthData.profit) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Métricas de Crescimento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crescimento Mensal</p>
                <p className={`text-xl font-bold ${valueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {valueGrowth >= 0 ? '+' : ''}{valueGrowth.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-chart-1" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Evolução Lucro</p>
                <p className={`text-xl font-bold ${profitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitGrowth >= 0 ? '+' : ''}{profitGrowth.toFixed(1)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-chart-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessões Ativas</p>
                <p className="text-xl font-bold text-foreground">
                  {sessionData.length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-chart-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Subgrupos</p>
                <p className="text-xl font-bold text-foreground">
                  {Object.keys(subgroupComparison).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-chart-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análises Comparativas */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise Comparativa Detalhada
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="monthly">Por Mês</TabsTrigger>
              <TabsTrigger value="subgroups">Por Subgrupo</TabsTrigger>
              <TabsTrigger value="sessions">Por Sessão</TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="space-y-4">
              <div className="h-80">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar yAxisId="left" dataKey="value" fill="hsl(var(--chart-1))" />
                      <Bar yAxisId="left" dataKey="profit" fill="hsl(var(--chart-2))" />
                      <Area 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="margin" 
                        stroke="hsl(var(--chart-4))" 
                        fill="hsl(var(--chart-4))" 
                        fillOpacity={0.3}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </TabsContent>

            <TabsContent value="subgroups" className="space-y-4">
              <div className="h-80">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSubgroups} layout="horizontal">
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis 
                        type="category" 
                        dataKey="subgroup" 
                        tick={{ fontSize: 10 }} 
                        width={100}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {topSubgroups.slice(0, 6).map((sg: any, index) => (
                  <div key={sg.subgroup} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm truncate">{sg.subgroup}</h4>
                      <Badge variant={sg.margin > 20 ? "default" : sg.margin > 15 ? "secondary" : "outline"}>
                        {sg.margin.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Faturamento: R$ {sg.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p>Quantidade: {sg.quantity.toLocaleString('pt-BR')} un.</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <div className="h-80">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sessionData}>
                      <XAxis 
                        dataKey="session" 
                        tick={{ fontSize: 10 }} 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="profit" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {sessionData.slice(0, 6).map((session: any, index) => (
                  <div key={session.session} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{session.session}</h4>
                      <Badge variant="outline">
                        {session.storeCount} {session.storeCount === 1 ? 'loja' : 'lojas'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Faturamento: R$ {session.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p>Margem: {session.margin.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}