import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

interface GroupPerformanceComparisonProps {
  data: SalesData[];
}

export function GroupPerformanceComparison({ data }: GroupPerformanceComparisonProps) {
  // Group performance analysis
  const groupPerformance = data.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = {
        revenue: 0,
        profit: 0,
        quantity: 0,
        margin: 0,
        efficiency: 0
      };
    }
    acc[item.group].revenue += item.value_brl || 0;
    acc[item.group].profit += item.profit_brl || 0;
    acc[item.group].quantity += item.quantity_sold || 0;
    return acc;
  }, {} as Record<string, { revenue: number; profit: number; quantity: number; margin: number; efficiency: number }>);

  // Calculate derived metrics
  Object.keys(groupPerformance).forEach(group => {
    const data = groupPerformance[group];
    data.margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
    data.efficiency = data.quantity > 0 ? data.profit / data.quantity : 0; // Profit per unit
  });

  const groups = Object.keys(groupPerformance);
  const revenues = Object.values(groupPerformance).map(g => g.revenue);
  const profits = Object.values(groupPerformance).map(g => g.profit);
  const margins = Object.values(groupPerformance).map(g => g.margin);

  const chartData = {
    labels: groups,
    datasets: [
      {
        label: 'Faturamento (R$)',
        data: revenues,
        backgroundColor: 'hsl(var(--primary) / 0.8)',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Lucro (R$)',
        data: profits,
        backgroundColor: 'hsl(var(--accent) / 0.8)',
        borderColor: 'hsl(var(--accent))',
        borderWidth: 1,
        yAxisID: 'y',
      }
    ]
  };

  const options = {
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'hsl(var(--muted-foreground))',
          usePointStyle: true,
          padding: 16,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const groupData = groupPerformance[context.label];
            
            if (context.datasetIndex === 0) {
              return `Faturamento: R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            } else {
              return [
                `Lucro: R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                `Margem: ${groupData.margin.toFixed(1)}%`,
                `Eficiência: R$ ${groupData.efficiency.toFixed(2)}/unidade`,
                `Volume: ${groupData.quantity.toLocaleString('pt-BR')} unidades`
              ];
            }
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11
          },
          maxRotation: 45,
        },
        grid: {
          display: false
        },
        border: {
          color: 'hsl(var(--border))'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return `R$ ${value.toLocaleString('pt-BR')}`;
          }
        },
        grid: {
          color: 'hsl(var(--border) / 0.1)'
        },
        border: {
          color: 'hsl(var(--border))'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return `${value.toFixed(1)}%`;
          }
        },
        border: {
          color: 'hsl(var(--border))'
        }
      },
    }
  };

  // Insights
  const bestGroup = Object.entries(groupPerformance).reduce((best, [group, data]) => 
    data.margin > best[1].margin ? [group, data] : best
  );

  const biggestGroup = Object.entries(groupPerformance).reduce((biggest, [group, data]) => 
    data.revenue > biggest[1].revenue ? [group, data] : biggest
  );

  const mostEfficient = Object.entries(groupPerformance).reduce((efficient, [group, data]) => 
    data.efficiency > efficient[1].efficiency ? [group, data] : efficient
  );

  return (
    <Card className="bg-gradient-card border-0">
      <CardHeader>
        <CardTitle>Performance por Grupo de Produtos</CardTitle>
        <CardDescription>
          Comparativo de faturamento, lucro e margem por categoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ position: 'relative', height: '400px' }}>
          <Bar data={chartData} options={options} />
        </div>
        
        {/* Performance Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">
              Maior Margem
            </h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {bestGroup[0]}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              {bestGroup[1].margin.toFixed(1)}% de margem
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Maior Volume
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {biggestGroup[0]}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              R$ {biggestGroup[1].revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
              Mais Eficiente
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {mostEfficient[0]}
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              R$ {mostEfficient[1].efficiency.toFixed(2)} lucro/unidade
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}