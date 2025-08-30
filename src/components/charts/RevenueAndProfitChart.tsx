import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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

interface RevenueAndProfitChartProps {
  data: SalesData[];
}

export function RevenueAndProfitChart({ data }: RevenueAndProfitChartProps) {
  // Define months in correct order
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Group data by month and sum revenue and profit
  const groupedData = data.reduce((acc, item) => {
    const monthIndex = parseInt(item.month) - 1;
    const monthName = monthNames[monthIndex] || `Mês ${item.month}`;
    
    if (!acc[monthName]) {
      acc[monthName] = { revenue: 0, profit: 0 };
    }
    acc[monthName].revenue += item.value_brl || 0;
    acc[monthName].profit += item.profit_brl || 0;
    return acc;
  }, {} as Record<string, { revenue: number; profit: number }>);

  // Ensure all months are included in correct order
  const orderedData = monthNames.map(month => ({
    month,
    revenue: groupedData[month]?.revenue || 0,
    profit: groupedData[month]?.profit || 0
  }));

  const chartData = {
    labels: orderedData.map(d => d.month),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Faturamento (BRL)',
        data: orderedData.map(d => d.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Lucro (BRL)',
        data: orderedData.map(d => d.profit),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        yAxisID: 'y1',
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
            return `${context.dataset.label}: R$ ${context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
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
        title: {
          display: true,
          text: 'Faturamento (BRL)',
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 12
          }
        },
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
          color: 'hsl(var(--border))',
          display: true
        },
        border: {
          color: 'hsl(var(--border))'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Lucro (BRL)',
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 12
          }
        },
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
          display: false
        },
        border: {
          color: 'hsl(var(--border))'
        }
      }
    }
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-card">
      <CardHeader>
        <CardTitle>Faturamento e Lucro por Mês</CardTitle>
        <CardDescription>
          Comparativo mensal entre faturamento e lucro em Reais Brasileiros
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ position: 'relative', height: '400px' }}>
          <Chart type="line" data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}