import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required Chart.js components
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

interface StoreDistributionChartProps {
  data: SalesData[];
}

export function StoreDistributionChart({ data }: StoreDistributionChartProps) {
  // Group data by store and calculate totals
  const storeData = data.reduce((acc, item) => {
    if (!acc[item.store]) {
      acc[item.store] = {
        value: 0,
        count: 0
      };
    }
    acc[item.store].value += item.value_brl || 0;
    acc[item.store].count += 1;
    return acc;
  }, {} as Record<string, { value: number; count: number }>);

  const totalValue = Object.values(storeData).reduce((sum, store) => sum + store.value, 0);
  
  // Calculate percentages and prepare data
  const storePercentages = Object.entries(storeData).map(([store, data]) => ({
    store,
    value: data.value,
    percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0
  }));

  // Sort by percentage for consistent ordering
  storePercentages.sort((a, b) => b.percentage - a.percentage);

  // Color palette for stores
  const colors = [
    'rgba(99, 102, 241, 0.8)',   // Blue
    'rgba(34, 197, 94, 0.8)',    // Green
    'rgba(168, 85, 247, 0.8)',   // Purple
    'rgba(239, 68, 68, 0.8)',    // Red
    'rgba(245, 158, 11, 0.8)',   // Yellow
    'rgba(20, 184, 166, 0.8)',   // Teal
  ];

  const borderColors = [
    'rgba(99, 102, 241, 1)',
    'rgba(34, 197, 94, 1)',
    'rgba(168, 85, 247, 1)',
    'rgba(239, 68, 68, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(20, 184, 166, 1)',
  ];

  const chartData = {
    labels: storePercentages.map(item => item.store),
    datasets: [
      {
        data: storePercentages.map(item => item.percentage),
        backgroundColor: colors.slice(0, storePercentages.length),
        borderColor: borderColors.slice(0, storePercentages.length),
        borderWidth: 2,
        hoverBorderWidth: 3,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: 'hsl(var(--muted-foreground))',
          usePointStyle: true,
          padding: 16,
          font: {
            size: 11
          },
          generateLabels: function(chart: any) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const percentage = storePercentages[i]?.percentage || 0;
                const value = storePercentages[i]?.value || 0;
                return {
                  text: `${label} (${percentage.toFixed(1)}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].borderColor[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
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
            const store = storePercentages[context.dataIndex];
            return [
              `${context.label}: ${context.parsed.toFixed(1)}%`,
              `Faturamento: R$ ${store.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            ];
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-card">
      <CardHeader>
        <CardTitle>Distribuição por Loja</CardTitle>
        <CardDescription>
          Percentual de faturamento por loja
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ position: 'relative', height: '400px' }}>
          <Pie data={chartData} options={options} />
        </div>
        {storePercentages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum dado disponível para exibir</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}