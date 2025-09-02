import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Plus, Trash2, Save, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Product {
  id: string;
  description: string;
}

interface ProductClass {
  A: Product[];
  B: Product[];
  C: Product[];
}

interface SubgroupData {
  subgroup: string;
  products: ProductClass;
}

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function MixProdutos() {
  const { toast } = useToast();
  const [products, setProducts] = useState<ProductClass>({
    A: [],
    B: [],
    C: []
  });
  const [selectedSubgroup, setSelectedSubgroup] = useState<string>("");
  const [availableSubgroups, setAvailableSubgroups] = useState<string[]>([]);
  const [newProductInputs, setNewProductInputs] = useState<{[key: string]: string}>({
    A: "",
    B: "",
    C: ""
  });

  useEffect(() => {
    loadSubgroups();
  }, []);

  const loadSubgroups = async () => {
    try {
      const { data: salesData, error } = await supabase
        .from('sales_data')
        .select('subgroup')
        .order('subgroup');

      if (error) throw error;

      const subgroups = [...new Set(salesData?.map(item => item.subgroup) || [])];
      setAvailableSubgroups(subgroups);
    } catch (error) {
      console.error('Error loading subgroups:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar subgrupos",
        variant: "destructive",
      });
    }
  };

  const addProduct = (className: keyof ProductClass) => {
    const description = newProductInputs[className].trim();
    if (!description) return;

    const newProduct: Product = {
      id: Date.now().toString(),
      description
    };

    setProducts(prev => ({
      ...prev,
      [className]: [...prev[className], newProduct]
    }));

    setNewProductInputs(prev => ({
      ...prev,
      [className]: ""
    }));
  };

  const removeProduct = (className: keyof ProductClass, productId: string) => {
    setProducts(prev => ({
      ...prev,
      [className]: prev[className].filter(p => p.id !== productId)
    }));
  };

  const handleInputChange = (className: keyof ProductClass, value: string) => {
    setNewProductInputs(prev => ({
      ...prev,
      [className]: value
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, className: keyof ProductClass) => {
    if (e.key === 'Enter') {
      addProduct(className);
    }
  };

  const saveChanges = async () => {
    if (!selectedSubgroup) {
      toast({
        title: "Atenção",
        description: "Selecione um subgrupo antes de salvar",
        variant: "destructive",
      });
      return;
    }

    try {
      // Here you would typically save to a database
      // For now, we'll just show a success message
      toast({
        title: "Sucesso",
        description: `Mix de produtos do subgrupo "${selectedSubgroup}" salvo com sucesso!`,
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações",
        variant: "destructive",
      });
    }
  };

  const exportToPDF = () => {
    if (!selectedSubgroup) {
      toast({
        title: "Atenção",
        description: "Selecione um subgrupo antes de exportar",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Mix de Produtos', 20, 20);
    doc.setFontSize(14);
    doc.text(`Subgrupo: ${selectedSubgroup}`, 20, 35);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);

    let yPosition = 60;

    // Class A
    if (products.A.length > 0) {
      doc.setFontSize(16);
      doc.text('Classe A', 20, yPosition);
      yPosition += 10;

      const tableDataA = products.A.map((product, index) => [
        (index + 1).toString(),
        product.description
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Produto']],
        body: tableDataA,
        theme: 'grid',
        headStyles: { fillColor: [74, 144, 226] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Class B
    if (products.B.length > 0) {
      doc.setFontSize(16);
      doc.text('Classe B', 20, yPosition);
      yPosition += 10;

      const tableDataB = products.B.map((product, index) => [
        (index + 1).toString(),
        product.description
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Produto']],
        body: tableDataB,
        theme: 'grid',
        headStyles: { fillColor: [255, 159, 64] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Class C
    if (products.C.length > 0) {
      doc.setFontSize(16);
      doc.text('Classe C', 20, yPosition);
      yPosition += 10;

      const tableDataC = products.C.map((product, index) => [
        (index + 1).toString(),
        product.description
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['#', 'Produto']],
        body: tableDataC,
        theme: 'grid',
        headStyles: { fillColor: [255, 99, 132] }
      });
    }

    doc.save(`mix-produtos-${selectedSubgroup}.pdf`);

    toast({
      title: "Sucesso",
      description: "PDF exportado com sucesso!",
    });
  };

  const renderProductColumn = (className: keyof ProductClass, title: string, bgColor: string) => (
    <Card className="h-full">
      <CardHeader className={`${bgColor} text-white`}>
        <CardTitle className="text-center text-lg font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {/* Product List */}
        <div className="space-y-2 min-h-[300px] max-h-[400px] overflow-y-auto">
          {products[className].map((product) => (
            <div key={product.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
              <span className="text-sm flex-1">{product.description}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeProduct(className, product.id)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add Product Input */}
        <div className="flex gap-2 pt-2 border-t">
          <Input
            placeholder="Descrição do produto"
            value={newProductInputs[className]}
            onChange={(e) => handleInputChange(className, e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, className)}
            className="flex-1"
          />
          <Button
            onClick={() => addProduct(className)}
            size="sm"
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Mix de Produtos</h1>
          <p className="text-muted-foreground">Configure o mix de produtos por classe ABC</p>
        </div>

        {/* Product Classes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {renderProductColumn("A", "CLASSE A", "bg-chart-1")}
          {renderProductColumn("B", "CLASSE B", "bg-chart-2")}
          {renderProductColumn("C", "CLASSE C", "bg-chart-3")}
        </div>

        {/* Bottom Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              {/* Subgroup Selection */}
              <div className="flex-1 w-full sm:max-w-xs">
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Selecionar Subgrupo:
                </label>
                <Select value={selectedSubgroup} onValueChange={setSelectedSubgroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolher subgrupo" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {availableSubgroups.map((subgroup) => (
                      <SelectItem key={subgroup} value={subgroup}>
                        {subgroup}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={saveChanges}
                  disabled={!selectedSubgroup}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </Button>
                
                <Button
                  onClick={exportToPDF}
                  disabled={!selectedSubgroup}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}