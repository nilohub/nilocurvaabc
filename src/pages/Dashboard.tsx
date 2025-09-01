import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DataTable } from "@/components/DataTable";
import { ProfitChart } from "@/components/charts/ProfitChart";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { QuantityChart } from "@/components/charts/QuantityChart";
import { SalesChart } from "@/components/charts/SalesChart";
import { StoreDistributionChart } from "@/components/charts/StoreDistributionChart";
import { TopSubgroupsTable } from "@/components/charts/TopSubgroupsTable";
import { ProfitBRLChart } from "@/components/charts/ProfitBRLChart";
import { AdvancedAnalytics } from "@/components/charts/AdvancedAnalytics";
import { SeasonalityChart } from "@/components/charts/SeasonalityChart";
import { GroupPerformanceComparison } from "@/components/charts/GroupPerformanceComparison";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function Dashboard() {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const { data, error } = await supabase
        .from("sales_data")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSalesData(data || []);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de vendas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-text bg-clip-text text-transparent mb-2">
            Dashboard de Vendas
          </h1>
          <p className="text-muted-foreground text-lg">
            Análises avançadas e insights de performance
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="advanced">Análises Avançadas</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="data">Dados</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProfitBRLChart data={salesData} />
              <StoreDistributionChart data={salesData} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RevenueChart data={salesData} />
              <ProfitChart data={salesData} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <QuantityChart data={salesData} />
              <TopSubgroupsTable data={salesData} />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-8">
            <AdvancedAnalytics data={salesData} />
            <SeasonalityChart data={salesData} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-8">
            <GroupPerformanceComparison data={salesData} />
            <SalesChart data={salesData} />
          </TabsContent>

          <TabsContent value="data" className="space-y-8">
            <DataTable data={salesData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}