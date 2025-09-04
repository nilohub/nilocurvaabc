import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Brain, Award, AlertTriangle, Zap, Target, Star } from "lucide-react";

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

interface PerformanceInsightsProps {
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
  performance: {
    label: "Performance",
    color: "hsl(var(--chart-4))",
  },
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))"
];

export function PerformanceInsights({ data }: PerformanceInsightsProps) {
  // Análise de performance por loja
  const storePerformance = data.reduce((acc, item) => {
    if (!acc[item.store]) {
      acc[item.store] = {
        store: item.store,
        totalValue: 0,
        totalProfit: 0,
        totalQuantity: 0,
        avgProfitMargin: 0,
        count: 0
      };
    }
    acc[item.store].totalValue += item.value_brl;
    acc[item.store].totalProfit += item.profit_brl;
    acc[item.store].totalQuantity += item.quantity_sold;
    acc[item.store].count += 1;
    return acc;
  }, {} as Record<string, any>);

  // Calcular margem de lucro média por loja
  Object.values(storePerformance).forEach((store: any) => {
    store.avgProfitMargin = store.totalValue > 0 ? (store.totalProfit / store.totalValue) * 100 : 0;
  });

  const topStores = Object.values(storePerformance)
    .sort((a: any, b: any) => b.totalValue - a.totalValue)
    .slice(0, 5);

  // Análise de subgrupos mais lucrativos
  const subgroupAnalysis = data.reduce((acc, item) => {
    if (!acc[item.subgroup]) {
      acc[item.subgroup] = {
        subgroup: item.subgroup,
        totalValue: 0,
        totalProfit: 0,
        profitMargin: 0
      };
    }
    acc[item.subgroup].totalValue += item.value_brl;
    acc[item.subgroup].totalProfit += item.profit_brl;
    return acc;
  }, {} as Record<string, any>);

  Object.values(subgroupAnalysis).forEach((sg: any) => {
    sg.profitMargin = sg.totalValue > 0 ? (sg.totalProfit / sg.totalValue) * 100 : 0;
  });

  const topSubgroups = Object.values(subgroupAnalysis)
    .sort((a: any, b: any) => b.profitMargin - a.profitMargin)
    .slice(0, 5);

  // Insights automáticos
  const totalValue = data.reduce((sum, item) => sum + item.value_brl, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.profit_brl, 0);
  const avgProfitMargin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0;

  const insights = [
    {
      type: "success",
      icon: Award,
      title: "Melhor Performance",
      description: `Loja ${topStores[0]?.store} lidera em faturamento com R$ ${topStores[0]?.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    },
    {
      type: "info",
      icon: Target,
      title: "Margem de Lucro",
      description: `Margem média de ${avgProfitMargin.toFixed(1)}% - ${avgProfitMargin > 15 ? 'Excelente' : avgProfitMargin > 10 ? 'Boa' : 'Pode melhorar'}`
    },
    {
      type: "warning",
      icon: Zap,
      title: "Oportunidade",
      description: `Subgrupo "${topSubgroups[0]?.subgroup}" tem a maior margem de lucro (${topSubgroups[0]?.profitMargin.toFixed(1)}%)`
    },
    {
      type: "alert",
      icon: AlertTriangle,
      title: "Atenção",
      description: `${Object.values(storePerformance).filter((store: any) => store.avgProfitMargin < 10).length} lojas com margem abaixo de 10%`
    }
  ];

  // Dados para gráfico de distribuição de vendas
  const distributionData = topStores.map((store, index) => ({
    name: store.store,
    value: store.totalValue,
    fill: COLORS[index % COLORS.length]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Insights Inteligentes */}
      <Card className="shadow-card border-0 lg:col-span-1 bg-gradient-card hover:shadow-lg transition-all duration-300 animate-fade-in">
        <CardHeader className="bg-gradient-success text-success-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="h-5 w-5" />
            Insights Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  insight.type === 'success' ? 'bg-green-100 text-green-600' :
                  insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                  insight.type === 'alert' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <insight.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ranking de Lojas */}
      <Card className="shadow-card border-0 bg-gradient-card hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="h-5 w-5" />
            Ranking de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topStores.map((store: any, index) => (
              <div key={store.store} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">{store.store}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">
                      R$ {store.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant={store.avgProfitMargin > 15 ? "default" : store.avgProfitMargin > 10 ? "secondary" : "destructive"}>
                      {store.avgProfitMargin.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={(store.totalValue / topStores[0].totalValue) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição de Vendas */}
      <Card className="shadow-card border-0 bg-gradient-card hover:shadow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <CardHeader className="bg-gradient-chart text-primary-foreground rounded-t-lg">
          <CardTitle className="text-white">Distribuição de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-sm text-muted-foreground">
                              R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          <div className="mt-4 space-y-2">
            {distributionData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="flex-1">{item.name}</span>
                <span className="font-medium">
                  {((item.value / totalValue) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}