import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

interface ExcelData {
  quantitySold: number;
  valueBrl: number;
  profitBrl: number;
  quantityPercentage: number;
  valuePercentage: number;
  profitPercentage: number;
}

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [store, setStore] = useState("");
  const [subgroup, setSubgroup] = useState("");
  const [session, setSession] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const months = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" }
  ];

  const years = [
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
    { value: "2027", label: "2027" },
    { value: "2028", label: "2028" },
    { value: "2029", label: "2029" },
    { value: "2030", label: "2030" }
  ];

  const stores = [
    "LOJA 01", "LOJA 02", "LOJA 05", "LOJA 07", "LOJA 08", "LOJA 09"
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo Excel (.xlsx ou .xls)",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const processExcelFile = async (file: File): Promise<ExcelData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Get the range and convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: 0 });
          
          // Skip header row (index 0) and process data
          const dataRows = jsonData.slice(1) as any[][];
          
          let quantitySold = 0;    // Column C (index 2)
          let valueBrl = 0;        // Column D (index 3)  
          let profitBrl = 0;       // Column H (index 7)
          let quantityPercentage = 0; // Column I (index 8)
          let valuePercentage = 0;    // Column J (index 9)
          let profitPercentage = 0;   // Column K (index 10)

          dataRows.forEach((row) => {
            if (row.length >= 11) { // Ensure we have at least 11 columns (A-K)
              quantitySold += Number(row[2]) || 0;
              valueBrl += Number(row[3]) || 0;
              profitBrl += Number(row[7]) || 0;
              quantityPercentage += Number(row[8]) || 0;
              valuePercentage += Number(row[9]) || 0;
              profitPercentage += Number(row[10]) || 0;
            }
          });

          resolve({
            quantitySold,
            valueBrl,
            profitBrl,
            quantityPercentage,
            valuePercentage,
            profitPercentage
          });
        } catch (error) {
          reject(new Error("Erro ao processar arquivo Excel"));
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !month || !year || !store || !subgroup || !session) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos e selecione um arquivo",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Process Excel file
      const excelData = await processExcelFile(file);
      
      // Insert into Supabase
      const { error } = await supabase
        .from('sales_data')
        .insert({
          month,
          session,
          group: subgroup, // Using subgroup as group since we removed the group field
          subgroup,
          store,
          quantity_sold: excelData.quantitySold,
          value_brl: excelData.valueBrl,
          profit_brl: excelData.profitBrl,
          quantity_percentage: excelData.quantityPercentage,
          value_percentage: excelData.valuePercentage,
          profit_percentage: excelData.profitPercentage
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Upload realizado com sucesso!",
        description: "Os dados foram processados e salvos no banco de dados.",
        variant: "default"
      });

      // Reset form
      setFile(null);
      setMonth("");
      setYear("");
      setStore("");
      setSubgroup("");
      setSession("");
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Error processing upload:', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao processar o arquivo. Verifique se o formato está correto.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg border-0 bg-gradient-card">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Upload de Dados de Vendas</CardTitle>
          <CardDescription className="text-lg">
            Faça upload do arquivo Excel com os dados de vendas para análise
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload" className="text-sm font-medium">
                Arquivo Excel (.xlsx ou .xls)
              </Label>
              <div className="relative">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {file && (
                  <div className="mt-2 flex items-center text-sm text-success">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {file.name}
                  </div>
                )}
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="month">Mês</Label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Ano</Label>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y.value} value={y.value}>
                        {y.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store">Loja</Label>
                <Select value={store} onValueChange={setStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a loja" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session">Sessão</Label>
                <Input
                  id="session"
                  placeholder="Ex: Sessão A"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subgroup">Subgrupo</Label>
                <Input
                  id="subgroup"
                  placeholder="Ex: Smartphones"
                  value={subgroup}
                  onChange={(e) => setSubgroup(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium py-3"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload e Processar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}