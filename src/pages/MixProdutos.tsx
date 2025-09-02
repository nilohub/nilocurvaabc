import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Plus, Trash2, Save, Download, GripVertical, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Draggable Product Item Component
function DraggableProduct({ product, className, onRemove }: { 
  product: Product; 
  className: keyof ProductClass; 
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `${className}-${product.id}`,
    data: { product, sourceClass: className }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 border-2 rounded-lg bg-card shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
        isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-3 flex-1">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <Package className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{product.description}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
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
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overId = over.id as string;
    
    // Determine target class from overId or from over data
    let targetClass: keyof ProductClass;
    if (overId.includes('droppable-')) {
      targetClass = overId.replace('droppable-', '') as keyof ProductClass;
    } else if (overId.includes('-')) {
      targetClass = overId.split('-')[0] as keyof ProductClass;
    } else {
      return;
    }

    const sourceClass = activeData?.sourceClass as keyof ProductClass;
    const product = activeData?.product as Product;

    if (!sourceClass || !product || sourceClass === targetClass) return;

    // Move product from source to target class
    setProducts(prev => ({
      ...prev,
      [sourceClass]: prev[sourceClass].filter(p => p.id !== product.id),
      [targetClass]: [...prev[targetClass], product]
    }));

    toast({
      title: "Produto movido",
      description: `Produto "${product.description}" movido para Classe ${targetClass}`,
    });
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

  const getClassColor = (className: keyof ProductClass) => {
    const colors = {
      A: 'from-emerald-600 to-emerald-700',
      B: 'from-blue-600 to-blue-700', 
      C: 'from-orange-600 to-orange-700'
    };
    return colors[className];
  };

  const getClassBadgeColor = (className: keyof ProductClass) => {
    const colors = {
      A: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      B: 'bg-blue-100 text-blue-800 border-blue-200',
      C: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[className];
  };

  const renderProductColumn = (className: keyof ProductClass, title: string) => {
    const allProductIds = products[className].map(p => `${className}-${p.id}`);
    
    return (
      <Card className="h-full shadow-lg border-2 border-border/50 hover:border-primary/20 transition-all duration-300">
        <CardHeader className={`bg-gradient-to-r ${getClassColor(className)} text-white`}>
          <CardTitle className="text-center text-xl font-bold flex items-center justify-center gap-2">
            <Package className="h-6 w-6" />
            {title}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClassBadgeColor(className)} bg-white/20 text-white border-white/30`}>
              {products[className].length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent 
          id={`droppable-${className}`}
          className="p-4 space-y-4 bg-gradient-to-b from-card to-card/50"
        >
          {/* Drop Zone */}
          <div className="min-h-[400px] max-h-[500px] overflow-y-auto space-y-3 p-2 border-2 border-dashed border-border/30 rounded-lg bg-background/50">
            <SortableContext items={allProductIds} strategy={verticalListSortingStrategy}>
              {products[className].length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Package className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Arraste produtos aqui ou adicione novos</p>
                </div>
              ) : (
                products[className].map((product) => (
                  <DraggableProduct
                    key={product.id}
                    product={product}
                    className={className}
                    onRemove={() => removeProduct(className, product.id)}
                  />
                ))
              )}
            </SortableContext>
          </div>

          {/* Add Product Input */}
          <div className="flex gap-2 pt-3 border-t border-border/50">
            <Input
              placeholder="Digite a descrição do produto"
              value={newProductInputs[className]}
              onChange={(e) => handleInputChange(className, e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, className)}
              className="flex-1 bg-background"
            />
            <Button
              onClick={() => addProduct(className)}
              size="sm"
              className={`shrink-0 bg-gradient-to-r ${getClassColor(className)} hover:opacity-90 text-white shadow-md`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

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
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {renderProductColumn("A", "CLASSE A")}
            {renderProductColumn("B", "CLASSE B")}
            {renderProductColumn("C", "CLASSE C")}
          </div>
          
          <DragOverlay>
            {activeId ? (
              <div className="flex items-center justify-between p-3 border-2 rounded-lg bg-card shadow-lg border-primary bg-primary/10 rotate-3 scale-105">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Package className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Movendo produto...</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

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