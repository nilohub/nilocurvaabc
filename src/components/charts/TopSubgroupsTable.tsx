import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

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

interface TopSubgroupsTableProps {
  data: SalesData[];
}

export function TopSubgroupsTable({ data }: TopSubgroupsTableProps) {
  // Group data by subgroup and sum profit
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.subgroup]) {
      acc[item.subgroup] = {
        profit: 0,
        quantity: 0,
        revenue: 0
      };
    }
    acc[item.subgroup].profit += item.profit_brl || 0;
    acc[item.subgroup].quantity += item.quantity_sold || 0;
    acc[item.subgroup].revenue += item.value_brl || 0;
    return acc;
  }, {} as Record<string, { profit: number; quantity: number; revenue: number }>);

  // Sort by profit and take top 5
  const topSubgroups = Object.entries(groupedData)
    .sort(([,a], [,b]) => b.profit - a.profit)
    .slice(0, 5)
    .map(([subgroup, data], index) => ({
      rank: index + 1,
      subgroup,
      ...data
    }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="h-4 w-4 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    switch (rank) {
      case 1:
        return "default";
      case 2:
        return "secondary";
      case 3:
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card className="shadow-card border-0 bg-gradient-card">
      <CardHeader>
        <CardTitle>Top 5 Subgrupos por Lucro</CardTitle>
        <CardDescription>
          Ranking dos subgrupos com maior lucro total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Subgrupo</TableHead>
              <TableHead className="text-right">Lucro (BRL)</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Faturamento (BRL)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topSubgroups.map((item) => (
              <TableRow key={item.subgroup}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRankIcon(item.rank)}
                    <Badge variant={getRankBadgeVariant(item.rank)}>
                      #{item.rank}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{item.subgroup}</TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  R$ {item.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right">
                  {item.quantity.toLocaleString('pt-BR')} un.
                </TableCell>
                <TableCell className="text-right">
                  R$ {item.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {topSubgroups.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum dado disponível para exibir</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}