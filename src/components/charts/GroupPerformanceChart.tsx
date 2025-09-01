import { Bar } from "react-chartjs-2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

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

interface GroupPerformanceChartProps {
  data: SalesData[];
}

export function GroupPerformanceChart({ data }: GroupPerformanceChartProps) {
  // Agrupar dados por subgrupo
  const groupedData = data.reduce((acc, item) => {
    const key = item.subgroup;
    if (!acc[key]) {
      acc[key] = {
        subgroup: key,
        totalRevenue: 0,
        totalProfit: 0,
        totalQuantity: 0,
      };
    }
    acc[key].totalRevenue += item.value_brl;
    acc[key].totalProfit += item.profit_brl;
    acc[key].totalQuantity += item.quantity_sold;
    return acc;
  }, {} as Record<string, any>);

  const groupArray = Object.values(groupedData).sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

  // Calcular margem de lucro para cada grupo
  const groupsWithMargin = groupArray.map((group: any) => ({
    ...group,
    marginPercentage: group.totalRevenue > 0 ? (group.totalProfit / group.totalRevenue) * 100 : 0,
    profitPerUnit: group.totalQuantity > 0 ? group.totalProfit / group.totalQuantity : 0,
  }));

  // Encontrar destaques
  const highestMargin = groupsWithMargin.reduce((prev, current) => 
    (prev.marginPercentage > current.marginPercentage) ? prev : current
  );
  
  const highestVolume = groupsWithMargin.reduce((prev, current) => 
    (prev.totalRevenue > current.totalRevenue) ? prev : current
  );
  
  const mostEfficient = groupsWithMargin.reduce((prev, current) => 
    (prev.profitPerUnit > current.profitPerUnit) ? prev : current
  );

  const labels = groupArray.map((group: any) => group.subgroup);
  const revenueData = groupArray.map((group: any) => group.totalRevenue);
  const profitData = groupArray.map((group: any) => group.totalProfit);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Faturamento (R$)",
        data: revenueData,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "rgba(0, 0, 0, 1)",
        borderWidth: 1,
      },
      {
        label: "Lucro (R$)",
        data: profitData,
        backgroundColor: "rgba(107, 114, 128, 0.8)",
        borderColor: "rgba(107, 114, 128, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          }
        }
      },
    },
    interaction: {
      intersect: false,
    },
  };

  return (
    <Card className="shadow-card border-0">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Performance por Grupo de Produtos</CardTitle>
        <CardDescription>
          Comparativo de faturamento, lucro e margem por categoria
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 mb-6">
          <Bar data={chartData} options={options} />
        </div>
        
        {/* Cards de destaque */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-green-800 mb-2">Maior Margem</h3>
              <p className="text-lg font-bold text-green-900">{highestMargin.subgroup}</p>
              <p className="text-sm text-green-700">{highestMargin.marginPercentage.toFixed(1)}% de margem</p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Maior Volume</h3>
              <p className="text-lg font-bold text-blue-900">{highestVolume.subgroup}</p>
              <p className="text-sm text-blue-700">R$ {highestVolume.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Mais Eficiente</h3>
              <p className="text-lg font-bold text-purple-900">{mostEfficient.subgroup}</p>
              <p className="text-sm text-purple-700">R$ {mostEfficient.profitPerUnit.toFixed(2)} lucro/unidade</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}