import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Line } from 'react-chartjs-2';
import { useState } from 'react';
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

// Register required Chart.js components
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

interface ProfitBRLChartProps {
  data: SalesData[];
}

export function ProfitBRLChart({ data }: ProfitBRLChartProps) {
  const [chartType, setChartType] = useState<'value' | 'percentage'>('value');
  
  // Define months in correct order
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Group data by month and sum profit and revenue
  const groupedData = data.reduce((acc, item) => {
    const monthIndex = parseInt(item.month) - 1;
    const monthName = monthNames[monthIndex] || `Mês ${item.month}`;
    
    if (!acc[monthName]) {
      acc[monthName] = { profit: 0, revenue: 0 };
    }
    acc[monthName].profit += item.profit_brl || 0;
    acc[monthName].revenue += item.value_brl || 0;
    return acc;
  }, {} as Record<string, { profit: number; revenue: number }>);

  // Ensure all months are included in correct order and calculate percentage
  const orderedData = monthNames.map(month => {
    const monthData = groupedData[month] || { profit: 0, revenue: 0 };
    const percentage = monthData.revenue > 0 ? (monthData.profit / monthData.revenue) * 100 : 0;
    
    return {
      month,
      value: monthData.profit,
      percentage: percentage
    };
  });

  const chartData = {
    labels: orderedData.map(d => d.month),
    datasets: [
      {
        label: chartType === 'value' ? 'Lucro (BRL)' : 'Lucro (%)',
        data: orderedData.map(d => chartType === 'value' ? d.value : d.percentage),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
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
            const dataIndex = context.dataIndex;
            const percentage = orderedData[dataIndex]?.percentage || 0;
            const value = orderedData[dataIndex]?.value || 0;
            
            if (chartType === 'value') {
              return [
                `${context.dataset.label}: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                `% Lucro/Faturamento: ${percentage.toFixed(1)}%`
              ];
            } else {
              return [
                `${context.dataset.label}: ${percentage.toFixed(1)}%`,
                `Lucro: R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              ];
            }
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
            if (chartType === 'value') {
              return `R$ ${value.toLocaleString('pt-BR')}`;
            } else {
              return `${value.toFixed(1)}%`;
            }
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{chartType === 'value' ? 'Lucro em BRL' : 'Lucro em %'}</CardTitle>
            <CardDescription>
              {chartType === 'value' 
                ? 'Lucro total por mês em Reais Brasileiros'
                : 'Percentual de lucro por mês'
              }
            </CardDescription>
          </div>
          <Select value={chartType} onValueChange={(value: 'value' | 'percentage') => setChartType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Lucro BRL</SelectItem>
              <SelectItem value="percentage">% Lucro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ position: 'relative', height: '400px' }}>
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}