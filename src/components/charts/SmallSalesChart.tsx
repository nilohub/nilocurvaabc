import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartOptions
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
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

interface SmallSalesChartProps {
  data: SalesData[];
  storeName: string;
}

export function SmallSalesChart({ data, storeName }: SmallSalesChartProps) {
  // Filter data for this specific store
  const storeData = data.filter(item => item.store === storeName);
  
  // Group data by month and calculate quantity sold
  const monthlyQuantity = storeData.reduce((acc, item) => {
    const month = item.month;
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += item.quantity_sold || 0;
    return acc;
  }, {} as Record<string, number>);

  // Sort months and prepare data for chart
  const sortedMonths = Object.keys(monthlyQuantity).sort();
  const quantityValues = sortedMonths.map(month => monthlyQuantity[month]);

  const chartData = {
    labels: sortedMonths.map(month => {
      const monthNames = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return monthNames[parseInt(month)];
    }),
    datasets: [
      {
        data: quantityValues,
        borderColor: "hsl(var(--destructive))",
        backgroundColor: "hsl(var(--destructive) / 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        titleColor: "hsl(var(--popover-foreground))",
        bodyColor: "hsl(var(--popover-foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: function(tooltipItems) {
            return `${storeName}`;
          },
          label: function(context) {
            return `Vendas: ${context.parsed.y.toLocaleString('pt-BR')} unidades`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          font: {
            size: 10
          }
        }
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: "hsl(var(--border))"
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          font: {
            size: 10
          },
          callback: function(value) {
            return Number(value).toLocaleString('pt-BR') + ' un';
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="h-32 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}