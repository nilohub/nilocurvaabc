import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
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

interface QuantityChartProps {
  data: SalesData[];
}

export function QuantityChart({ data }: QuantityChartProps) {
  // Define months in correct order
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Group data by month and sum quantities
  const groupedData = data.reduce((acc, item) => {
    const monthIndex = parseInt(item.month) - 1;
    const monthName = monthNames[monthIndex] || `Mês ${item.month}`;
    
    if (!acc[monthName]) {
      acc[monthName] = 0;
    }
    acc[monthName] += item.quantity_sold || 0;
    return acc;
  }, {} as Record<string, number>);

  // Ensure all months are included in correct order
  const orderedData = monthNames.map(month => ({
    month,
    value: groupedData[month] || 0
  }));

  const chartData = {
    labels: orderedData.map(d => d.month),
    datasets: [
      {
        label: 'Quantidade Vendida',
        data: orderedData.map(d => d.value),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const options = {
    maintainAspectRatio: false,
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
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString('pt-BR')} unidades`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          font: {
            size: 11
          },
          callback: function(value: any) {
            return `${value.toLocaleString('pt-BR')}`;
          }
        },
        grid: {
          display: false
        },
        border: {
          color: 'hsl(var(--border))'
        }
      },
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
      }
    }
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-card">
      <CardHeader>
        <CardTitle>Vendas em Quantidade</CardTitle>
        <CardDescription>
          Quantidade total vendida por mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ position: 'relative', height: '400px' }}>
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}