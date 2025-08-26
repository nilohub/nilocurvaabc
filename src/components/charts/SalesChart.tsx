import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

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

interface SalesChartProps {
  data: SalesData[];
}

export function SalesChart({ data }: SalesChartProps) {
  // Group data by subgroup and sum values
  const groupedData = data.reduce((acc, item) => {
    const key = item.subgroup;
    if (!acc[key]) {
      acc[key] = { quantity: 0, value: 0 };
    }
    acc[key].quantity += item.quantity_sold || 0;
    acc[key].value += item.value_brl || 0;
    return acc;
  }, {} as Record<string, { quantity: number; value: number }>);

  const labels = Object.keys(groupedData);
  const quantityData = labels.map(label => groupedData[label].quantity);
  const valueData = labels.map(label => groupedData[label].value);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Quantidade Vendida',
        data: quantityData,
        backgroundColor: 'hsl(268 71% 50% / 0.8)',
        borderColor: 'hsl(268 71% 50%)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        label: 'Valor (BRL)',
        data: valueData,
        backgroundColor: 'hsl(204 94% 44% / 0.8)',
        borderColor: 'hsl(204 94% 44%)',
        borderWidth: 1,
        yAxisID: 'y1',
      },
    ],
  };

  const options = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.datasetIndex === 1) {
              label += 'R$ ' + context.formattedValue;
            } else {
              label += context.formattedValue;
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Subgrupos'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Quantidade'
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Valor (BRL)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <CardTitle>Vendas por Subgrupo</CardTitle>
        <CardDescription>
          Comparação de quantidade vendida e valor em BRL por subgrupo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}