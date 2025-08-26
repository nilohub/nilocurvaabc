import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
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

interface ProfitChartProps {
  data: SalesData[];
}

export function ProfitChart({ data }: ProfitChartProps) {
  const months = [
    { value: "01", label: "Jan" },
    { value: "02", label: "Fev" },
    { value: "03", label: "Mar" },
    { value: "04", label: "Abr" },
    { value: "05", label: "Mai" },
    { value: "06", label: "Jun" },
    { value: "07", label: "Jul" },
    { value: "08", label: "Ago" },
    { value: "09", label: "Set" },
    { value: "10", label: "Out" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dez" }
  ];

  // Group data by month and sum profit
  const groupedData = data.reduce((acc, item) => {
    const key = item.month;
    if (!acc[key]) {
      acc[key] = { profit: 0, profitPercentage: 0, count: 0 };
    }
    acc[key].profit += item.profit_brl || 0;
    acc[key].profitPercentage += item.profit_percentage || 0;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, { profit: number; profitPercentage: number; count: number }>);

  // Calculate average profit percentage
  Object.keys(groupedData).forEach(month => {
    if (groupedData[month].count > 0) {
      groupedData[month].profitPercentage /= groupedData[month].count;
    }
  });

  const labels = months.filter(m => groupedData[m.value]).map(m => m.label);
  const profitData = months.filter(m => groupedData[m.value]).map(m => groupedData[m.value].profit);
  const profitPercentageData = months.filter(m => groupedData[m.value]).map(m => groupedData[m.value].profitPercentage);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Lucro (BRL)',
        data: profitData,
        borderColor: 'hsl(39 84% 56%)',
        backgroundColor: 'hsl(39 84% 56% / 0.1)',
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: '% Lucro Médio',
        data: profitPercentageData,
        borderColor: 'hsl(343 75% 51%)',
        backgroundColor: 'hsl(343 75% 51% / 0.1)',
        tension: 0.4,
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
            if (context.datasetIndex === 0) {
              label += 'R$ ' + context.formattedValue;
            } else {
              label += context.formattedValue + '%';
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
          text: 'Meses'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Lucro (BRL)'
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: '% Lucro'
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
        <CardTitle>Evolução do Lucro</CardTitle>
        <CardDescription>
          Análise temporal do lucro em BRL e percentual médio por mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}