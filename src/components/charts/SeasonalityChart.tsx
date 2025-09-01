import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

interface SeasonalityChartProps {
  data: SalesData[];
}

export function SeasonalityChart({ data }: SeasonalityChartProps) {
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Group data by month for seasonality analysis
  const seasonalData = data.reduce((acc, item) => {
    const monthIndex = parseInt(item.month) - 1;
    const monthName = monthNames[monthIndex] || `Mês ${item.month}`;
    
    if (!acc[monthName]) {
      acc[monthName] = { revenue: 0, quantity: 0, count: 0 };
    }
    acc[monthName].revenue += item.value_brl || 0;
    acc[monthName].quantity += item.quantity_sold || 0;
    acc[monthName].count += 1;
    return acc;
  }, {} as Record<string, { revenue: number; quantity: number; count: number }>);

  // Calculate average values and normalize for seasonality index
  const totalRevenue = Object.values(seasonalData).reduce((sum, month) => sum + month.revenue, 0);
  const averageMonthlyRevenue = totalRevenue / Object.keys(seasonalData).length;

  const orderedData = monthNames.map(month => {
    const monthData = seasonalData[month];
    if (!monthData) {
      return {
        month,
        revenue: 0,
        quantity: 0,
        seasonalityIndex: 0
      };
    }
    
    const seasonalityIndex = averageMonthlyRevenue > 0 ? (monthData.revenue / averageMonthlyRevenue) * 100 : 0;
    
    return {
      month,
      revenue: monthData.revenue,
      quantity: monthData.quantity,
      seasonalityIndex
    };
  });

  const chartData = {
    labels: orderedData.map(d => d.month.slice(0, 3)), // Abbreviated month names
    datasets: [
      {
        label: 'Faturamento',
        data: orderedData.map(d => d.revenue),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'hsl(var(--primary))',
        pointBorderColor: 'hsl(var(--background))',
        pointBorderWidth: 2,
        pointRadius: 6,
        yAxisID: 'y',
      },
      {
        label: 'Índice de Sazonalidade (%)',
        data: orderedData.map(d => d.seasonalityIndex),
        borderColor: 'hsl(var(--accent))',
        backgroundColor: 'hsl(var(--accent) / 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'hsl(var(--accent))',
        pointBorderColor: 'hsl(var(--background))',
        pointBorderWidth: 2,
        pointRadius: 4,
        yAxisID: 'y1',
        borderDash: [5, 5],
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
            const dataIndex = context.dataIndex;
            const monthData = orderedData[dataIndex];
            
            if (context.datasetIndex === 0) {
              return `Faturamento: R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
            } else {
              return `Índice: ${context.parsed.y.toFixed(1)}% (${monthData.seasonalityIndex > 100 ? 'Acima' : 'Abaixo'} da média)`;
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
          }
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
            return `${value.toFixed(0)}%`;
          }
        },
        border: {
          color: 'hsl(var(--border))'
        }
      },
    }
  };

  // Find best and worst performing months
  const bestMonth = orderedData.reduce((best, current) => 
    current.seasonalityIndex > best.seasonalityIndex ? current : best
  );
  const worstMonth = orderedData.reduce((worst, current) => 
    current.seasonalityIndex < worst.seasonalityIndex ? current : worst
  );

  return (
    <Card className="bg-gradient-card border-0">
      <CardHeader>
        <CardTitle>Análise de Sazonalidade</CardTitle>
        <CardDescription>
          Padrões sazonais de faturamento e índice de performance por mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ position: 'relative', height: '400px' }}>
          <Line data={chartData} options={options} />
        </div>
        
        {/* Insights */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
            <h4 className="font-medium text-emerald-800 dark:text-emerald-200 mb-2">
              Melhor Mês
            </h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              {bestMonth.month}: {bestMonth.seasonalityIndex.toFixed(1)}% acima da média
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              R$ {bestMonth.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} faturamento
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              Mês Mais Fraco
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300">
              {worstMonth.month}: {(100 - worstMonth.seasonalityIndex).toFixed(1)}% abaixo da média
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              R$ {worstMonth.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} faturamento
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}