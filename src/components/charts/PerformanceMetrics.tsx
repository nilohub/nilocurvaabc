import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

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

interface PerformanceMetricsProps {
  data: SalesData[];
}

export function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  // Group data by store and sum values
  const storeData = data.reduce((acc, item) => {
    const key = item.store;
    if (!acc[key]) {
      acc[key] = { value: 0, profit: 0 };
    }
    acc[key].value += item.value_brl || 0;
    acc[key].profit += item.profit_brl || 0;
    return acc;
  }, {} as Record<string, { value: number; profit: number }>);

  const storeLabels = Object.keys(storeData);
  const storeValues = storeLabels.map(label => storeData[label].value);
  const storeProfits = storeLabels.map(label => storeData[label].profit);

  // Chart colors
  const colors = [
    'hsl(268 71% 50%)',
    'hsl(204 94% 44%)', 
    'hsl(39 84% 56%)',
    'hsl(343 75% 51%)',
    'hsl(27 87% 67%)',
    'hsl(142 76% 36%)',
    'hsl(262 52% 47%)',
    'hsl(221 83% 53%)'
  ];

  const valueChartData = {
    labels: storeLabels,
    datasets: [
      {
        label: 'Vendas por Loja (BRL)',
        data: storeValues,
        backgroundColor: colors.map(color => color.replace(')', ' / 0.8)')),
        borderColor: colors,
        borderWidth: 2,
      },
    ],
  };

  const profitChartData = {
    labels: storeLabels,
    datasets: [
      {
        label: 'Lucro por Loja (BRL)',
        data: storeProfits,
        backgroundColor: colors.map(color => color.replace(')', ' / 0.8)')),
        borderColor: colors,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = 'R$ ' + context.formattedValue;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  // Calculate top performers
  const topStoreByValue = storeLabels.reduce((max, store) => 
    storeData[store].value > storeData[max]?.value ? store : max, storeLabels[0]
  );
  
  const topStoreByProfit = storeLabels.reduce((max, store) => 
    storeData[store].profit > storeData[max]?.profit ? store : max, storeLabels[0]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Distribuição de Vendas</CardTitle>
          <CardDescription>
            Participação de cada loja no total de vendas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut data={valueChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Distribuição de Lucro</CardTitle>
          <CardDescription>
            Participação de cada loja no total de lucro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Doughnut data={profitChartData} options={chartOptions} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>
            Destaques por vendas e lucro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Maior Volume de Vendas</h4>
            <div className="flex items-center justify-between">
              <span className="font-medium">{topStoreByValue}</span>
              <span className="text-sm font-bold text-chart-2">
                R$ {storeData[topStoreByValue]?.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Maior Lucro</h4>
            <div className="flex items-center justify-between">
              <span className="font-medium">{topStoreByProfit}</span>
              <span className="text-sm font-bold text-chart-3">
                R$ {storeData[topStoreByProfit]?.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">Estatísticas Gerais</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total de Lojas:</span>
                <span className="font-medium">{storeLabels.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total de Registros:</span>
                <span className="font-medium">{data.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Ticket Médio:</span>
                <span className="font-medium">
                  R$ {data.length > 0 ? (storeValues.reduce((a, b) => a + b, 0) / data.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}